"use client";
import { useState, useMemo } from "react";
import { chainsToTSender, tsenderAbi, erc20Abi } from "@/constants";
import { useChainId, useConfig, useAccount, useReadContract } from "wagmi";
import { readContract } from "@wagmi/core";
import { calculateTotal, parseAmounts, parseRecipients } from "@/utils";
import { formatTokens, formatWei } from "@/utils";

export default function AirdropForm() {
  const [tokenAddress, setTokenAddress] = useState("");
  const [recipients, setRecipients] = useState("");
  const [amounts, setAmounts] = useState("");
  const chainId = useChainId();
  const config = useConfig();
  const account = useAccount();
  const total = useMemo(() => calculateTotal(amounts), [amounts]);

  // Read token name from contract
  const { data: tokenName } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "name",
    query: {
      enabled: !!tokenAddress && tokenAddress.startsWith("0x"),
    },
  });

  // Read token symbol from contract
  const { data: tokenSymbol } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "symbol",
    query: {
      enabled: !!tokenAddress && tokenAddress.startsWith("0x"),
    },
  });

  // Read token decimals from contract
  const { data: tokenDecimals } = useReadContract({
    address: tokenAddress as `0x${string}`,
    abi: erc20Abi,
    functionName: "decimals",
    query: {
      enabled: !!tokenAddress && tokenAddress.startsWith("0x"),
    },
  });

  // Display token info
  const displayTokenName =
    tokenName && tokenSymbol ? `${tokenName} (${tokenSymbol})` : "—";

  async function getApprovedAmount(
    tSenderAddress: string | null
  ): Promise<number> {
    if (!tSenderAddress) {
      alert("tSenderAddress is null");
      return 0;
    }

    // read from the chain to see if the user has approved enough tokens
    const response = await readContract(config, {
      abi: erc20Abi,
      address: tokenAddress as `0x${string}`,
      functionName: "allowance",
      args: [account.address, tSenderAddress as `0x${string}`],
    });

    return response as number;
  }

  async function handleSubmit() {
    // Validate inputs
    const recipientList = parseRecipients(recipients);
    const amountList = parseAmounts(amounts);

    if (!tokenAddress || !tokenAddress.startsWith("0x")) {
      alert("Please enter a valid token address");
      return;
    }

    if (recipientList.length === 0) {
      alert("Please enter at least one recipient address");
      return;
    }

    if (amountList.length === 0) {
      alert("Please enter at least one amount");
      return;
    }

    if (recipientList.length !== amountList.length) {
      alert("Number of recipients must match number of amounts");
      return;
    }

    // Check approval
    const tSenderAddress = chainsToTSender[chainId]?.["tsender"];
    if (!tSenderAddress) {
      alert("BatchSend contract not deployed on this network");
      return;
    }

    const approvedAmount = await getApprovedAmount(tSenderAddress);
    console.log("Approved amount:", approvedAmount.toString());
    console.log("Total needed:", total.toString());

    if (approvedAmount === 0 || approvedAmount < total) {
      alert(
        `Insufficient approval. Approved: ${formatWei(
          approvedAmount.toString()
        )}, Needed: ${formatWei(total.toString())}`
      );
      return;
    }

    // TODO: Execute batch send transaction
    console.log("Sending tokens...");
    console.log("Recipients:", recipientList);
    console.log("Amounts:", amountList);
  }

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
                  {formatWei(total.toString())}
                </div>
              </div>

              <div>
                <span className="font-medium text-black">
                  Total Amount (tokens):
                </span>
                <div className="mt-1 p-2 bg-white border border-gray-300 rounded text-black font-mono">
                  {formatTokens(
                    total.toString(),
                    tokenDecimals ? Number(tokenDecimals) : 18
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
            disabled={!account.address || total === 0}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
          >
            {!account.address ? "Connect Wallet" : "Send Tokens"}
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
