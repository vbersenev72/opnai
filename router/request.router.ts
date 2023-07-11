import { Router } from "express";
import pool from "../db";
// import { collection, query, where, getDocs } from "firebase/firestore";
import admin from "firebase-admin";

const db = admin.firestore();
const RequestRouter: any = Router();

RequestRouter.post("/send_data", async (req: any, res: any) => {
  try {
    const {
      user_id,
      request,
      response,
      time,
      model,
      platform,
      version,
      isSubscribed,
    } = req.body;

    const dateRequest = new Date();
    await pool.query(
      "INSERT into key_one(data, date, user_id, response, time, model, platform, version, is_subscribe) values($1, $2, $3, $4, $5, $6, $7, $8, $9)",
      [
        request,
        dateRequest,
        user_id,
        response,
        time,
        model,
        platform,
        version,
        isSubscribed,
      ]
    ); // запись запроса к OpenAI

    res.json({ message: "succesfull" });
  } catch (error) {
    res.status(400).json({ message: "error", error });
    console.log(error);
  }
});

RequestRouter.post("/send_error", async (req: any, res: any) => {
  try {
    const { data } = req.body;

    const dateError = new Date();
    await pool.query("INSERT into errors(info, date) values($1, $2)", [
      data,
      dateError,
    ]);

    res.json({ message: "succesfull" });
  } catch (error) {
    res.status(400).json({ message: "error", error });
  }
});

RequestRouter.get("/messages", async (req: any, res: any) => {
  try {
    const { start_date, end_date } = req.query;
    const snapshot = await db.collection("Messages").get();

    const data: { [key: string]: string }[] = snapshot.docs
      .map((doc) => {
        const processedMessage: { [key: string]: string } = {};

        const docData = doc.data();
        Object.entries(docData).forEach(([key, value]) => {
          const timestamp = parseInt(key.split(" ")[0]);

          if (
            !isNaN(timestamp) &&
            timestamp >= start_date &&
            timestamp <= end_date
          ) {
            processedMessage[key] = value;
          }
        });

        return processedMessage;
      })
      .filter((message) => Object.keys(message).length > 0);

    res.json({ message: "succesfull", data });
  } catch (error) {
    res.status(400).json({ message: "error", error });
  }
});

export default RequestRouter as any;