import { Router } from "express";
import pool from "../db";


const RequestRouter: any = Router()

RequestRouter.post('/send_data', async (req: any, res: any) => {
    try {
        const { user_id, request, response, time, model, platform, version, isSubscribed } = req.body

        const dateRequest = new Date()
        await pool.query('INSERT into key_one(data, date, user_id, response, time, model, platform, version, is_subscribe) values($1, $2, $3, $4, $5, $6, $7, $8, $9)', [request, dateRequest, user_id, response, time, model, platform, version, isSubscribed]) // запись запроса к OpenAI

        res.json({message: 'succesfull'})

    } catch (error) {
        res.status(400).json({message: 'error', error})
        console.log(error);

    }
})


RequestRouter.post('/send_error', async (req:any, res:any) => {
    try {

        const {data} = req.body

        const dateError = new Date()
        await pool.query('INSERT into errors(info, date) values($1, $2)', [data, dateError])

        res.json({message: 'succesfull'})

    } catch (error) {
        res.status(400).json({message: 'error', error})
    }
})


export default RequestRouter as any
