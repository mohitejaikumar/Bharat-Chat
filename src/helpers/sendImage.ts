
import axios from "axios";

export async function sendImage(business_phone_number_id:string,phone_number:string,url:string){
    try{
        await axios({
            method: "POST",
            url: `${process.env.GRAPH_URL}/${business_phone_number_id}/messages`,
            headers: {
                Authorization: `Bearer ${process.env.GRAPH_API_TOKEN}`,
            },
            data: {
                messaging_product: "whatsapp",
                recipient_type: "individual",
                to: phone_number,
                type:"image",
                image:{
                    link:url
                }
                
            },
    });
    } catch(err){
        console.log(err);
        console.log("Error sending image");
    }
    
}