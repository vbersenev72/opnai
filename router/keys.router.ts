import { Router } from "express";
import pool from "../db";

const keyRouter: any = Router()




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


        const result = await pool.query('SELECT * FROM key_one WHERE date::date >= $1 AND date::date <= $2;', [start_date, end_date])
        res.json({message: result.rows})


    } catch (error) {
        res.status(400).json({message: 'error', error})
    }
})



export default keyRouter as any