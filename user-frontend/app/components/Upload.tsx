"use client";
import { BACKEND_URL, CLOUDFRONT_URL, PARENT_WALLET } from "@/lib/config";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import axios from "axios";
import { useCallback, useEffect, useState } from "react";

interface imageType {
  key : string,
  imageUrl: string;
  optionId: number;
}

export function Upload({ publicKey }: { publicKey: string }) {
  const wallet = useWallet();
  const { connection } = useConnection();
  const [selected, setSelected] = useState<Uint8Array>();
  const [images, setImages] = useState<imageType[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [payment, setPayment] = useState<string>();
  const [count, setCount] = useState(1);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t = localStorage.getItem("token");
    console.log(connection.rpcEndpoint)
    setToken(t);
  }, []);

  useEffect(() => {
    if (!selected) return;
    async function uploadImage() {
      const res = await axios.get(
        `${BACKEND_URL}/getSignedUrl`,
        {
          headers: {
            authorization: `Bearer ${token}`,
          },
        },
      );
      const { url , key } = res.data;
      const response = await axios.put(url, selected, {
        headers: {
          "Content-Type": "image/png",
        },
      });

      setImages((prev) => [
        ...prev,
        {
          key : key,
          imageUrl: `${CLOUDFRONT_URL}/${key}`,
          optionId: count,
        },
      ]);
      setCount(count + 1);
    }
    uploadImage();
  }, [selected]);

  const handlePayment = useCallback(async ()=> {
        console.log({title,description,images})
        if (!title || !description || images.length === 0) {
        alert("please fill all the fields first");
        return;
        }
        const transaction = new Transaction().add(
        SystemProgram.transfer({
            fromPubkey: new PublicKey(publicKey),
            toPubkey: new PublicKey(PARENT_WALLET || ""),
            lamports: 1 * LAMPORTS_PER_SOL,
        }),
        );
        const { context: { slot: minContextSlot }, value: { blockhash, lastValidBlockHeight }} = await connection.getLatestBlockhashAndContext();
        
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = new PublicKey(publicKey);
        
        const signature = await wallet.sendTransaction(transaction, connection, { minContextSlot });

        setPayment(signature)
    },[publicKey,connection,wallet,title,description,images])

  async function handleSubmit() {
    if (!images) {
      alert("please provide options first");
      return;
    }
    if (!payment) {
      alert("please pay first");
      return;
    }
    const res = await axios.post(`${BACKEND_URL}/task`,{
        title,
        description,
        options: images,
        signature : payment
      },{
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    if(!res){
      alert('transaction failed')
      return
    }
    setTitle('')
    setDescription('')
    setCount(1)
    setImages([])
    setPayment('')
    alert('Uploaded Successfully')
  }

  return (
    <div className = "bg-[#111827]/60 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-xl">
      <div className="min-h-screen bg-[#050816] flex justify-center items-center p-6">
        <div className="w-full max-w-2xl bg-[#0A1022] border border-violet-500/20 rounded-2xl p-8 shadow-xl">

          <h1 className="text-3xl font-bold text-white mb-2">
            Create Task
          </h1>

          <p className="text-gray-400 mb-8">
            Upload your content and collect opinions from real people.
          </p>

          <div className="space-y-5">

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
              className="w-full bg-[#111827] text-white px-4 py-3 rounded-xl border border-violet-500/20 focus:outline-none focus:border-violet-500 placeholder:text-gray-500"
            />

            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="w-full bg-[#111827] text-white px-4 py-3 rounded-xl border border-violet-500/20 focus:outline-none focus:border-violet-500 placeholder:text-gray-500"
            />

            <label className="block">
              <div className="border-2 border-dashed border-violet-500/30 bg-[#111827] rounded-xl p-8 text-center cursor-pointer hover:border-violet-500 transition">
                <p className="text-violet-400 text-lg font-medium">
                  Upload Image
                </p>
                <p className="text-gray-500 text-sm mt-1">
                  Click to choose a file
                </p>
              </div>

              <input
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];

                  if (file) {
                    const reader = new FileReader();

                    reader.onload = (e) => {
                      const arrayBuffer =
                        e.target?.result as ArrayBuffer;

                      const uint8Array =
                        new Uint8Array(arrayBuffer);

                      setSelected(uint8Array);
                    };

                    reader.readAsArrayBuffer(file);
                  }
                }}
              />
            </label>

            {images && images.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                {images.map((image) => (
                  <div
                    key={image.optionId}
                    className="overflow-hidden rounded-xl border border-violet-500/20 bg-[#111827]"
                  >
                    <img
                      src={image.imageUrl}
                      className="w-full h-64 object-cover"
                      alt=""
                    />
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4">
              {payment ? (
                <button
                  onClick={handleSubmit}
                  className="w-full bg-linear-to-r from-violet-600 to-purple-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
                >
                  Submit Task
                </button>
              ) : (
                <button
                  onClick={handlePayment}
                  className="w-full bg-linear-to-r from-cyan-500 to-violet-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
                >
                  Make Payment of 1 SOL
                </button>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
