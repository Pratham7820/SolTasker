import express from "express"
import { prisma } from "./db.js"
import jwt from "jsonwebtoken"
import { workerMiddleware } from "./middleware.js"
import type { workerRequest } from "./types.js"
import nacl from "tweetnacl"
import { Keypair, LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js"
import bs58 from "bs58"
import { connection } from "./index.js"

const workerRouter = express.Router()
const message = 'this is sign in message for worker'

workerRouter.post('/login',async (req,res)=>{
    const { address , signature } = req.body
    const msg = new Uint8Array(Buffer.from(message))
    if(!address){
        return res.json({
            message : 'address not provided'
        })
    }
    if(!signature){
        return res.json({
            message : 'signature not provided'
        })
    }
    console.log(signature)
    const sign = bs58.decode(signature)
    const verify = nacl.sign.detached.verify(msg,sign,new PublicKey(address).toBytes())
    console.log(verify)
    if(!verify){
        return res.json({
            message : 'authentication failed'
        })
    }

    let worker = await prisma.worker.findFirst({
        where : { address }
    })
    if(!worker){
        worker = await prisma.worker.create({
            data : { 
                address : address,
                balance : {
                    create : {
                        pending_amount : 0,
                        locked_amount : 0
                    }
                } 
            }
        })
    }
    const token = jwt.sign({workerId : worker.id},process.env.WORKER_JWT_SECRET || '')
    res.json({token})
})

workerRouter.get('/nextTask',workerMiddleware,async (req:workerRequest,res)=>{
    const workerId = req.workerId
    const task = await prisma.task.findFirst({
        where : {
            submissions : {
                none : {
                    workerId : Number(workerId)
                }
            }
        },
        include : {
            options : true
        }
    })
    res.json({task})
})

workerRouter.post('/submission',workerMiddleware,async (req:workerRequest,res)=>{
    const workerId = req.workerId
    const { taskId , optionId } = req.body
    if(!optionId || !taskId){
        return res.json({
            message : 'option not provided'
        })
    }
    const submission = await prisma.submission.create({
        data : {
            workerId : Number(workerId),
            optionId : Number(optionId),
            taskId : Number(taskId)
        }
    })
    if(submission){
        const payment = await prisma.balance.update({
            where : {workerId : Number(workerId)},
            data : {
                pending_amount : {
                    increment : 0.01
                }
            }
        })
        return res.json({payment , submission})
    }
    res.json({
        message : 'submission failed'
    })
})


workerRouter.get("/getPayment",workerMiddleware, async (req: workerRequest, res) => {
    try {
      const workerId = Number(req.workerId);

      const worker = await prisma.worker.findFirst({
        where: { id: workerId },
        include: {
          balance: true,
        },
      });

      if (!worker || !worker.balance) {
        return res.status(404).json({
          message: "worker not found",
        });
      }

      const amount = worker.balance.pending_amount;

      if (!amount || amount < 0.1) {
        return res.json({
          message: "not enough funds to withdraw",
        });
      }

      await prisma.balance.update({
        where: {
          workerId,
        },
        data: {
          locked_amount: amount,
          pending_amount: 0,
        },
      });

      try {

        const { blockhash , lastValidBlockHeight } =
          await connection.getLatestBlockhash();

        const transaction = new Transaction({
          feePayer: new PublicKey(process.env.PARENT_WALLET_ADDRESS || ""),
          blockhash,
          lastValidBlockHeight}).add(
          SystemProgram.transfer({
            fromPubkey: new PublicKey(process.env.PARENT_WALLET_ADDRESS || ""),
            toPubkey: new PublicKey(worker.address),
            lamports: amount * LAMPORTS_PER_SOL,
          })
        );

        const sender = Keypair.fromSecretKey(bs58.decode(process.env.PARENT_SECRET_ADDRESS || "")
        );

        const signature = await connection.sendTransaction(
          transaction,
          [sender]
        );

        console.log("signature:", signature);


        let finalized = false;

        for (let i = 0; i < 20; i++) {
          const status =
            await connection.getSignatureStatuses([
              signature,
            ]);

          const confirmation =
            status.value[0];

          if (
            confirmation?.confirmationStatus ===
            "finalized"
          ) {
            finalized = true;
            break;
          }

          await new Promise((r) =>
            setTimeout(r, 2000)
          );
        }

        if (!finalized) {
          throw new Error(
            "transaction not finalized"
          );
        }

        await prisma.balance.update({
          where: {
            workerId,
          },
          data: {
            locked_amount: 0,
          },
        });

        return res.json({
          message: "payment successful",
          signature,
        });
      } catch (err) {
        console.error(err);

        await prisma.balance.update({
          where: {
            workerId,
          },
          data: {
            locked_amount: 0,
            pending_amount: amount,
          },
        });

        return res.status(500).json({
          message: "payment failed",
        });
      }
    } catch (err) {
      console.error(err);

      return res.status(500).json({
        message: "internal server error",
      });
    }
  }
);


export default workerRouter