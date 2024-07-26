import dotenv from "dotenv";
dotenv.config();
import express from "express";
import axios from "axios";
import fs from "fs";
import { UserManager } from "./managers/UserManager";
import { sendMessage } from "./helpers/sendMessage";
import { ChatBot } from "./managers/ChatBot";
import { formatMathInText } from "./helpers/formatMath";
import { PDFBot } from "./managers/PDFBot";

const app = express();
app.use(express.json());

const { WEBHOOK_VERIFY_TOKEN, GRAPH_API_TOKEN, PORT } = process.env;

const userManager  = UserManager.getInstance();

app.post("/webhook", async (req, res) => {
  // log incoming messages
  // console.log("Incoming webhook message:", JSON.stringify(req.body, null, 2));


  const message = req.body.entry?.[0]?.changes[0]?.value?.messages?.[0];
  const business_phone_number_id = req.body.entry?.[0].changes?.[0].value?.metadata?.phone_number_id;
  const userName = req.body.entry?.[0].changes?.[0].contacts?.[0].profile?.name || "";

  // check if the incoming message contains text
  if (message?.type === "text") {
    
    // Check if it is a new User 
    const user = userManager.getUser(message.from);
    if(user===null){
         // Add the user to the list
        if(message.text.body !== "/START_TEXT" && message.text.body !== "/START_PDF"){
          await sendMessage(business_phone_number_id,message.from,message.id,`Please start with \n /START_TEXT \n or \n /START_PDF`);
        }
        else{
          userManager.addUser(message.from,userName,message.text.body);
          if(message.text.body === "/START_TEXT"){
            ChatBot.getInstance().startNewSession(message.from,userName);
            await sendMessage(business_phone_number_id,message.from,message.id,"Now you can start the conversation");
          }
          else if(message.text.body === "/START_PDF"){
            PDFBot.getInstance().startNewSession(message.from);
            await sendMessage(business_phone_number_id,message.from,message.id,"Please upload the PDF file");
          }
        }
    }
    else{
        if(message.text.body === "/START_TEXT"){
          user.lastStart = "/START_TEXT";
          ChatBot.getInstance().startNewSession(message.from,userName);
          await sendMessage(business_phone_number_id,message.from,message.id,"Now you can start the conversation");
        }
        else if(message.text.body === "/START_PDF"){
          user.lastStart = "/START_PDF";
          PDFBot.getInstance().startNewSession(message.from);
          await sendMessage(business_phone_number_id,message.from,message.id,"Please upload the PDF file");
        }
        else if(user.lastStart === "/START_TEXT"){
            // Send to CHatBot 
            const reply = await ChatBot.getInstance().getReply(message.text.body,message.from);
            await sendMessage(business_phone_number_id,message.from,message.id,formatMathInText(reply.toString()));
        }
        else if(user.lastStart === "/START_PDF"){
            // Send to PDFBot
            const reply = await PDFBot.getInstance().getAnswer(message.text.body,message.from);
            await sendMessage(business_phone_number_id,message.from,message.id,formatMathInText(reply.toString()));
        }
    }
    
    
    // mark incoming message as read
    // await axios({
    //   method: "POST",
    //   url: `${process.env.GRAPH_URL}/${business_phone_number_id}/messages`,
    //   headers: {
    //     Authorization: `Bearer ${GRAPH_API_TOKEN}`,
    //   },
    //   data: {
    //     messaging_product: "whatsapp",
    //     status: "read",
    //     message_id: message.id,
    //   },
    // });

    
  }

  if(message?.type === "document"){

    // Check if it is a new User 
    const user = userManager.getUser(message.from);

    if(user===null){
      await sendMessage(business_phone_number_id,message.from,message.id,`Please start with \n /START_TEXT \n or \n /START_PDF`);
    }
    else{

      const FILE_NAME = message?.document.filename.replace(/ /g,"_");

      if(user.lastStart !== "/START_PDF"){
        await sendMessage(business_phone_number_id,message.from,message.id,"Please start with /START_PDF"); 
      }
      else if(!FILE_NAME.endsWith(".pdf")){
        await sendMessage(business_phone_number_id,message.from,message.id,"Please send a PDF file");
      }
      else{
        const MEDIA_ID = message?.document.id;
        const response = await axios({
          method:"GET",
          url:`${process.env.GRAPH_URL}/${MEDIA_ID}/`,
          headers: {
            Authorization: `Bearer ${GRAPH_API_TOKEN}`,
          },
        });
        const URL = response.data.url;
        console.log("URL  " , URL);
        try{
            const doc_response = await axios.get(URL,{
                    headers:{
                    Authorization: `Bearer ${GRAPH_API_TOKEN}`
                    },
                    responseType: 'stream',
                    })
            const writer = fs.createWriteStream(FILE_NAME);
            doc_response.data.pipe(writer);
            await new Promise((resolve, reject) => {
                writer.on('finish', () => resolve(FILE_NAME));
                writer.on('error', reject);
            });
            console.log("file downloaded");
            // Load PDF
            await PDFBot.getInstance().loadPDF(message.from,FILE_NAME);
            await sendMessage(business_phone_number_id,message.from,message.id,"How can I help you with this PDF?");
        }
        catch(err){
            // console.log(err);
            console.log("SERVER ERROR");
        }
      }
      
    }
    
    
}

res.sendStatus(200);
});

// accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
app.get("/webhook", (req, res) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  // check the mode and token sent are correct
  if (mode === "subscribe" && token === WEBHOOK_VERIFY_TOKEN) {
    // respond with 200 OK and challenge token from the request
    res.status(200).send(challenge);
    console.log("Webhook verified successfully!");
  } else {
    // respond with '403 Forbidden' if verify tokens do not match
    res.sendStatus(403);
  }
});

app.get("/", (req, res) => {
  res.send(`<pre>Nothing to see here.
Checkout README.md to start.</pre>`);
});

app.listen(PORT, () => {
  console.log(`Server is listening on port: ${PORT}`);
});
