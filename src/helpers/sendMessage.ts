
import axios from "axios";

export async function sendMessage(business_phone_number_id:string,phone_number:string,contextId:string,message:string){
    try{
        await axios({
            method: "POST",
            url: `${process.env.GRAPH_URL}/${business_phone_number_id}/messages`,
            headers: {
                Authorization: `Bearer ${process.env.GRAPH_API_TOKEN}`,
            },
            data: {
                messaging_product: "whatsapp",
                to: phone_number,
                text: { body: message },
                context: {
                    message_id: contextId, // shows the message as a reply to the original user message
                },
            },
    });
    } catch(err){
        console.log(err);
        console.log("Error sending message");
    }
    
}