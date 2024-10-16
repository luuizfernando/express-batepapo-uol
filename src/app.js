import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import dayjs from 'dayjs';
import joi from 'joi';

const app = express();

app.use(cors());
app.use(express.json());
dotenv.config();

const mongoClient = new MongoClient(process.env.DATABASE_URL);
try {
    await mongoClient.connect();
    console.log("MongoDB conectado!");
} catch (err) {
    console.log(err.message);
}
const db = mongoClient.db();

const agora = dayjs();
const formatado = agora.format('HH:mm:ss');

app.post("/participants", async (req, res) => {
    const { name } = req.body;

    const participantSchema = joi.object({
        name: joi.string().required()
    });
    const validation = participantSchema.validate(req.body, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(422).send(errors);
    }

    const newUser = { name, lastStatus: Date.now() };
    const newMessage = { from: name, to: 'Todos', text: 'entra na sala...', type: 'status', time: `${formatado}` };

    try {
        const participant = await db.collection("participants").findOne({ name });
        if (participant) return res.status(409).send("Esse usuário já existe.");

        await db.collection("participants").insertOne(newUser);

        await db.collection("messages").insertOne(newMessage);
        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get("/participants", async (req, res) => {
    try {
        const participants = await db.collection("participants").find().toArray();
        res.send(participants);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post("/messages", async (req, res) => {
    const from = req.header('User');
    if (!from) return res.status(422).send("'from' é obrigatório.");

    const { to, text, type } = req.body;

    const messageSchema = joi.object({
        to: joi.string().required(),
        text: joi.string().required(),
        type: joi.string().valid('message', 'private_message').required()
    });
    const validation = messageSchema.validate(req.body, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(422).send(errors);
    }

    const newMessage = { from, to, text, type, time: `${formatado}` };

    try {
        const user = await db.collection("participants").findOne({ name: from });
        if (!user) return res.status(404).send("Participante não encontrado.");

        await db.collection("messages").insertOne(newMessage);
        res.sendStatus(201);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.get("/messages", async (req, res) => {

});

app.post("/status", async (req, res) => {
    const { User } = req.headers;

    const headerSchema = joi.object({
        User: joi.string().required()
    });
    const validation = headerSchema.validate(User, { abortEarly: false });
    if (validation.error) {
        const errors = validation.error.details.map(detail => detail.message);
        return res.status(404).send(errors);
    }

    try {

    } catch (err) {

    }
});

app.listen(process.env.PORT, () => { console.log(`Servidor Rodando na porta ${process.env.PORT}.`) });