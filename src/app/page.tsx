"use client"

import HomeContent from "@/components/HomeContent";
import { useAccount } from "wagmi";
export default function Home() {
  const {isConnected} = useAccount()
      return (
        <div>
          {isConnected ? (
            <div>
              <HomeContent />
            </div>
          ) : (
            <div className="flex justify-center text-2xl font-bold">
              Please Connect a wallet...
            </div>
          )}
        </div>
      );
}
