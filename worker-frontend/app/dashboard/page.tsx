"use client"
import { useWallet } from "@solana/wallet-adapter-react"
import { PublicKey, SystemProgram, Transaction } from "@solana/web3.js"
import axios from "axios"
import { useEffect, useState } from "react"

interface option {
    imageUrl : string,
    optionId : number
    id : number
}

interface Task {
    id : number,
    title : string,
    description : string
    options : option[]
}

export default function Dashboard(){
    const { publicKey, sendTransaction } = useWallet()
    const [task,setTask] = useState<Task>()
    const [token,setToken] = useState<string | null>(null)

    async function getNextTask(token:string | null){
        console.log(token)
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/nextTask`,{
            headers : {
                'authorization' : `Bearer ${token}`
            }
        })
        console.log(res.data.task)
        setTask(res.data.task)
        console.log(task)
    }

    useEffect(()=>{
        const tk = localStorage.getItem('token')
        setToken(tk)
        if(!tk){
            alert('no token provided')
            return
        }
        getNextTask(tk)
    },[])

    async function handleSubmission(optionId : number){
        const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/submission`,{
            taskId : task?.id,
            optionId
        },{
            headers : {
                'authorization' : `Bearer ${token}`
            }
        })
        getNextTask(token)
        console.log(res)
    }

    return(
        <div>
            this is dashboard
            {!task ? <div>No task left to give feedback too</div> :
                <div>
                    Title : {task.title}
                    Description : {task.description}
                    Options : {
                        task.options.map(option=>(
                            <div onClick={()=> handleSubmission(option.id)}>
                                <img src={option.imageUrl}/>
                                Option : {option.optionId}
                            </div>
                        ))
                    }    
                </div>
            } 
        </div>    
    )
}