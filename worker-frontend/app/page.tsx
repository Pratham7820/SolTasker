import { Appbar, ConnectButton } from "./components/Appbar";

export default function Home() {
  return (
    <div className="bg-[url(/home.jpg)] bg-cover">
      <Appbar />

      <div className="flex items-center px-10 h-[91.8vh] text-white">
        <div className="space-y-1">
          <p className="font-bold text-6xl">
            Your Opinion
          </p>

          <p className="text-6xl font-bold bg-linear-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent inline-block">
            Has Value.
          </p>

          <p className="text-balance max-w-2xl mt-4">
            Review thumbnails, logos, designs, and content from creators around
            the world. Vote on the options you prefer and earn SOL rewards for
            every contribution you make.
          </p>

          <div className="mt-3">
            <ConnectButton />
          </div>
        </div>
      </div>
    </div>
  );
}