"use client"
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import bs58 from "bs58"

export function Appbar(){
    const router = useRouter()
    const { publicKey, signMessage } = useWallet()

    useEffect(()=>{
        if(!publicKey) return
        handleSignIn()
    },[publicKey])
    
    async function handleSignIn(){
            const message = "this is sign in message for user";
            const messageBytes = new TextEncoder().encode(message)
            if(!signMessage){
                alert('signing message is not supported')
                return
            }
            const signature = await signMessage(messageBytes)
            const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/login`,{
                address : publicKey?.toString(),
                signature : bs58.encode(signature)
            })
            console.log(res)
            localStorage.setItem('token',res.data.token)
            router.push(`/dashboard?key=${publicKey}`)
    }

    return(
        <div className="flex justify-between items-center text-white py-1 px-4">
            <p className="font-bold text-3xl">
                SolTasker
            </p>
            <div>
                <ConnectButton/>
            </div>            
        </div>
    )
}

export function ConnectButton(){
    return <WalletMultiButton></WalletMultiButton>
}