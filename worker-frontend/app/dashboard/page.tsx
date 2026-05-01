"use client"
import axios from "axios"
import { useEffect, useState } from "react"

interface option {
    imageUrl : string,
    optionId : number
}

interface Task {
    title : string,
    description : string
    options : option[]
}

export default function Dashboard(){
    const [task,setTask] = useState<Task>()

    async function getNextTask(){
        const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/nextTask`,{
            headers : {
                'authorization' : `Bearer ${token}`
            }
        })
        setTask(res.data.task)
    }

    useEffect(()=>{
        getNextTask()
    },[])

    return(
        <div>
            this is dashboard
            {!task ? <div>No task is left to give answer</div> 
            :   <div>
                    Title : {task.title}
                    Description : {task.description}
                    Options : {
                        task.options.map(option=>(
                            <div>
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