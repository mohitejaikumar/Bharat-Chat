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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const UserManager_1 = require("./managers/UserManager");
const sendMessage_1 = require("./helpers/sendMessage");
const ChatBot_1 = require("./managers/ChatBot");
const formatMath_1 = require("./helpers/formatMath");
const PDFBot_1 = require("./managers/PDFBot");
const sendImage_1 = require("./helpers/sendImage");
const deleteFile_1 = require("./helpers/deleteFile");
const ImageGenerationBot_1 = require("./managers/ImageGenerationBot");
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const { WEBHOOK_VERIFY_TOKEN, GRAPH_API_TOKEN, PORT } = process.env;
const userManager = UserManager_1.UserManager.getInstance();
app.post("/webhook", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o;
    // log incoming messages
    console.log("Incoming webhook message:", JSON.stringify(req.body, null, 2));
    const message = (_e = (_d = (_c = (_b = (_a = req.body.entry) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.changes[0]) === null || _c === void 0 ? void 0 : _c.value) === null || _d === void 0 ? void 0 : _d.messages) === null || _e === void 0 ? void 0 : _e[0];
    const business_phone_number_id = (_j = (_h = (_g = (_f = req.body.entry) === null || _f === void 0 ? void 0 : _f[0].changes) === null || _g === void 0 ? void 0 : _g[0].value) === null || _h === void 0 ? void 0 : _h.metadata) === null || _j === void 0 ? void 0 : _j.phone_number_id;
    const userName = ((_o = (_m = (_l = (_k = req.body.entry) === null || _k === void 0 ? void 0 : _k[0].changes) === null || _l === void 0 ? void 0 : _l[0].contacts) === null || _m === void 0 ? void 0 : _m[0].profile) === null || _o === void 0 ? void 0 : _o.name) || "";
    console.log("userName", userName);
    // check if the incoming message contains text
    if ((message === null || message === void 0 ? void 0 : message.type) === "text") {
        // Check if it is a new User 
        const user = userManager.getUser(message.from);
        if (user === null) {
            // Add the user to the list
            if (message.text.body !== "/START_TEXT" && message.text.body !== "/START_PDF" && message.text.body !== "/START_IMAGE") {
                yield (0, sendMessage_1.sendMessage)(business_phone_number_id, message.from, message.id, `Please type any of the following commands : \n 1. /START_TEXT  \n 2. /START_PDF \n 3. /START_IMAGE`);
            }
            else {
                userManager.addUser(message.from, userName, message.text.body);
                if (message.text.body === "/START_TEXT") {
                    ChatBot_1.ChatBot.getInstance().startNewSession(message.from, userName);
                    yield (0, sendMessage_1.sendMessage)(business_phone_number_id, message.from, message.id, "Now you can start the conversation");
                }
                else if (message.text.body === "/START_PDF") {
                    PDFBot_1.PDFBot.getInstance().startNewSession(message.from);
                    yield (0, sendMessage_1.sendMessage)(business_phone_number_id, message.from, message.id, "Please upload the PDF file");
                }
                else if (message.text.body === "/START_IMAGE") {
                    yield (0, sendMessage_1.sendMessage)(business_phone_number_id, message.from, message.id, "Please tell me what kind of image you want to generate");
                }
            }
        }
        else {
            if (message.text.body === "/START_TEXT") {
                user.lastStart = "/START_TEXT";
                ChatBot_1.ChatBot.getInstance().startNewSession(message.from, userName);
                yield (0, sendMessage_1.sendMessage)(business_phone_number_id, message.from, message.id, "Now you can start the conversation");
            }
            else if (message.text.body === "/START_PDF") {
                user.lastStart = "/START_PDF";
                PDFBot_1.PDFBot.getInstance().startNewSession(message.from);
                yield (0, sendMessage_1.sendMessage)(business_phone_number_id, message.from, message.id, "Please upload the PDF file");
            }
            else if (message.text.body === "/START_IMAGE") {
                user.lastStart = "/START_IMAGE";
                yield (0, sendMessage_1.sendMessage)(business_phone_number_id, message.from, message.id, "Please tell me what kind of image you want to generate");
            }
            else if (user.lastStart === "/START_TEXT") {
                // Send to CHatBot 
                const reply = yield ChatBot_1.ChatBot.getInstance().getReply(message.text.body, message.from);
                yield (0, sendMessage_1.sendMessage)(business_phone_number_id, message.from, message.id, (0, formatMath_1.formatMathInText)(reply.toString()));
            }
            else if (user.lastStart === "/START_PDF") {
                // Send to PDFBot
                const reply = yield PDFBot_1.PDFBot.getInstance().getAnswer(message.text.body, message.from);
                yield (0, sendMessage_1.sendMessage)(business_phone_number_id, message.from, message.id, (0, formatMath_1.formatMathInText)(reply.toString()));
            }
            else if (user.lastStart === "/START_IMAGE") {
                // Send to ChatBot
                try {
                    const imageURL = yield ImageGenerationBot_1.ImageGenerationBot.getInstance().generateImage(message.text.body);
                    console.log(imageURL);
                    yield (0, sendImage_1.sendImage)(business_phone_number_id, message.from, imageURL);
                }
                catch (err) {
                    yield (0, sendMessage_1.sendMessage)(business_phone_number_id, message.from, message.id, 'SERVER ERROR');
                }
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
    if ((message === null || message === void 0 ? void 0 : message.type) === "document") {
        // Check if it is a new User 
        const user = userManager.getUser(message.from);
        if (user === null) {
            yield (0, sendMessage_1.sendMessage)(business_phone_number_id, message.from, message.id, `Please type any of the following commands : \n 1. /START_TEXT  \n 2. /START_PDF \n 3. /START_IMAGE`);
        }
        else {
            const FILE_NAME = message === null || message === void 0 ? void 0 : message.document.filename.replace(/ /g, "_");
            if (user.lastStart !== "/START_PDF") {
                yield (0, sendMessage_1.sendMessage)(business_phone_number_id, message.from, message.id, "Please type following command : \n /START_PDF");
            }
            else if (!FILE_NAME.endsWith(".pdf")) {
                yield (0, sendMessage_1.sendMessage)(business_phone_number_id, message.from, message.id, "Please send a PDF file");
            }
            else {
                const MEDIA_ID = message === null || message === void 0 ? void 0 : message.document.id;
                const response = yield (0, axios_1.default)({
                    method: "GET",
                    url: `${process.env.GRAPH_URL}/${MEDIA_ID}/`,
                    headers: {
                        Authorization: `Bearer ${GRAPH_API_TOKEN}`,
                    },
                });
                const URL = response.data.url;
                console.log("URL  ", URL);
                try {
                    const doc_response = yield axios_1.default.get(URL, {
                        headers: {
                            Authorization: `Bearer ${GRAPH_API_TOKEN}`
                        },
                        responseType: 'stream',
                    });
                    const writer = fs_1.default.createWriteStream(FILE_NAME);
                    doc_response.data.pipe(writer);
                    yield new Promise((resolve, reject) => {
                        writer.on('finish', () => resolve(FILE_NAME));
                        writer.on('error', reject);
                    });
                    console.log("file downloaded");
                    // Load PDF
                    yield PDFBot_1.PDFBot.getInstance().loadPDF(message.from, FILE_NAME);
                    yield (0, sendMessage_1.sendMessage)(business_phone_number_id, message.from, message.id, "How can I help you with this PDF?");
                    (0, deleteFile_1.deleteFile)(FILE_NAME);
                }
                catch (err) {
                    // console.log(err);
                    console.log("SERVER ERROR");
                }
            }
        }
    }
    res.sendStatus(200);
}));
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
    }
    else {
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
