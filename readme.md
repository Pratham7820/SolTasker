# SolTasker

A decentralized feedback platform built on Solana, where users can post tasks/feedback requests and workers can complete them, with payments settled on-chain.

🔗 **Live app for user:** [sol-tasker-five.vercel.app](https://sol-tasker-five.vercel.app)
🔗 **Live app for worker:** [sol-tasker-6ad9.vercel.app](https://sol-tasker-6ad9.vercel.app)

## Overview

SolTasker connects two sides of a feedback economy:

- **Users** — post tasks or feedback requests and pay workers in SOL for completing them
- **Workers** — browse and complete available tasks, with earnings withdrawn directly to their Solana wallet

The platform handles wallet-based authentication, on-chain payments, and withdrawal processing, with safeguards against race conditions and double-spend issues on the Solana side.

## Tech Stack

**Backend**
- TypeScript / Express
- Prisma ORM
- PostgreSQL (hosted on Aiven)
- Solana Web3.js for on-chain integration

**Frontend** (two separate Next.js apps)
- `user-frontend` — the user-facing app for posting and managing tasks
- `worker-frontend` — the worker-facing app for browsing and completing tasks
- Solana Wallet Adapter for wallet connections

**Deployment**
- Backend: [Railway](https://railway.app/)
- Frontends: [Vercel](https://vercel.com/)

## Project Structure

```
SolTasker/
├── backend/            # Express API, Prisma schema, Solana integration
├── user-frontend/       # Next.js app for users
└── worker-frontend/     # Next.js app for workers
```

## Getting Started

### Prerequisites
- Node.js
- A PostgreSQL database (e.g. Aiven)
- A Solana RPC endpoint (devnet or mainnet) (e.g. Alchemy)

### Installation

```bash
git clone https://github.com/Pratham7820/SolTasker.git
cd SolTasker
npm install on each folder
```

### Environment Variables

Each app (`backend`, `user-frontend`, `worker-frontend`) requires its own `.env` file.Each folder contains the `.env.example`. 

### Running Locally

Run each app individually from its own directory:

```bash
cd backend && npm run dev
cd user-frontend && npm run dev
cd worker-frontend && npm run dev
```
