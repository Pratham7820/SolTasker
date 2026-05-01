"use client"
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function Appbar(){
    const router = useRouter()
    const { publicKey } = useWallet()
    useEffect(()=>{
        if(!publicKey) return
        router.push(`/dashboard?key=${publicKey}`)
    },[publicKey])
    return(
        <div>
            <WalletMultiButton/>
            <WalletDisconnectButton/>
        </div>
    )
}