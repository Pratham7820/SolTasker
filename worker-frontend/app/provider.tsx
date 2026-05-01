"use client"
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { ReactNode } from "react";
import '@solana/wallet-adapter-react-ui/styles.css';

export function Provider({children}:{children:ReactNode}){
    return(
        <ConnectionProvider endpoint={process.env.NEXT_PUBLIC_ENDPOINT || ''}>
            <WalletProvider wallets={[]} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    )
}