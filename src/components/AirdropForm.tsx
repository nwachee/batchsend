"use client";
import { useState, useMemo, useEffect, use } from "react";
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants";
import {
  useChainId,
  useConfig,
  useAccount,
  useReadContracts,
  useWriteContract,
} from "wagmi";
import { simulateContract } from "@wagmi/core";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { parseAmounts, parseRecipients } from "@/utils";
import { formatTokens, formatWei } from "@/utils";
import { toast } from "sonner";

export default function AirdropForm() {
  // constants for localStorage keys
  const STORAGE_KEYS = {
    TOKEN_ADDRESS: "airdrop_token_address",
    RECIPIENTS: "airdrop_recipients",
    AMOUNTS: "airdrop_amounts",
  };

  const [tokenAddress, setTokenAddress] = useState(() => {
    // Only run on client side (not during SSR)
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEYS.TOKEN_ADDRESS) || "";
    }
    return "";
  });

  const [recipients, setRecipients] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEYS.RECIPIENTS) || "";
    }
    return "";
  });

  const [amounts, setAmounts] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEYS.AMOUNTS) || "";
    }
    return "";
  });

  // Track loading states for different operations
  const [isApproving, setIsApproving] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const chainId = useChainId();
  const config = useConfig();
  const account = useAccount();
  const totalAmount = useMemo(
    () => parseAmounts(amounts).reduce((acc, amount) => acc + amount, 0n),
    [amounts]
  );

  const { writeContractAsync } = useWriteContract({});

  // Whenever inputs change, save to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.TOKEN_ADDRESS, tokenAddress);
    }
  }, [tokenAddress]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.RECIPIENTS, recipients);
    }
  }, [recipients]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEYS.AMOUNTS, amounts);
    }
  }, [amounts]);

  // Fetch token details using useReadContracts
  const { data: tokenData } = useReadContracts({
    contracts: [
      {
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "name",
      },
      {
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "symbol",
      },
      {
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: "decimals",
      },
    ],
  });

  // Display token info
  const tokenName = tokenData?.[0]?.result as string;
  const tokenSymbol = tokenData?.[1]?.result as string;
  const tokenDecimals = tokenData?.[2]?.result as number | undefined;
  const displayTokenName =
    tokenName && tokenSymbol ? `${tokenName} (${tokenSymbol})` : "—";;

  // HELPER: GET APPROVED AMOUNT
  async function getApprovedAmount(
    tSenderAddress: string | null
  ): Promise<bigint> {
    if (!tSenderAddress) {
      toast.error("Transaction failed", {
        description: "BatchSend contract address not found",
      });
      return 0n;
    }

    // read from the chain to see if the user has approved enough tokens
    const response = await readContract(config, {
      abi: erc20Abi,
      address: tokenAddress as `0x${string}`,
      functionName: "allowance",
      args: [account.address, tSenderAddress as `0x${string}`],
    });

    return response as bigint;
  }

  async function handleSubmit() {
    const recipientList = parseRecipients(recipients);
    const amountList = parseAmounts(amounts);

    // Validate inputs
    if (!tokenAddress || !tokenAddress.startsWith("0x")) {
      toast.error("Invalid token address", {
        description: "Please enter a valid token contract address",
      });
      return;
    }

    if (recipientList.length === 0) {
      toast.error("No recipients", {
        description: "Please enter at least one recipient address",
      });
      return;
    }

    if (amountList.length === 0) {
      toast.error("No amounts", {
        description: "Please enter at least one amount in wei",
      });
      return;
    }

    if (recipientList.length !== amountList.length) {
      toast.error("Mismatched inputs", {
        description: "Number of recipients must match number of amounts",
      });
      return;
    }

    if (totalAmount === 0n) {
      toast.error("Invalid total", {
        description: "Amounts must be positive integer wei values",
      });
      return;
    }

    const tSenderAddress = chainsToTSender[chainId]?.["tsender"];
    if (!tSenderAddress) {
      toast.error("Unsupported network", {
        description: "BatchSend contract not deployed on this network",
      });
      return;
    }

    try {
      // Check approval
      const approvedAmount = await getApprovedAmount(tSenderAddress);

      if (approvedAmount < totalAmount) {
        // Start and show spinner while approving tokens
        setIsApproving(true);

        console.log("Approving tokens...");

        const approvalHash = await writeContractAsync({
          abi: erc20Abi,
          address: tokenAddress as `0x${string}`,
          functionName: "approve",
          args: [tSenderAddress as `0x${string}`, totalAmount],
        });

        // Update to show confirmation waiting
        console.log("Waiting for confirmation...");

        const approvalReceipt = await waitForTransactionReceipt(config, {
          hash: approvalHash,
        });

        // Success for approval
        console.log("Tokens approved!", approvalReceipt);

        setIsApproving(false);
      }

      console.log("Sending tokens...");

      // Show spinner while sending tokens
      setIsSending(true);

      const sendHash = await writeContractAsync({
        abi: tsenderAbi,
        address: tSenderAddress as `0x${string}`,
        functionName: "batchSend",
        args: [
          tokenAddress as `0x${string}`,
          recipientList as `0x${string}`[],
          amountList
        ],
      });

      console.log("Confirming transaction...");

      const sendReceipt = await waitForTransactionReceipt(config, {
        hash: sendHash,
      });

      console.log("Tokens sent successfully:", sendReceipt);
      setIsSending(false); // Stop sending spinner

      // Success toast with transaction details
      toast.success("Airdrop completed! 🎉", {
        description: `Successfully sent to ${recipientList.length} recipients`,
        action: {
          label: "View on Explorer",
          onClick: () => {
            // You can add blockchain explorer URL here
            const explorerUrl = chainId === 11155111
              ? `https://sepolia.etherscan.io/tx/${sendHash}`
              : chainId === 1
                ? `https://etherscan.io/tx/${sendHash}`
                : chainId === 42161
                  ? `https://arbiscan.io/tx/${sendHash}`
                  : chainId === 10
                    ? `https://optimistic.etherscan.io/tx/${sendHash}`
                    : chainId === 8453
                      ? `https://basescan.org/tx/${sendHash}`
                      : chainId === 324
                        ? `https://explorer.zksync.io/tx/${sendHash}`
                        : `https://etherscan.io/tx/${sendHash}`; // fallback
            window.open(explorerUrl, "_blank");
          },
        },
        duration: 10000, // Show for 10 seconds since it has an action
      });

      // Clear form and localStorage
      setTokenAddress("");
      setRecipients("");
      setAmounts("");
      localStorage.removeItem(STORAGE_KEYS.TOKEN_ADDRESS);
      localStorage.removeItem(STORAGE_KEYS.RECIPIENTS);
      localStorage.removeItem(STORAGE_KEYS.AMOUNTS);
    } catch (error) {
      console.error("Transaction error:", error);

      // Error toast
      toast.error("Transaction failed", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });

      // Reset all loading states on error
      setIsApproving(false);
      setIsSending(false);
    }
  }

  // Combine both loading states for UI
  const isLoading = isApproving || isSending;

  // Show different messages based on transaction stage
  const getLoadingMessage: any = () => {
    if (isApproving) return "Approving tokens...";
    if (isSending) return "Sending tokens...";
    return "";
  };

  // Get button text based on state
  const getButtonText = () => {
    if (isLoading) return getLoadingMessage();
    if (!account.address) return "Connect Wallet";
    return "Send Tokens";
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="max-w-2xl mx-auto p-6 space-y-6 bg-white rounded-lg shadow-md border border-gray-200">
          {/* Token Address Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-black">
              Token Address
            </label>
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              placeholder="0x..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            />
          </div>

          {/* Recipients Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-black">
              Recipients (comma or new line separated)
            </label>
            <textarea
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="0x123..., 0x456...&#10;0x789..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical text-black font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              {parseRecipients(recipients).length} recipient(s)
            </p>
          </div>

          {/* Amounts Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-black">
              Amounts (wei; comma or new line separated)
            </label>
            <textarea
              value={amounts}
              onChange={(e) => setAmounts(e.target.value)}
              placeholder="100000000000000000, 200000000000000000&#10;300000000000000000"
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical text-black font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              {parseAmounts(amounts).length} amount(s)
            </p>
          </div>

          {/* Transaction Details */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-medium text-black mb-4">
              Transaction Details
            </h3>

            <div className="space-y-3">
              <div>
                <span className="font-medium text-black">Token Name:</span>
                <div className="mt-1 p-2 bg-white border border-gray-300 rounded text-black">
                  {displayTokenName}
                </div>
              </div>

              <div>
                <span className="font-medium text-black">
                  Total Amount (wei):
                </span>
                <div className="mt-1 p-2 bg-white border border-gray-300 rounded text-black font-mono">
                  {formatWei(totalAmount.toString())}
                </div>
              </div>

              <div>
                <span className="font-medium text-black">
                  Total Amount (tokens):
                </span>
                <div className="mt-1 p-2 bg-white border border-gray-300 rounded text-black font-mono">
                  {formatTokens(
                    totalAmount.toString(),
                    tokenDecimals
                      ? Number(tokenDecimals)
                      : 18
                  )}
                </div>
              </div>

              <div>
                <span className="font-medium text-black">Recipients:</span>
                <div className="mt-1 p-2 bg-white border border-gray-300 rounded text-black">
                  {parseRecipients(recipients).length}
                </div>
              </div>
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSubmit}
            disabled={!account.address || totalAmount === 0n || isLoading}
            className="w-full py-3 px-4 bg-blue-600 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center space-x-2 min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            )}
            <span>{getButtonText()}</span>
          </button>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Supports all EVM chains (Ethereum, BSC, Polygon, and more)</p>
        </div>
      </div>
    </div>
  );
}
