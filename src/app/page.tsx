"use client"

import HomeContent from "@/components/HomeContent";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";

export default function Home() {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Render nothing until client has mounted — avoids hydration mismatch
  if (!mounted) return null;

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