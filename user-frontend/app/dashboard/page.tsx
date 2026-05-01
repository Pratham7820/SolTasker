import { redirect } from "next/navigation";
import { Upload } from "../components/Upload";

export default async function Dashboard({searchParams}: {searchParams: Promise<{ [key: string]: string | undefined }>}){
    const { key } = await searchParams
    if(!key){
        redirect('/') 
    }

    return(
        <div>
            <Upload publicKey = {key} />
        </div>
    )
}