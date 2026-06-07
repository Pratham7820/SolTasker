import express from "express"
import userRouter from "./user.js"
import workerRouter from "./worker.js"
import cors from "cors"
import { Connection } from "@solana/web3.js"


const app = express()

export const connection = new Connection('https://solana-devnet.g.alchemy.com/v2/bLXw8Sm4-5GIu6BSNVKM0')

app.use(express.json())
app.use(cors())

app.use('/api/v1/user',userRouter)
app.use('/api/v1/worker',workerRouter)

app.listen(process.env.PORT,()=>{
    console.log(`backend is running on port ${process.env.PORT}`)
})