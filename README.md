# Axiom

**Internal Communications Platform**

Production-grade internal messaging with enforced role hierarchy, real-time delivery, and tamper-proof blockchain audit trail.

## Features

- **Real-time messaging** — under 100ms delivery via Socket.io
- **Role hierarchy** — superadmin > moderator > member, enforced server-side
- **Slash commands** — /kick, /promote, /ban, /create-room, and more
- **Blockchain audit trail** — admin actions written to Polygon Amoy testnet
- **E2EE direct messages** — NaCl box encryption, server stores only ciphertext
- **Redis presence** — 30s TTL, auto-expires on crash

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Zustand, TanStack Query, Socket.io-client
- **Backend**: Express.js, TypeScript, Socket.io, Supabase (PostgreSQL), Upstash Redis
- **Blockchain**: Polygon Amoy testnet, ethers.js v6, opossum circuit breaker
- **Security**: bcrypt (rounds 12), JWT (HMAC-SHA256), NaCl (X25519-XSalsa20-Poly1305)

## Quick Start

```bash
# Backend
cd backend
cp ../.env.example .env  # Fill in your keys
npm install
npm run seed
npm run dev

# Frontend (new terminal)
cd frontend
echo "NEXT_PUBLIC_API_URL=http://localhost:4000" > .env.local
echo "NEXT_PUBLIC_SOCKET_URL=http://localhost:4000" >> .env.local
npm install
npm run dev
```

## Deployment

- **Backend**: Render (Node 20, build: `npm run build`, start: `node dist/index.js`)
- **Frontend**: Vercel (Next.js preset, root: `/frontend`)

## Contract

Already deployed at `0xd9145CCE52D386f254917e481eB44e9943F39138` on Polygon Amoy.
