import { ChartColumnBig, PiggyBank, Users } from "lucide-react";
import { IOption, ITask } from "../dashboard/page";

export default function Taskdetail({task,votes} : {task:ITask | null , votes : Record<number,number> | null}) {
    const date = new Date(task?.createdAt || '').toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
  const total = votes ? Object.values(votes).reduce((sum,count)=>sum+count,0) : 0
  return (
    <main className="space-y-2">
      <section className="flex justify-between py-4 px-6 h-50 border border-[#1E293B] rounded-lg bg-linear-to-r from-[#121b2e] to-[#111827]">
        <div className="flex gap-4">
            <div className="bg-purple-900 rounded-lg w-20 h-20 flex justify-center items-center">
                <ChartColumnBig className="size-10 rounded-lg"/>
            </div>
            <div>
                {!task ? (
                    <div className="h-6 border-white/10 rounded-2xl animate-pulse bg-white/5 max-w-19 items-center gap-2 border px-2"/>
                ) : task.active ? (
                    <div className="max-w-19 flex items-center gap-2 border px-2 rounded-full text-green-400">
                    <p className="w-2 h-2 rounded-full bg-green-400" />
                    Active
                    </div>
                ) : (
                    <div className="max-w-27 flex items-center gap-2 border px-2 rounded-full text-red-400">
                    <p className="w-2 h-2 rounded-full bg-red-400" />
                    Not Active
                    </div>
                )}
                {task ? 
                    <div>
                        <h2 className="text-3xl font-bold">{task?.title}</h2>
                        <h4 className="font-light">{task?.description}</h4>
                    </div> : 
                    <div className="animate-pulse mt-2 space-y-2">
                        <h2 className="h-5 rounded-full max-w-60 bg-white/5"/>
                        <h4 className="h-3 rounded-full max-w-30 bg-white/5"/>
                    </div>
                }
                <div className="flex gap-6 mt-4">
                    <div className="flex gap-2">
                        <PiggyBank className="size-7 mt-2"/>
                        <div>
                            <h2 className="font-bold">1 SOL</h2>
                            <h4 className="font-extralight">Total Reward</h4>
                        </div>
                    </div>
                    <div className="border border-gray-700"/>
                    <div className="flex gap-2">
                        <Users className="size-7 mt-2"/>
                        <div>
                            <h2 className="font-bold">{total}</h2>
                            <h4 className="font-extralight">Total Votes</h4>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div className="flex gap-10 pr-20">
            <div className="h-full border border-gray-700"/>
            <div className="space-y-2">
                <div className="text-sm">
                    <label className="font-extralight">Created</label>
                    {task ? <h2>{date}</h2> : <h2 className="mt-2 h-3 rounded-full max-w-30 bg-white/5"></h2>}
                </div>
                <div>
                    <label className="font-extralight">Poll Type</label>
                    <div>Single Choice</div>
                </div>
            </div>
        </div>
      </section>
      <section>
          <h2 className="font-bold">Submissions</h2>
          <p className="font-extralight">Review the options and see how people are voting</p>
          <div className="grid grid-cols-2">
                {task ? task?.options.map(option=>(
                <div key={option.id}>
                    <OptionBox option = {option}/>
                </div>
                )) : new Array(2)
                .fill(0)
                .map((_, i) => <OptionBoxSkeleton key={i} />)}
          </div>
      </section>
      <section className="border border-[#1E293B] rounded-lg bg-linear-to-r from-[#121b2e] to-[#111827] p-5">
        <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg">Voting Result</h2>
            <p className="text-gray-300 font-semibold ">{total} Votes</p>
        </div>
        <h4 className="mb-2 font-extralight">Results are updated in real time.</h4>
        {votes && 
            <div className="px-1 space-y-5">
                    {Object.entries(votes).map(([optionId, count], index) => {
                        const percentage = total === 0 ? 0 : (count / total) * 100;
                        console.log(percentage)
                        console.log(votes)
                        return (
                            <div key={index} className="space-y-1">
                                <div className="flex justify-between px-1">
                                    <h2 className="font-semibold">Option {optionId}</h2>
                                    <div className="flex gap-2 text-gray-400 text-sm font-bold">
                                        <p>{percentage}%</p> •
                                        <p>{count} votes</p>
                                    </div>
                                </div>
                                <div  className="w-full bg-white h-3 rounded-lg">
                                    <div className={`h-full rounded-full transition-duration-700  bg-blue-400`}
                                    style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        )
                    })}
                </div>
        }
      </section>
    </main>
  )
}

function OptionBoxSkeleton() {
  return (
    <div className="max-h-100 space-y-4 m-2 pl-7 border border-[#1E293B] rounded-lg bg-linear-to-r from-[#121b2e] to-[#111827] animate-pulse">
      <div className="my-4 h-7 w-24 rounded-lg bg-white/5" />
      <div className="h-60 w-110 mb-6 rounded-lg bg-white/5" />
    </div>
  );
}

function OptionBox({option} : {option : IOption}){
    return(
        <div className="max-h-100 space-y-4 m-2 pl-7 border border-[#1E293B] rounded-lg bg-linear-to-r from-[#121b2e] to-[#111827]">
            <div className="my-4 max-w-20 px-2 py-1 rounded-lg bg-purple-950 text-white">Option {option.optionId}</div>
            <img src={option.imageUrl} className="h-60 w-110 mb-6 rounded-lg"/>
        </div>
    )
}
