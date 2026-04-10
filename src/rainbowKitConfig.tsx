"use client";

import { anvil, zksync, mainnet, bsc, sepolia } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { env } from "process";

export default getDefaultConfig({
  appName: "BatchSend",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  chains: [anvil, zksync, mainnet, bsc, sepolia],
  ssr: false,
});
