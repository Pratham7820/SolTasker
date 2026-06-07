"use client";
import { redirect, useSearchParams } from "next/navigation";
import { Upload } from "../components/Upload";
import Tasks from "../components/Tasks";
import { useState } from "react";

export default function Dashboard() {
  const searchParams = useSearchParams();
  const key = searchParams.get("key");

  if (!key) {
    redirect("/");
  }

  const [page, setPage] = useState(0);

  return (
    <div className="min-h-screen bg-linear-to-br from-[#0A1022] via-[#111827] to-[#0A1022] text-white">
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
            {page === 0 ? "My Tasks" : "Create New Task"}
          </h2>

          <div className="flex items-center gap-2 text-sm text-green-400">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            Wallet Connected
          </div>
        </header>

        <section className="z-0 flex-1 overflow-y-auto mt-[10%] px-8 pb-8 h-[90%]">
            {page === 0 && <Tasks />}
            {page === 1 && <Upload publicKey={key} />}
        </section>
      </main>
    </div>
  );
}