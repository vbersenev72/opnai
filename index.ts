import http from "http";
import dotenv from "dotenv";
import express from "express";
// import admin from "firebase-admin";
import { Server } from "socket.io";
import { Configuration, OpenAIApi } from "openai";
import keyRouter from "./router/keys.router";
import LogsRouter from "./router/logs.router";
import pool from "./db";
import cors, { CorsOptions } from "cors";
import axios from "axios";
import RequestRouter from "./router/request.router";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/keys", keyRouter);
app.use("/logs", LogsRouter);
app.use("/data", RequestRouter);

const apiKey = process.env.API_KEY_2;
const apiKey_2 = process.env.API_KEY;

const port = process.env.PORT || 5000;
// const serviceAccountKey = JSON.parse(process.env.SERVICE_ACCOUNT_KEY || "");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccountKey),
//   databaseURL: "https://ai-chat-db677.firebaseio.com",
// });

// const db = admin.firestore();

const configuration_key_1 = new Configuration({ apiKey: apiKey }); // конфиги для первого ключа
const openai_key_1 = new OpenAIApi(configuration_key_1);

const configuration_key_2 = new Configuration({ apiKey: apiKey_2 }); // конфиги для второго ключа
const openai_key_2 = new OpenAIApi(configuration_key_2);

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  } as CorsOptions,
});

try {
  server.listen(port, () => console.log(`started at: ${port}`));

  io.on("connection", (socket) => {
    let res: any = null;
    let messages_arr: any = [];

    socket.on("chat message", async (message) => {
      console.log(message);

      messages_arr.push({ role: "user", content: message });

      let isFinished: boolean = res?.data?.choices[0]?.finish_reason === "stop";

      while (res === null || !isFinished) {
        try {
          res = await openai_key_1.createChatCompletion({
            model: "gpt-3.5-turbo-16k",
            messages: [{ role: "user", content: message }, ...messages_arr],
            max_tokens: 40,
          });

          let answer: any = res.data.choices[0].message.content;
          isFinished = res?.data?.choices[0]?.finish_reason === "stop";

          if (answer.match(/^[a-zA-Z]/)) {
            answer = ` ${answer}`;
          }

          socket.emit("chat message", {
            message: answer,
            isLast: isFinished,
          });

          messages_arr.push({
            content: answer,
            role: "assistant",
          });
        } catch (error) {
          console.log(error);

          const createError = async () => {
            await axios.post("http://77.105.136.213:5000/data/send_error", {
              data: error,
            });
            await axios.post("http://77.105.136.213:6000/notif", {
              error: error,
            });
          };
          createError();
        }
      }
      res = null;

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });

    socket.on("free message", async (message) => {
      console.log(message);

      messages_arr.push({ role: "user", content: message });

      let isFinished: boolean = res?.data?.choices[0]?.finish_reason === "stop";
      let i = 0;
      let tokens = 55;
      if (/[а-яА-ЯЁёЪъ]/.test(message)) tokens = 125;  
      while ((res === null || !isFinished) && i < 2) {
        try {
          res = await openai_key_1.createChatCompletion({
            model: "gpt-3.5-turbo-16k",
            messages: [{ role: "user", content: message }, ...messages_arr],
            max_tokens: tokens,
          });

          let answer: any = res.data.choices[0].message.content;
          isFinished = res?.data?.choices[0]?.finish_reason === "stop";

          if (answer.match(/^[a-zA-Zа-яА-Я]/) && !/[а-яА-ЯЁёЪъ]/.test(answer)) answer = ` ${answer}`;
    
          // console.log(answer.length, i, answer);

          socket.emit("free message", {
            message: answer,
            isLast: isFinished,
          });

          messages_arr.push({
            content: answer,
            role: "assistant",
          });
        } catch (error) {
          console.log(error);

          const createError = async () => {
            await axios.post("http://77.105.136.213:5000/data/send_error", {
              data: error,
            });
            await axios.post("http://77.105.136.213:6000/notif", {
              error: error,
            });
          };
          createError();
        }
        i++;
      }
      
      res = null;

      socket.on("disconnect", () => {
        console.log("Client disconnected");
      });
    });
  });
} catch (error) {
  console.log(error);

  const createError = async () => {
    await axios.post("http://77.105.136.213:5000/data/send_error", {
      data: error,
    });
    await axios.post("http://77.105.136.213:6000/notif", { error: error });
  };
  createError();
}
