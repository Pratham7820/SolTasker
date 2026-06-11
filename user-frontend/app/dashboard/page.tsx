"use client";
import { redirect, useSearchParams } from "next/navigation";
import { Upload } from "../components/Upload";
import Tasks from "../components/Tasks";
import { useEffect, useState } from "react";
import axios from "axios";
import Taskdetail from "../components/Taskdetail";

export interface IOption {
  id : number,
  optionId : number,
  imageUrl : string,
}

export interface ITask {
  id : number,
  title : string,
  description : string,
  done : boolean,
  options : IOption[]
}


export default function Dashboard() {
  const searchParams = useSearchParams();
  const key = searchParams.get("key");

  if (!key) {
    redirect("/");
  }

  const [page, setPage] = useState(0)
  const [taskId,setTaskId] = useState<number | null >(null)
  const [task,setTask] = useState<ITask | null>(null)
  const [votes,setVotes] = useState<Record<number,number> | null >(null)

  const taskfn = (taskNum:number) => {
    setTaskId(taskNum)
  }

  useEffect(()=>{
    if(taskId === null) return
    async function getTask() {
      console.log(taskId)
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/task/${taskId}`,{
        headers : {
          authorization : `Bearer ${localStorage.getItem('token')}`
        }
      })   
      setTask(res.data.task)
      console.log(res.data)
      setVotes(res.data.votes)
    }
    getTask()
  },[taskId])

  return (
    <>
      <div className= "min-h-screen bg-linear-to-br from-[#0A1022] via-[#111827] to-[#0A1022] text-white">
        <aside className="bg-[#0D1328] border-r border-white/10 p-5 fixed w-[23%] h-full">
          <div className="mb-12">
            <h1 className="text-3xl font-extrabold bg-linear-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              SolTasker
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Decentralized Feedback Platform
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setPage(0)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                page === 0
                  ? "bg-purple-600/20 text-purple-400 border border-purple-500/20"
                  : "hover:bg-white/5 text-gray-300"
              }`}
            >
              📋 My Tasks
            </button>

            <button
              onClick={() => setPage(1)}
              className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                page === 1
                  ? "bg-purple-600/20 text-purple-400 border border-purple-500/20"
                  : "hover:bg-white/5 text-gray-300"
              }`}
            >
              ➕ Create New Task
            </button>
          </div>
        </aside>

        <main className="col-span-4 flex flex-col ml-[23%] w-[77%]">
          <header className="z-10 fixed w-[77%] h-[10%] bg-[#0D1328]/80 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-8">
            <h2 className="text-xl font-semibold">
              {page === 0 ? 
                (taskId ? 
                  <div className="flex gap-3">
                    <button
                      onClick={()=>{
                        setTaskId(null)
                        setTask(null)
                      }} 
                      className="text-gray-600 hover:cursor-pointer">{"<"}
                    </button>
                    <p>Poll Details</p>                
                  </div> : 
                  "My Tasks") 
              : "Create New Task"}
            </h2>

            <div className="flex items-center gap-2 text-sm text-green-400">
              <div className="w-2 h-2 rounded-full bg-green-400"/>
              Wallet Connected
            </div>
          </header>

          <section className="z-0 flex-1 overflow-y-auto mt-[10%] px-8 pb-8 h-[90%]">
              {page === 0 && (taskId ? <Taskdetail task = {task} votes={votes}/> : <Tasks taskfn = {taskfn} />)}
              {page === 1 && <Upload publicKey={key} />}
          </section>
        </main>
      </div>
    </>
  )
}