"use client"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { LAMPORTS_PER_SOL, PublicKey , SystemProgram, Transaction } from "@solana/web3.js"
import axios from "axios"
import { useEffect, useState } from "react"

interface imageType {
    imageUrl : string,
    optionId : number
}

export function Upload({publicKey} : {publicKey : string}){
    const wallet = useWallet()
    const { connection } = useConnection()

    const token = localStorage.getItem('token') || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc3NzU3MzE0NH0.6Sol4RSdV4GatV4MOa9xxdoPHaIxNppXx-yafgKiOLw"
    const [selected,setSelected] = useState<Uint8Array>()
    const [images,setImages] = useState<imageType[]>([])
    const [title,setTitle] = useState("")
    const [description,setDescription] = useState("")
    const [payment,setPayment] = useState<string>()
    const [count,setCount] = useState(1)

    useEffect(()=>{
        if(!selected) return
        async function uploadImage(){
            const res = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/getSignedUrl`,{
                headers : {
                    'authorization' : `Bearer ${token}`
                }
            })
            const url = res.data.url
            const response = await axios.put(url,selected,{
                headers : {
                    'Content-Type' : 'image/png'
                }
            })            
            console.log(response)

            setImages(prev=>[...prev,{
                imageUrl : `${process.env.NEXT_PUBLIC_CLOUDFRONT_URL}/${res.data.key}`,
                optionId : count
            }])
            setCount(count+1)
        }
        uploadImage()
    },[selected])

    async function handlePayment(){
        if(!title || !description || images.length===0){
            alert('please fill all the fields first')
            return
        }
        const transaction = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: new PublicKey(publicKey),
                toPubkey: new PublicKey(process.env.NEXT_PUBLIC_PARENT_WALLET || ''),
                lamports : 0.1*LAMPORTS_PER_SOL,
            })
        );
        let blockhash = (await connection.getLatestBlockhash("finalized")).blockhash;
        transaction.recentBlockhash = blockhash
        transaction.feePayer = new PublicKey(publicKey)

        console.log(connection)
        console.log(wallet)

        const signature = await wallet.sendTransaction(transaction,connection)
        setPayment(signature)
        console.log(signature)
    }

    async function handleSubmit(){
        if(!images){
            alert('please provide options first')
            return
        }
        if(!payment){
            alert('please pay first')
            return
        }
        const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/task`,{
            title,
            description,
            options : images
        },{
            headers : {
                'authorization' : `Bearer ${token}`
            }
        }) 
        console.log(res.data)
    }
    
    return(
        <div>
            <input type="text" onChange={e=>setTitle(e.target.value)} placeholder="Title"/>
            <input type="text" onChange={e=>setDescription(e.target.value)} placeholder="Description" />
            <input type="file" onChange={(e)=>{
                const file = e.target.files?.[0];
                if (file) {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    const arrayBuffer = e.target?.result as ArrayBuffer
                    const uint8Array = new Uint8Array(arrayBuffer);
                    console.log("Binary Data:", uint8Array);
                    setSelected(uint8Array);
                };
                
                reader.readAsArrayBuffer(file);
            }}}/>
            {images ? images.map(image=>(
                <img key={image.optionId} src = {image.imageUrl} width={500} height={500} />
            )) : <></>}
            {payment ? <button onClick={handleSubmit}>Submit</button>  : <button onClick={handlePayment}>Make payment</button>}
        </div>
    )
}