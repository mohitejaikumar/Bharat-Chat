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
exports.PDFBot = void 0;
const pdf_1 = require("@langchain/community/document_loaders/fs/pdf");
const textsplitters_1 = require("@langchain/textsplitters");
const memory_1 = require("langchain/vectorstores/memory");
const openai_1 = require("@langchain/openai");
const openai_2 = require("@langchain/openai");
const document_1 = require("langchain/util/document");
const runnables_1 = require("@langchain/core/runnables");
const output_parsers_1 = require("@langchain/core/output_parsers");
const hub_1 = require("langchain/hub");
const textSplitter = new textsplitters_1.RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
});
class PDFBot {
    constructor() {
        this.users = {};
        this.model = new openai_2.ChatOpenAI({
            model: "gpt-4o-mini",
            temperature: 0
        });
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new PDFBot();
        }
        return this.instance;
    }
    addUser(phone_number) {
        if (!this.users[phone_number]) {
            this.users[phone_number] = [];
        }
    }
    loadPDF(phone_number, filePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const loader = new pdf_1.PDFLoader(filePath);
            try {
                const docs = yield loader.load();
                const splits = yield textSplitter.splitDocuments(docs);
                const vectorstore = yield memory_1.MemoryVectorStore.fromDocuments(splits, new openai_1.OpenAIEmbeddings());
                this.users[phone_number].push(vectorstore);
            }
            catch (err) {
                console.log("SERVER ERROR");
            }
        });
    }
    startNewSession(phone_number) {
        return __awaiter(this, void 0, void 0, function* () {
            this.users[phone_number] = [];
        });
    }
    getAnswer(question, phone_number) {
        return __awaiter(this, void 0, void 0, function* () {
            let answer = "";
            const prompt = yield (0, hub_1.pull)("rlm/rag-prompt");
            try {
                for (const store of this.users[phone_number]) {
                    const retriever = store.asRetriever();
                    const declarativeRagChain = runnables_1.RunnableSequence.from([
                        {
                            context: retriever.pipe(document_1.formatDocumentsAsString),
                            question: new runnables_1.RunnablePassthrough(),
                        },
                        prompt,
                        this.model,
                        new output_parsers_1.StringOutputParser(),
                    ]);
                    answer += yield declarativeRagChain.invoke(question);
                }
            }
            catch (err) {
                console.log(err);
                console.log("SERVER ERROR");
            }
            return answer;
        });
    }
}
exports.PDFBot = PDFBot;
