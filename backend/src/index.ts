import express from "express"
import userRouter from "./user.js"
import workerRouter from "./worker.js"
import cors from "cors"
import { Connection } from "@solana/web3.js"
import { PORT, SOLANA_RPC_URL } from "./config.js"


const app = express()

export const connection = new Connection(SOLANA_RPC_URL)

app.use(express.json())
app.use(cors())

app.use('/api/v1/user',userRouter)
app.use('/api/v1/worker',workerRouter)

app.listen(process.env.PORT,()=>{
    console.log(`backend is running on port ${PORT}`)
})