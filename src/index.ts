import { GoogleGenerativeAI } from '@google/generative-ai';
import express, { Request, Response } from 'express';
import { z } from 'zod';
import { ChatSession } from '@google/generative-ai';
import cors from 'cors'
export const GEMINI_KEY = "AIzaSyD4Fmatsj4326qAu8O-JIKI7lre1inOaBI"


const app = express();
app.use(express.json());
app.use(cors())

const googleGenerativeAI = new GoogleGenerativeAI(GEMINI_KEY);
const model = googleGenerativeAI.getGenerativeModel({ model: "gemini-1.5-flash" })
const message_schemma = z.object({
    message: z.string().optional(),
    sender: z.string().default("me"),
})
type message_type = z.infer<typeof message_schemma>
let chatSession: ChatSession | null = null
let messages: message_type[] = []


async function run(prompt: string | undefined) {
    let Messageresult = await chatSession!.sendMessage(prompt!)
    const response = await Messageresult.response;
    const text = response.text();
    messages = [...messages, { message: text, sender: "gemini" }]
    return { sender: "gemini", message: text.replace(/\*/g, ''), }
}


app.get('/', (req: Request, res: Response) => {
    res.send('Hello World');
})

app.post('/message', async (req: Request, res: Response): Promise<void> => {
    try {
        const body = message_schemma.parse(req.body)
        console.log(body)
        const response = await run(body.message)
        res.status(200).json(response)
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.log(error.errors)
            res.status(400).json({ error: error.errors })
        }
        console.log(error)
        res.status(500).json({ error: "Internal server error" })
    }
})

app.listen(3001, async () => {
    const chat = await model.startChat({
        generationConfig: {
            responseMimeType: "text/plain",
            temperature: 1
        }
    });
    chatSession = chat
    const res = await chat?.sendMessage("voce é um assistente que vai me ajudar a estudar,dê um exemplo, responda de forma direta e formal, eu falo português de portugal, e sempre que é possivel use dados relacionado a angola porque eu sou angolano, se não for possivel use o contexto de portugal") 
    const candidates = await res.response.candidates
    const text = await res.response.text()
    console.log(candidates![0].content.parts[0].text?.replace(/\*/g, ''))
    console.log('Server is running on port 3001');
})