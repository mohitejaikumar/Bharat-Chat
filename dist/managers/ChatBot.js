"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatBot = void 0;
const chat_history_1 = require("@langchain/core/chat_history");
const prompts_1 = require("@langchain/core/prompts");
const runnables_1 = require("@langchain/core/runnables");
const openai_1 = require("@langchain/openai");
const runnables_2 = require("@langchain/core/runnables");
const messages_1 = require("@langchain/core/messages");
const messages_2 = require("@langchain/core/messages");
class ChatBot {
    constructor() {
        this.usersMessages = {};
        this.prompt = prompts_1.ChatPromptTemplate.fromMessages([
            [
                "system",
                `You are a helpful assistant who remembers all details the user shares with you.`,
            ],
            ["placeholder", "{chat_history}"],
            ["human", "{input}"],
        ]);
        this.chatMessageToTake = 20;
        this.model = new openai_1.ChatOpenAI({
            model: "gpt-4o-mini",
            temperature: 0
        });
        this.chain = runnables_1.RunnableSequence.from([
            runnables_1.RunnablePassthrough.assign({
                //@ts-ignore
                chat_history: this.filterMessages,
            }),
            this.prompt,
            this.model,
        ]);
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new ChatBot();
        }
        return this.instance;
    }
    filterMessages({ chat_history }) {
        return chat_history.slice(-1 * this.chatMessageToTake);
    }
    ;
    addUser(phone_number, name) {
        this.usersMessages[phone_number] = {
            sessionId: 0,
            messages: {}
        };
    }
    startNewSession(phone_number, name) {
        if (this.usersMessages[phone_number]) {
            const messages = [
                new messages_1.HumanMessage({ content: `Hello my name is ${name}` }),
                new messages_2.AIMessage({ content: "Hello" }),
            ];
            const newSessionId = this.usersMessages[phone_number].sessionId++;
            this.usersMessages[phone_number].sessionId = newSessionId;
            this.usersMessages[phone_number].messages[newSessionId] = new chat_history_1.InMemoryChatMessageHistory(messages);
        }
    }
    getReply(message, phone_number) {
        return __awaiter(this, void 0, void 0, function* () {
            const sessionId = String(this.usersMessages[phone_number].sessionId);
            const withMessageHistory = new runnables_2.RunnableWithMessageHistory({
                runnable: this.chain,
                getMessageHistory: (sessionId) => __awaiter(this, void 0, void 0, function* () {
                    return this.usersMessages[phone_number].messages[sessionId];
                }),
                inputMessagesKey: "input",
                historyMessagesKey: "chat_history",
            });
            const config = {
                configurable: {
                    sessionId: sessionId,
                },
            };
            try {
                const response = yield withMessageHistory.invoke({
                    input: message
                }, config);
                // console.log(response.content);
                return response.content;
            }
            catch (e) {
                console.error(e);
                return 'SERVER ERROR';
            }
        });
    }
}
exports.ChatBot = ChatBot;
