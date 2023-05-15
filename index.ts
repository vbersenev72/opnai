import http from "http";
import dotenv from "dotenv";
import express from "express";
import admin from "firebase-admin";
import { Server } from "socket.io";
import { Configuration, OpenAIApi } from "openai";
import keyRouter from "./router/keys.router";
import LogsRouter from "./router/logs.router";
import pool from "./db";
import cors, { CorsOptions } from "cors";

dotenv.config();

const app = express();
app.use(cors())
app.use(express.json());
app.use('/keys', keyRouter)
app.use('/logs', LogsRouter)



const apiKey = process.env.API_KEY;
const apiKey_2 = process.env.API_KEY_2;



const port = process.env.PORT || 5000;
const serviceAccountKey = JSON.parse(process.env.SERVICE_ACCOUNT_KEY || "");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccountKey),
  databaseURL: "https://ai-chat-db677.firebaseio.com",
});

const db = admin.firestore();

const configuration_key_1 = new Configuration({ apiKey: apiKey }); // конфиги для первого ключа
const openai_key_1 = new OpenAIApi(configuration_key_1);

const configuration_key_2 = new Configuration({ apiKey: apiKey_2 }); // конфиги для второго ключа
const openai_key_2 = new OpenAIApi(configuration_key_2);


const server = http.createServer(app);
const io = new Server(server, {cors: {
    origin: "*",
  } as CorsOptions});


try {

  server.listen(port, () => console.log(`started at: ${port}`));

  io.on("connection", (socket) => {
    let res: any = null;
    let messages_arr: any = [];

    socket.on("chat message", async (message) => {

      if (message != 'qwweeerrrr'){ // Проверка - чтобы вбросы кочегарки не заполняли базу данных
        const dateRequest = new Date()
        await pool.query('INSERT into key_one(data, date) values($1, $2)', [message, dateRequest]) // запись запроса к OpenAI
      }
      
      console.log(message);

      messages_arr.push({ role: "user", content: message });

      let isFinished: boolean = res?.data?.choices[0]?.finish_reason === "stop";

      while (res === null || !isFinished) {
        try {
          res = await openai_key_1.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message }, ...messages_arr],
            max_tokens: 20,
          });

          const answer: string = res.data.choices[0].message.content;
          isFinished = res?.data?.choices[0]?.finish_reason === "stop";

          socket.emit("chat message", {
            message: answer,
            isLast: isFinished,
          });

          messages_arr.push({
            content: answer,
            role: "assistant",
          });

          console.log(isFinished);
          console.log(messages_arr);

        } catch (error) {

          res = await openai_key_2.createChatCompletion({
            model: "gpt-3.5-turbo",
            messages: [{ role: "user", content: message }, ...messages_arr],
            max_tokens: 20,
          });

          const answer: string = res.data.choices[0].message.content;
          isFinished = res?.data?.choices[0]?.finish_reason === "stop";

          socket.emit("chat message", {
            message: answer,
            isLast: isFinished,
          });

          messages_arr.push({
            content: answer,
            role: "assistant",
          });

          console.log(isFinished);
          console.log(messages_arr);

          console.log(error)

          const createError = async ( ) => {
            const dateError = new Date()
            await pool.query('INSERT into errors(info, date) values($1, $2)', [error, dateError])
          }
          createError()

        }
      }
      res = null;

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });
  });
} catch (error) {
  console.log(error);

  const createError = async ( ) => {
    const dateError = new Date()
    await pool.query('INSERT into errors(info, date) values($1, $2)', [error, dateError])
  }
  createError()

}