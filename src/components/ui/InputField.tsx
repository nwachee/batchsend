"use client";
import { useState } from "react";

export default function TokenBatchSendForm() {
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [recipients, setRecipients] = useState<string>("");
  const [amounts, setAmounts] = useState<string>("");

  async function handleSendTokens() {
    // Placeholder for sending tokens logic
    console.log("Send Tokens clicked!");
  }

  return (
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
          placeholder="0x123..., 0x456..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical text-black"
        />
      </div>

      {/* Amounts Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-black">
          Amounts (wei; comma or new line separated)
        </label>
        <textarea
          value={amounts}
          onChange={(e) => setAmounts(e.target.value)}
          placeholder="100, 200, 300..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical text-black"
        />
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
              —
            </div>
          </div>

          <div>
            <span className="font-medium text-black">Amount (wei):</span>
            <div className="mt-1 p-2 bg-white border border-gray-300 rounded text-black">
              0
            </div>
          </div>

          <div>
            <span className="font-medium text-black">Amount (tokens):</span>
            <div className="mt-1 p-2 bg-white border border-gray-300 rounded text-black">
              0.00
            </div>
          </div>
        </div>
      </div>

      {/* Send Button */}
      <button
        onClick={handleSendTokens}
        className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
      >
        Send Tokens
      </button>
    </div>
  );
}
