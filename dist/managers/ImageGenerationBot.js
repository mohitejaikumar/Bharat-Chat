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
exports.ImageGenerationBot = void 0;
const openai_1 = require("@langchain/openai");
class ImageGenerationBot {
    constructor() {
        this.model = new openai_1.DallEAPIWrapper({
            n: 1, // Default
            model: "dall-e-3", // Default
            apiKey: process.env.OPENAI_API_KEY, // Default
        });
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new ImageGenerationBot();
        }
        return this.instance;
    }
    generateImage(prompt) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.invoke(prompt);
        });
    }
}
exports.ImageGenerationBot = ImageGenerationBot;
