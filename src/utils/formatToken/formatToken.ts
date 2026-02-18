/**
 * Format wei amount to token amount with proper decimals
 * @param weiAmount - Amount in wei as string
 * @param decimals - Token decimals (default: 18)
 * @returns Formatted token amount
 */
export function formatTokens(weiAmount: string, decimals: number = 18): string {
  if (!weiAmount || weiAmount === "0") return "0.00";

  // Pad with zeros if needed
  const paddedWei = weiAmount.padStart(decimals + 1, "0");

  // Split at decimal point
  const integerPart = paddedWei.slice(0, -decimals) || "0";
  const decimalPart = paddedWei.slice(-decimals);

  // Combine and remove trailing zeros
  let result = integerPart + "." + decimalPart;

  // Remove trailing zeros after decimal, but keep at least one digit
  result = result.replace(/(\.\d*?[1-9])0+$/, "$1"); // Remove trailing zeros after nonzero decimal
  result = result.replace(/\.0+$/, ".0"); // If only zeros after decimal, leave one zero

  // If ends with just decimal, add .00
  if (result.endsWith(".")) {
    result += ".00";
  }

  // If whole number, ensure two decimals
  if (result.includes(".")) {
    const [, dec] = result.split(".");
    if (/^0+$/.test(dec)) {
      result = result.split(".")[0] + ".00";
    }
  }

  // Add thousand separators
  const [int, dec] = result.split(".");
  const formattedInt = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return dec ? `${formattedInt}.${dec}` : formattedInt;
}

/**
 * Format wei amount as string (just adds commas for readability)
 * @param weiAmount - Amount in wei as string
 * @returns Formatted wei amount with commas
 */
export function formatWei(weiAmount: string): string {
  if (!weiAmount || weiAmount === "0") return "0";
  return weiAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Convert token amount to wei
 * @param tokenAmount - Amount in tokens (can be decimal)
 * @param decimals - Token decimals (default: 18)
 * @returns Wei amount as string
 */
export function toWei(tokenAmount: string, decimals: number = 18): string {
  if (!tokenAmount || tokenAmount === "0") return "0";

  const [integer, decimal = ""] = tokenAmount.split(".");

  // Pad or trim decimal part
  const paddedDecimal = decimal.padEnd(decimals, "0").slice(0, decimals);

  // Combine
  const wei = integer + paddedDecimal;

  // Remove leading zeros
  return wei.replace(/^0+/, "") || "0";
}
