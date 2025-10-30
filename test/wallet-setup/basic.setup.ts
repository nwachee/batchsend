import { defineWalletSetup } from "@synthetixio/synpress";
import { MetaMask } from "@synthetixio/synpress/playwright";

const SEED_PHRASE =
  process.env.SEED_PHRASE ||
  "test test test test test test test test test test test junk";
const PASSWORD = process.env.WALLET_PASSWORD || "Tester@1234";

export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  const metamask = new MetaMask(context, walletPage, PASSWORD);

  // Import wallet
  await metamask.importWallet(SEED_PHRASE);

  // Add Anvil network
  await metamask.addNetwork({
    name: "Anvil",
    rpcUrl: "http://127.0.0.1:8545",
    chainId: 31337,
    symbol: "ETH",
  });

  // Switch to Anvil network
  await metamask.switchNetwork("Anvil");
});
