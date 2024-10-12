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
exports.GEMINI_KEY = void 0;
const generative_ai_1 = require("@google/generative-ai");
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const cors_1 = __importDefault(require("cors"));
exports.GEMINI_KEY = "AIzaSyDvHS4B8wGsn5mqGLsi2tBRBI_iwBW7Q-M";
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const googleGenerativeAI = new generative_ai_1.GoogleGenerativeAI(exports.GEMINI_KEY);
const model = googleGenerativeAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const message_schemma = zod_1.z.object({
    message: zod_1.z.string().optional(),
    sender: zod_1.z.string().default("me"),
});
let chatSession = null;
let messages = [];
function run(prompt) {
    return __awaiter(this, void 0, void 0, function* () {
        let Messageresult = yield chatSession.sendMessage(prompt);
        const response = yield Messageresult.response;
        const text = response.text();
        messages = [...messages, { message: text, sender: "gemini" }];
        return { sender: "gemini", message: text.replace(/\*/g, ''), };
    });
}
app.get('/', (req, res) => {
    res.send('Hello World');
});
app.post('/message', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const body = message_schemma.parse(req.body);
        console.log(body);
        const response = yield run(body.message);
        res.status(200).json(response);
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            console.log(error.errors);
            res.status(400).json({ error: error.errors });
        }
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }
}));
app.listen(3000, () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const chat = yield model.startChat({
        generationConfig: {
            responseMimeType: "text/plain",
            temperature: 1
        }
    });
    chatSession = chat;
    const res = yield (chat === null || chat === void 0 ? void 0 : chat.sendMessage("voce é um assistente que vai me ajudar a estudar,dê um exemplo, responda de forma direta e formal"));
    const candidates = yield res.response.candidates;
    const text = yield res.response.text();
    console.log((_a = candidates[0].content.parts[0].text) === null || _a === void 0 ? void 0 : _a.replace(/\*/g, ''));
    console.log('Server is running on port 3000');
}));
