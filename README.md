# BatchSend

Streamlined token airdrop interface for distributing assets across multiple wallets. Gas-optimized batch transfers on any EVM chain.


# Getting Started

## Requirements

- [node](https://nodejs.org/en/download)
    - You'll know you've installed it right if you can run `node --version` and get a response like `v23.0.1`
- [pnpm](https://pnpm.io/)
    - You'll know you've installed it right if you can run `pnpm --version` and get a response like `10.1.0`
- [git](https://git-scm.com/downloads)
    - You'll know you've installed it right if you can run `git --version` and get a response like `git version 2.33.0`
- [foundry](https://getfoundry.sh/)
    - You'll know you've installed it right if you can run `forge --version` and you see a response like `forge 0.2.0 (816e00b 2023-03-16T00:05:26.396218Z)`

### Environment Variables

You'll need a `.env.local` with the following environment variables:

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: Project ID from [reown cloud](https://cloud.reown.com/)

## Setup

```bash
git clone https://github.com/nwachee/batchsend.git
cd batchsend
pnpm install
```

### Deploy contracts (local)

This project uses [test-batchsend](https://github.com/nwachee/test-batchsend) for the contracts. Clone and deploy it first:

```bash
git clone https://github.com/nwachee/test-batchsend.git
cd test-batchsend
forge build
```

Start a local Anvil node in one terminal:

```bash
anvil
```

Then deploy in a second terminal:

```bash
forge script script/Deploy.s.sol:DeployScript --rpc-url http://localhost:8545 --broadcast -vvvv
```

This will print:

```
BatchSend deployed to: 0x...
MockToken deployed to: 0x...
```

Copy both addresses — you'll need them next.

### Update constants

In `src/constants/index.ts`, update the `31337` entry with your deployed `BatchSend` address:

```ts
31337: {
  tsender: "<BatchSend address>",
  no_check: "<BatchSend address>",
},
```

### Connect wallet

Make sure your MetaMask or Rabby wallet is connected to your local Anvil instance (`localhost:8545`, chain ID `31337`). Use one of Anvil's default accounts — they come pre-funded with ETH and MockTokens.

To import MockToken into your wallet:
1. Open MetaMask → Import Token
2. Paste the `MockToken` address printed during deployment

### Run the app

```bash
pnpm run dev
```

Paste the `MockToken` address into the **Token Address** field and you're ready to airdrop.

# Testing

## Unit

```bash
pnpm test:unit
```

## E2E

Playwright should also install the browsers needed to run tests.

To test e2e, do the following:

```bash
pnpm cache
```

Then run:

```bash
pnpm test:e2e
```

This will throw an error like:

```
Error: Cache for 08a20e3c7fc77e6ae298 does not exist. Create it first!
```

The `08a20e3c7fc77e6ae298` is your `CACHE_NAME`.

In your `.cache-synpress` folder, rename the folder that isn't `metamask-chrome-***` to your `CACHE_NAME`.

Then, you should be able to run:

```
pnpm test:e2e
```

And it'll work!


<!-- # Install from scratch notes

When adding Tailwind, remember to remove `supports-color` -->

<!-- Testing: -->
<!-- -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths -->