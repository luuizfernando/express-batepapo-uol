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

app.post("/participants", async (req, res) => {
    const { name } = req.body;

    const agora = dayjs();
    const formatado = agora.format('HH:mm:ss');

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

app.get("/participants", (req, res) => {
    db.collection("participants").find().toArray()
        .then(participants => res.send(participants))
        .catch(err => res.status(500).send(err.message));
});

app.post("/messages", (req, res) => {
    const { from } = req.headers;
    const { to, text, type } = req.body;


});

app.get("/messages", (req, res) => {

});

app.post("/status", (req, res) => {

});

app.listen(process.env.PORT, () => { console.log(`Servidor Rodando na porta ${process.env.PORT}.`) });