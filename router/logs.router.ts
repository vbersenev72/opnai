import { Router } from "express";
import pool from "../db";

const LogsRouter: any = Router()


LogsRouter.get('/errors', async (req: any, res: any) => {
   try {

    const errors = await pool.query('SELECT * FROM errors ORDER BY id DESC LIMIT 200;')
    res.json({message: errors.rows})

   } catch (error) {
    res.status(400).json({message: 'ошибка', error})
   }
})



export default LogsRouter as any