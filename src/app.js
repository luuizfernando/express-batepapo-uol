import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
import dayjs from 'dayjs';

const app = express();

app.use(cors());
app.use(express.json());
dotenv.config();

let db;
const mongoClient = new MongoClient(process.env.DATABASE_URL);
mongoClient.connect()
    .then(() => db = mongoClient.db())
    .catch((err) => console.log(err.message));

app.post("/participants", (req, res) => {
    const { name } = req.body;

    const agora = dayjs();
    const formatado = agora.format('HH:mm:ss');

    const newUser = { name, lastStatus: Date.now() };
    const newMessage = { from: name, to: 'Todos', text: 'entra na sala...', type: 'status', time: `${formatado}` };

    db.collection("participants").insertOne(newUser)
        .then(() => res.sendStatus(201))
        .catch(err => console.log(err.message));

    db.collection("messages").insertOne(newMessage)
        .then(() => res.sendStatus(201))
        .catch(err => console.log(err.message));
});

app.get("/participants", (req, res) => {

});

app.post("/messages", (req, res) => {

});

app.get("/messages", (req, res) => {

});

app.post("/status", (req, res) => {

});

app.listen(process.env.PORT, () => { console.log(`Servidor Rodando na porta ${process.env.PORT}.`) });