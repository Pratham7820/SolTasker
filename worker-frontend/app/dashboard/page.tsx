"use client";
import { useWallet } from "@solana/wallet-adapter-react";
import axios from "axios";
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

  async function getNextTask(userToken: string | null) {
    try {
      setLoading(true);

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/nextTask`,
        {
          headers: {
            authorization: `Bearer ${userToken}`,
          },
        }
      );

      setTask(res.data.task || null);
    } catch (err) {
      console.error(err);
      setTask(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const tk = localStorage.getItem("token");

    if (!tk) {
      alert("No token found");
      return;
    }

    setToken(tk);
    getNextTask(tk);
  }, []);

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
      {/* Sidebar */}
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

      {/* Main */}
      <main className="ml-[23%] w-[77%]">
        {/* Header */}
        <header className="z-10 fixed w-[77%] h-[10%] bg-[#0D1328]/80 backdrop-blur-sm border-b border-white/10 flex items-center justify-between px-8">
          <h2 className="text-xl font-semibold">
            Available Tasks
          </h2>

          <div className="flex items-center gap-2 text-sm text-green-400">
            <div className="w-2 h-2 rounded-full bg-green-400" />
            Wallet Connected
          </div>
        </header>

        {/* Content */}
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
              {/* Task Details */}
              <div className="bg-[#111827] border border-white/10 rounded-3xl p-6">
                <h1 className="text-3xl font-bold">
                  {task.title}
                </h1>

                <p className="text-gray-400 mt-3">
                  {task.description}
                </p>
              </div>

              {/* Voting Options */}
              <div className="grid lg:grid-cols-2 gap-8">
                {task.options.map((option) => (
                  <div
                    key={option.id}
                    onClick={() => handleSubmission(option.id)}
                    className="
                      bg-[#111827]
                      border
                      border-white/10
                      rounded-3xl
                      overflow-hidden
                      cursor-pointer
                      transition-all
                      duration-300
                      hover:border-purple-500/50
                      hover:scale-[1.02]
                      hover:shadow-xl
                      hover:shadow-purple-500/10
                    "
                  >
                    <img
                      src={option.imageUrl}
                      alt={`Option ${option.optionId}`}
                      className="w-full h-105 object-cover"
                    />

                    <div className="p-5">
                      <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold">
                          Option {option.optionId}
                        </h3>

                        <span className="px-3 py-1 rounded-full bg-purple-600/20 text-purple-400 text-sm">
                          Vote
                        </span>
                      </div>

                      <button
                        disabled={submitting}
                        className="
                          mt-4
                          w-full
                          py-3
                          rounded-xl
                          bg-linear-to-r
                          from-purple-600
                          to-blue-600
                          font-medium
                          cursor-pointer
                          disabled:opacity-50
                        "
                      >
                        {submitting
                          ? "Submitting..."
                          : "Select This Option"}
                      </button>
                    </div>
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