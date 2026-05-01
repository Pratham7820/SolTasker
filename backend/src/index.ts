import express from "express"
import { prisma } from "./db.js"
import userRouter from "./user.js"
import workerRouter from "./worker.js"
import cors from "cors"


const app = express()

app.use(express.json())
app.use(cors())

app.use('/api/v1/user',userRouter)
app.use('/api/v1/worker',workerRouter)

app.listen(process.env.PORT,()=>{
    console.log(`backend is running on port ${process.env.PORT}`)
})