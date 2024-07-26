import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import type { BaseMessage } from "@langchain/core/messages";
import {RunnablePassthrough,RunnableSequence} from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { HumanMessage } from "@langchain/core/messages";
import { AIMessage } from "@langchain/core/messages";

interface SessionStore{
    sessionId:number;
    messages:Record<string,InMemoryChatMessageHistory>;
}

export class ChatBot{

    private static instance:ChatBot;
    private usersMessages:Record<string,SessionStore>;
    private prompt:any;
    private chatMessageToTake:number;
    private model:ChatOpenAI;
    private chain;

    private constructor(){
        this.usersMessages={};
        this.prompt = ChatPromptTemplate.fromMessages([
            [
                "system",
                `You are a helpful assistant who remembers all details the user shares with you.`,
            ],
            ["placeholder", "{chat_history}"],
            ["human", "{input}"],
        ]);
        this.chatMessageToTake=20;
        this.model = new ChatOpenAI({
            model: "gpt-4o-mini",
            temperature: 0
        });
        this.chain = RunnableSequence.from([
            RunnablePassthrough.assign({
                //@ts-ignore
                chat_history: this.filterMessages,
            }),
            this.prompt,
            this.model,
        ]);
    }

    public static getInstance(){
        if(!this.instance){
            this.instance=new ChatBot();
        }
        return this.instance;
    }

    filterMessages({ chat_history }: { chat_history: BaseMessage[] }){
    return chat_history.slice(-1*this.chatMessageToTake);
    };

    addUser(phone_number:string,name:string){
        
        this.usersMessages[phone_number]={
            sessionId:0,
            messages:{}
        };
    }

    startNewSession(phone_number:string,name:string){    
        if(this.usersMessages[phone_number]){
            const messages = [
                new HumanMessage({ content: `Hello my name is ${name}`  }),
                new AIMessage({ content: "Hello" }),
            ];
            const newSessionId = this.usersMessages[phone_number].sessionId++;
            this.usersMessages[phone_number].sessionId=newSessionId;
            this.usersMessages[phone_number].messages[newSessionId] = new InMemoryChatMessageHistory(messages);
        }
    }

    async getReply(message:string,phone_number:string){
        const sessionId = String(this.usersMessages[phone_number].sessionId);
        const withMessageHistory = new RunnableWithMessageHistory({
            runnable:this.chain,
            getMessageHistory:async (sessionId)=>{
                return this.usersMessages[phone_number].messages[sessionId];
            },
            inputMessagesKey:"input",
            historyMessagesKey:"chat_history",
        })
        const config = {
            configurable: {
                sessionId: sessionId,
            },
        };
        try{
            const response = await withMessageHistory.invoke(
                {
                    input:message
                },
                config,
            )
            // console.log(response.content);
            return response.content;
        }
        catch(e){
            console.error(e);
            return 'SERVER ERROR';
        }
        
    }

}