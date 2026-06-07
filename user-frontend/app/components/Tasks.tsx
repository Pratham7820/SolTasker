"use client"

import axios from "axios"
import { useEffect, useState } from "react"

interface Task{
    title : string,
    description : string,
    done : boolean,
    id : number
}

export default function Tasks(){
    const [tasks,setTasks] = useState<Task[]>([])
    const [loading,setLoading] = useState(false)
    useEffect(()=>{
        async function getAllTask(){
            setLoading(true)
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/allTask`,{
                headers : {
                    'authorization' : `Bearer ${localStorage.getItem('token')}`
                }
            })
            setTasks(res.data.tasks)
            setLoading(false)
        }
        getAllTask()
    },[])

    if(loading){
        return(
            <div>Loading...</div>
        )
    }
    else {
    return(
        <div className="grid grid-cols-3 gap-4">
            {tasks.length===0 ? <div>
                No tasks are created
            </div> : 
                tasks.map(task=>(
                    <div className="border p-8 border-white/10 rounded-2xl space-y-1" key={task.id}>
                        <div className="flex justify-end">
                            {task.done ? 
                                <div className="flex items-center gap-2 border px-2 rounded-full text-green-400">
                                   <p className="w-2 h-2 rounded-full bg-green-400"/>
                                    Active
                                </div> : 
                                <div className="flex items-center gap-2 border px-2 rounded-full text-red-400">
                                    <p className="w-2 h-2 rounded-full bg-red-400"/>
                                    Not Active
                                </div>
                            }
                        </div>
                        <div className="flex gap-2">
                            <label>Title:</label>
                            <p>{task.title}</p>
                        </div>
                        <div className="flex gap-2">
                            <label>Description:</label>
                            <p>{task.description}</p>
                        </div>
                    </div>
                ))
            }
        </div>
    )
}}
