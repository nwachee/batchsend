export function calculateTotal(amountsInput: string): number {
  if (!amountsInput || !amountsInput.trim()) return 0;
  const amountArray = amountsInput
    .split(/[,\n]+/)
    .map((amt: string) => amt.trim())
    .filter((amt: string) => amt !== "");

  // Use a strict regex to ensure each entry is a valid number (integer or decimal, positive or negative)
  const validNumber = /^-?\d+(\.\d+)?$/;

  if (amountArray.some((amt) => !validNumber.test(amt))) {
    return 0;
  }

  return amountArray.reduce((acc, curr) => acc + parseFloat(curr), 0);
}

/**
 * Parse recipients into array of addresses
 */
export function parseRecipients(recipientsInput: string): string[] {
  if (!recipientsInput || !recipientsInput.trim()) return [];

  return recipientsInput
    .split(/[,\n]+/)
    .map((addr) => addr.trim())
    .filter((addr) => addr.length > 0 && addr.startsWith("0x"));
}

/**
 * Parse amounts into array of bigints
 */
export function parseAmounts(amountsInput: string): number[] {
  if (!amountsInput || !amountsInput.trim()) return [];

  return amountsInput
    .split(/[,\n]+/)
    .map((str) => str.trim())
    .filter((str) => str.length > 0)
    .map((amountStr) => {
      const cleanAmount = amountStr.replace(/[^\d.]/g, "");
      const parsed = parseFloat(cleanAmount);
      return isNaN(parsed) ? 0 : parsed;
    })
    .filter((amount) => amount > 0);
}
