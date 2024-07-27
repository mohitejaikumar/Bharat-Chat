"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
const ChatBot_1 = require("./ChatBot");
const PDFBot_1 = require("./PDFBot");
class UserManager {
    constructor() {
        this.numberofUsers = 0;
        this.users = new Map();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new UserManager();
        }
        return this.instance;
    }
    addUser(phone_number, name, lastStart) {
        this.numberofUsers++;
        this.users.set(phone_number, {
            id: this.numberofUsers,
            phone_number: phone_number,
            name: name,
            lastStart: lastStart
        });
        ChatBot_1.ChatBot.getInstance().addUser(phone_number, name);
        PDFBot_1.PDFBot.getInstance().addUser(phone_number);
    }
    getUser(phone_number) {
        return this.users.get(phone_number) || null;
    }
}
exports.UserManager = UserManager;
