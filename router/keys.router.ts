import { Router } from "express";
import pool from "../db";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

const keyRouter: any = Router()

const serviceAccountKey = JSON.parse(process.env.SERVICE_ACCOUNT_KEY || "");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey),
    databaseURL: "https://ai-chat-db677.firebaseio.com",
  });
const firestore = admin.firestore();
const MessagesCollection = firestore.collection('Messages')



keyRouter.get('/:key', async (req: any, res: any) => {
    try {

        const key = req.params.key

        if (key == 1) {

            const key_data = await pool.query('SELECT * FROM key_one ORDER BY id DESC LIMIT 200;')
            res.json({message: key_data.rows})

        } else if(key == 2) {

            const key_data = await pool.query('SELECT * FROM key_two ORDER BY id DESC LIMIT 200;')
            res.json({message: key_data.rows})

        } else {
            res.status(400).json({message: 'Ключ ' + key + ' отсуствует'})
        }



    } catch (error) {
            res.status(400).json({message: 'ошибка', error})

    }
})


keyRouter.post('/getbydate', async (req:any, res:any) => {
    try {

        let {start_date, end_date} = req.body
        const docs:any = [];
        const start_date_timeshtamp = new Date(start_date)
        const end_date_timeshtamp = new Date(end_date)

        console.log(Math.round(start_date_timeshtamp.getTime()/1000));
        console.log(Math.round(end_date_timeshtamp.getTime()/1000));

       // const result = await pool.query('SELECT * FROM key_one WHERE date::date >= $1 AND date::date <= $2;', [start_date, end_date])
       const queryFirestore = MessagesCollection.where("1680648650 User", ">=", Math.round(start_date_timeshtamp.getTime()/1000)).where("1680648650 User", "<=", `${Math.round(end_date_timeshtamp.getTime()/1000)}\uf8ff`);
       
       queryFirestore.get().then((snapshot) => {
            snapshot.forEach((doc) => {
              docs.push(doc.data());
            });

            res.json({message: docs})
        })
            
        
        



    } catch (error) {
        res.status(400).json({message: 'error', error})
        console.log(error);
        
    }
})


keyRouter.post('/getbydate_errors', async (req:any, res:any) => {
    try {

        let {start_date, end_date} = req.body


        let result:any = await pool.query('SELECT * FROM errors WHERE date::date >= $1 AND date::date <= $2;', [start_date, end_date])

        res.json({message: result.rows})


    } catch (error) {
        res.status(400).json({message: 'error', error})
    }
})



export default keyRouter as any