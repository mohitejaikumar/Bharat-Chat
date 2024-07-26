import { ChatBot } from "./ChatBot";
import { PDFBot } from "./PDFBot";

interface User{
    id:number;
    phone_number:string;
    name:string;
    lastStart:string;
}

export class UserManager{
    private numberofUsers:number;
    private users:Map<string,User>;
    private static instance:UserManager;

    private  constructor(){
        this.numberofUsers=0;
        this.users=new Map<string,User>();
    }

    public static getInstance(){
        if(!this.instance){
            this.instance=new UserManager();
        }
        return this.instance;
    }

    addUser(phone_number:string,name:string,lastStart:string){
        this.numberofUsers++;
        this.users.set(phone_number,{
            id:this.numberofUsers,
            phone_number:phone_number,
            name:name,
            lastStart:lastStart
        })
        ChatBot.getInstance().addUser(phone_number,name);
        PDFBot.getInstance().addUser(phone_number);
    }

    getUser(phone_number:string){
        return this.users.get(phone_number) || null;
    }


}