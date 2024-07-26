
import {PDFLoader}from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { ChatOpenAI } from "@langchain/openai";
import { formatDocumentsAsString } from "langchain/util/document";
import {RunnableSequence,RunnablePassthrough} from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { pull } from "langchain/hub";




const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
});

export class PDFBot{

    private static instance: PDFBot;
    private users:Record<string,MemoryVectorStore[]>={};
    private model;
    private constructor(){
        this.model = new ChatOpenAI({
            model: "gpt-4o-mini",
            temperature: 0
        });
        
        
    }

    public static getInstance(){
        if(!this.instance){
            this.instance = new PDFBot();
        }
        
        return this.instance;
    }

    addUser(phone_number:string){
        if(!this.users[phone_number]){
            this.users[phone_number] = [];
        }
    }

    async loadPDF(phone_number:string,filePath:string){
        const loader = new PDFLoader(filePath);
        try{
            const docs = await loader.load();
            const splits = await textSplitter.splitDocuments(docs);
            const vectorstore = await MemoryVectorStore.fromDocuments(
                splits,
                new OpenAIEmbeddings()
            );
            
            this.users[phone_number].push(vectorstore);
        }
        catch(err){
            console.log("SERVER ERROR");
        }
        
    }

    async startNewSession(phone_number:string){
        this.users[phone_number] =[];
    }

    async getAnswer(question:string,phone_number:string){

        let answer = "";
        const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");
        try{
            for(const store of this.users[phone_number]){
            const retriever = store.asRetriever();
            const declarativeRagChain = RunnableSequence.from([
                {
                    context: retriever.pipe(formatDocumentsAsString),
                    question: new RunnablePassthrough(),
                
                },
                prompt,
                this.model,
                new StringOutputParser(),
            ]);
            answer += await declarativeRagChain.invoke(question);
            }
        }catch(err){
            console.log(err);
            console.log("SERVER ERROR");
        }

        return answer;
        
    }



}