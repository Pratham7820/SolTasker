import { Calendar, ChartColumnBig, PiggyBank, Users } from "lucide-react";
import { IOption, ITask } from "../dashboard/page";

export default function Taskdetail({task,votes} : {task:ITask | null , votes : Record<number,number> | null}) {
  const total = votes ? Object.values(votes).reduce((sum,count)=>sum+count,0) : 0
  return (
    <main className="space-y-2">
      <section className="flex justify-between py-4 px-6 border border-[#1E293B] rounded-lg bg-linear-to-r from-[#121b2e] to-[#111827]">
        <div className="flex gap-4">
            <div className="bg-purple-900 rounded-lg w-20 h-20 flex justify-center items-center">
                <ChartColumnBig className="size-10 rounded-lg"/>
            </div>
            <div>
                {task && task.done ? (
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
                <h2 className="text-3xl font-bold">{task?.title}</h2>
                <h4 className="font-light">{task?.description}</h4>
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
                    <div className="border border-gray-700"/>
                    <div className="flex gap-2">
                        <Calendar className="size-7 mt-2"/>
                        <div>
                            <h2 className="font-bold">Ends In </h2>
                            <h4 className="font-extralight">Date</h4>
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
                    <h2>17 May 2026</h2>
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
                {task?.options.map(option=>(
                <div key={option.id}>
                    <OptionBox option = {option}/>
                </div>
                ))}
          </div>
      </section>
      <section className="border border-[#1E293B] rounded-lg bg-linear-to-r from-[#121b2e] to-[#111827] p-5">
        <h2 className="font-bold text-lg">Voting Result</h2>
        <h4 className="mb-2 font-extralight">Results are updated in real time.</h4>
        {votes && 
            <div className="space-y-2">
                <div className="flex h-6 rounded-lg overflow-hidden bg-linear-to-r from-purple-800 to-blue-800">
                    {Object.entries(votes).map(([optionId, count], index) => {
                    const percentage = total === 0 ? 0 : (count / total) * 100;
                    console.log(percentage)
                    return (
                        <div key={optionId}
                        style={{width : `${percentage}%`}} 
                        className="border-r border-white"/>
                    )
                    })}
                </div>
                <div className="flex gap-4 pl-1">
                    {Object.entries(votes).map(([optionId,cnt])=>(
                        <div key={optionId}>
                            <h2 className="font-semibold">Option {optionId}</h2>
                            <h4 className="font-light text-sm text-center">{cnt} votes</h4>
                        </div>
                    ))}
                </div>
            </div>
        }
      </section>
    </main>
  )
}

function OptionBox({option} : {option : IOption}){
    return(
        <div className="max-h-100 space-y-4 m-2 pl-7 border border-[#1E293B] rounded-lg bg-linear-to-r from-[#121b2e] to-[#111827]">
            <div className="my-4 max-w-20 px-2 py-1 rounded-lg bg-purple-950 text-white">Option {option.optionId}</div>
            <img src={option.imageUrl} className="h-60 w-110 mb-6 rounded-lg"/>
        </div>
    )
}
