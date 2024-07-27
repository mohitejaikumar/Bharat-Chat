import { DallEAPIWrapper } from "@langchain/openai";


export class ImageGenerationBot{

    private static instance: ImageGenerationBot;
    private model:DallEAPIWrapper;
    private constructor(){

    this.model = new DallEAPIWrapper({
            n: 1, // Default
            model: "dall-e-3", // Default
            apiKey: process.env.OPENAI_API_KEY, // Default
    });
    }

    public static getInstance(){
        if(!this.instance){
            this.instance = new ImageGenerationBot();
        }
        return this.instance;
    }

    async generateImage(prompt:string){
        return await this.model.invoke(prompt);
    }
}