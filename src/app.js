import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import dayjs from 'dayjs';

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


    const newUser = { name, lastStatus: Date.now() };
    const newMessage = { from: name, to: 'Todos', text: 'entra na sala...', type: 'status', time: `${formatado}` };

    try {
        const usuario = await db.collection("participants").findOne(newUser);
        if (usuario) return res.status(409).send("Esse usuário já existe.");

        await db.collection("participants").insertOne(newUser);
        res.sendStatus(201);

        await db.collection("messages").insertOne(newMessage);
        res.sendStatus(201);
    } catch (err) {
        console.log(err.message);
    }
});

app.get("/participants", async (req, res) => {
    try {
        const participantes = await db.collection("participants").find().toArray();
        res.send(participantes);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

app.post("/messages", async (req, res) => {
    const from = req.header('User');
    const { to, text, type } = req.body;

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

app.get("/messages", (req, res) => {

});

app.post("/status", (req, res) => {

});

app.listen(process.env.PORT, () => { console.log(`Servidor Rodando na porta ${process.env.PORT}.`) });