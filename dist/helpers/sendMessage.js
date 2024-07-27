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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = sendMessage;
const axios_1 = __importDefault(require("axios"));
function sendMessage(business_phone_number_id, phone_number, contextId, message) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, axios_1.default)({
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
        }
        catch (err) {
            console.log(err);
            console.log("Error sending message");
        }
    });
}
