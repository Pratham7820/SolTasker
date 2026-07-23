"use client"

import { BACKEND_URL } from "@/lib/config"
import axios from "axios"
import { useEffect, useState } from "react"

interface Task{
    title : string,
    description : string,
    active : boolean,
    id : number
}

export default function Tasks({taskfn} : {taskfn : (taskId : number)=> void}){
    const [tasks,setTasks] = useState<Task[]>([])
    const [loading,setLoading] = useState(false)

    useEffect(()=>{
        async function getAllTask(){
            setLoading(true)
            try {
                const res = await axios.get(`${BACKEND_URL}/allTask`,{
                    headers : {
                        'authorization' : `Bearer ${localStorage.getItem('token')}`
                    }
                })
                setTasks(res.data.tasks)
            }catch (error){
                console.log(error)
            }finally{
                setLoading(false)
            }
        }
        getAllTask()
    },[])

    if(loading){
        const arr = new Array(6).fill(0)
        console.log('hit')
        return(
            <div className="grid grid-cols-3 gap-4">
                {arr.map((_,index)=>(
                    <div key={index} className ="h-64 border p-8 border-white/10 rounded-2xl animate-pulse bg-white/5"/>
                ))}
            </div>
        )
    }

    return(
        <div className="grid grid-cols-3 gap-4">
            {tasks.length===0 ? <div>
                No tasks are created
            </div> : 
                tasks.map(task=>(
                    <div className="h-65 border p-8 border-white/10 rounded-2xl hover:border-purple-600" key={task.id}>
                        <div className="flex justify-between items-center">
                            <div className="text-lg font-semibold">
                                Task #{task.id}
                            </div>
                            {task.active ? 
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
                        <div className="h-40 py-3 space-y-2">
                            <div>
                                <label className="text-xs uppercase tracking-wider text-gray-500 mb-1">Title:</label>
                                <div className="text-white font-medium text-lg truncate">{task.title}</div>
                            </div>
                            <div>
                                <label className="text-xs uppercase tracking-wider text-gray-500 mb-1">Description:</label>
                                <div className="text-white font-medium text-lg line-clamp-2">{task.description}</div>
                            </div>
                        </div>
                        <div className="mt-auto text-end">
                            <button onClick={()=> taskfn(task.id)} className="text-sm text-purple-400 hover:cursor-pointer hover:text-purple-300 transition-colors">View Details → </button>
                        </div>
                    </div>
                ))
            }
        </div>
    )
}
