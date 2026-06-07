"use client"
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import bs58 from "bs58"

export function Appbar(){
    const router = useRouter()
    const { publicKey,signMessage } = useWallet()
    async function handleSignIn(){
        const message = "this is sign in message for worker";
        const messageBytes = new TextEncoder().encode(message)
        if(!signMessage){
            alert('signing message is not supported')
            return
        }
        const signature = await signMessage(messageBytes)
        console.log(signature)
        const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/login`,{
            address : publicKey?.toString(),
            signature : bs58.encode(signature)
        })
        console.log(res)
        localStorage.setItem('token',res.data.token)
        router.push(`/dashboard`)
    }
    useEffect(()=>{
        if(!publicKey) return
        handleSignIn() 
    },[publicKey])
    return(
        <div>
            <WalletMultiButton/>
            <WalletDisconnectButton/>
        </div>
    )
}