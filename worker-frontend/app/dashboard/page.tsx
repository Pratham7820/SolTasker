"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

interface Option {
  imageUrl: string;
  optionId: number;
  id: number;
}

interface Task {
  id: number;
  title: string;
  description: string;
  options: Option[];
}

export default function Dashboard() {
  const { publicKey } = useWallet();
  const [task, setTask] = useState<Task | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [balance, setBalance] = useState<Float16Array | null>(null)
  const [processing,setProcessing] = useState(false)

  async function getNextTask(userToken: string | null) {
    try {
      setLoading(true)
      getBalance(userToken)
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/nextTask`,
        {
          headers: {
            authorization: `Bearer ${userToken}`,
          },
        }
      )
      console.log(res.data)
      setTask(res.data.task || null);
    } catch (err) {
      console.error(err);
      setTask(null);
    } finally {
      setLoading(false);
    }
  }

  async function getBalance(userToken : string | null){
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/balance`,{
        headers : {
          authorization : `Bearer ${userToken}`
        }
      })
      setBalance(res.data.balance)
  }

  async function withdrawSol(userToken : string | null){
    try{
      setProcessing(true)
      const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getPayment`,{
        headers : {
          authorization : `Bearer ${userToken}`
        }
      })
      getBalance(userToken)
      alert('withdrawal successfully')
    }catch(err){
      console.log(err)
      alert('error while transaction')
    }finally{
      setProcessing(false)
    }
  }

  useEffect(() => {
    const tk = localStorage.getItem("token")

    if (!tk) {
      alert("No token found")
      redirect("/")
    }

    setToken(tk)
    getNextTask(tk)
  }, [])

  async function handleSubmission(optionId: number) {
    if (!task || submitting) return;

    try {
      setSubmitting(true);

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/submission`,
        {
          taskId: task.id,
          optionId,
        },
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        }
      );

      await getNextTask(token);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0A1022] via-[#111827] to-[#0A1022] text-white">
      <aside className="bg-[#0D1328] border-r border-white/10 p-5 fixed w-[23%] h-full">
        <div className="mb-12">
          <h1 className="text-3xl font-extrabold bg-linear-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            SolTasker
          </h1>

          <p className="text-sm text-gray-400 mt-1">
            Earn SOL By Voting
          </p>
        </div>

        <div className="space-y-3">
          <div className="bg-purple-600/20 text-purple-400 border border-purple-500/20 px-4 py-3 rounded-xl">
            📋 Available Tasks
          </div>
        </div>

        <div className="absolute bottom-32 left-5 right-5">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-4">
            <p className="text-sm font-light mb-2">Your Rewards</p>
            <div className="flex gap-2">
                <img src="./sol.png" className="size-15 object-cover object-bottom"/>
                <div>
                  <h2 className="text-3xl font-semibold">{balance ? balance : 0}
                  <span className="text-lg ml-2">SOL</span></h2>
                  <h4 className="text-sm font-light">Total Earned</h4>
                </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-5 left-5 right-5">
          <div className="bg-[#111827] border border-white/10 rounded-2xl p-4">
            <p className="text-gray-400 text-sm">
              Connected Wallet
            </p>

            <p className="text-xs mt-2 break-all text-gray-300">
              {publicKey?.toString() || "Not Connected"}
            </p>
          </div>
        </div>
      </aside>

      <main className="ml-[23%] w-[77%]">
        <header className="z-10 fixed top-0 w-[77%] h-[10%] bg-[#0D1328]/80 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold">
            Available Tasks
          </h2>
          <div className="flex gap-10">
            {
              processing ? (
                <button
                  type="button"
                  disabled
                  className="w-32 h-10 bg-purple-800 rounded-lg text-white/80 opacity-70 flex items-center justify-center gap-2"
                >
                  <div
                    className="h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-e-transparent"
                  />
                  <span>Loading...</span>
                </button>
              ) : (
                <button
                  onClick={() => withdrawSol(token)}
                  className="w-32 h-10 bg-purple-800 rounded-lg text-white/80 hover:bg-purple-700 transition flex items-center justify-center"
                >
                  Withdrawal
                </button>
              )} 
              <div className="flex items-center gap-2 text-sm text-green-400">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                Wallet Connected
                </div>
              </div>
        </header>

        <section className="mt-[10%] px-8 pb-8">
          {loading ? (
            <div className="flex justify-center items-center h-[70vh]">
              <div className="bg-[#111827] border border-white/10 rounded-3xl p-10">
                Loading next task...
              </div>
            </div>
          ) : !task ? (
            <div className="flex justify-center items-center h-[70vh]">
              <div className="bg-[#111827] border border-white/10 rounded-3xl p-10 text-center max-w-lg">
                <h2 className="text-3xl font-bold">
                  🎉 All Caught Up!
                </h2>

                <p className="text-gray-400 mt-4">
                  No tasks are currently available.
                  Check back later for more earning opportunities.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-[#111827] border border-white/10 rounded-3xl p-6">
                <h1 className="text-3xl font-bold">
                  {task.title}
                </h1>

                <p className="text-gray-400 mt-3">
                  {task.description}
                </p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {task.options.map(option => (
                    <div key={option.id}>
                        <OptionBox option={option} submitting={submitting} onSelect={handleSubmission}/>
                    </div>
                ))}
              </div>
            </div>
            )}
        </section>
      </main>
    </div>
  );
}

function OptionBox({option,submitting,onSelect} : {option : Option,submitting:boolean,onSelect: (optionId: number) => void}){
    return(
        <div className="max-h-100 space-y-4 m-2 pl-6 border border-[#1E293B] rounded-lg bg-linear-to-r from-[#121b2e] to-[#111827]">
            <div className="my-4 max-w-20 px-2 py-1 rounded-lg bg-purple-950 text-white">Option {option.optionId}</div>
            <img src={option.imageUrl} className="h-60 w-110 mb-6 rounded-lg"/>
            <button onClick={()=> onSelect(option.id)} disabled={submitting} className="mt-1 mb-4 w-110 py-3 rounded-xl bg-linear-to-r from-purple-600 to-blue-600 font-medium cursor-pointer disabled:opacity-50">
                        {submitting
                          ? "Submitting..."
                          : "Select This Option"}
            </button>
        </div>
    )
}