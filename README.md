# Collabify: Real-Time Smart Freelance Workspace (Core MVP)

[![Tech Stack](https://img.shields.io/badge/Stack-React%20%7C%20TypeScript%20%7C%20Tailwind%20%7C%20Node.js-blue)](https://github.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Uptime](https://img.shields.io/badge/SSE_Real--Time-Active-emerald)](https://ais-dev-yd5r6v6vraj4qpnv4erteg-1008625321278.asia-southeast1.run.app)

**Collabify** is a high-fidelity, end-to-end workspace connecting international clients and elite freelancers securely. Built to bypass high platform fees, Collabify integrates a live job board, a bids negotiation console, a secure chat line, and a Drag-and-Drop Document Vault supporting high-payload source files or briefs, powered by a persistent real-time event system.

---

## 🎨 Creative Aesthetic & Themes

Collabify utilizes an **immersive, high-contrast dark theme** styled with meticulous attention to typography paired with responsive micro-animations.
- **Display Typography**: Styled using `Space Grotesk` or clean font pairings.
- **Console Typography**: Structured with `JetBrains Mono` for precise logs, bids, and files metadata.
- **Color Accentuation**: Dark ambient slate background (`#0B0F19`) elevated by electric cobalt borders (`#3B82F6`) and success emerald badges, optimizing focus and eye safety.

---

## ⚡ Core Technical Architecture

```
                       ┌──────────────────────────────┐
                       │       Collabify Client       │
                       │   (React 19 + Tailwind V4)   │
                       └──────────────┬───────────────┘
                                      │
              Rest APIs               │      Server-Sent Events (SSE)
     (POST jobs/proposals/chats)      │      (Real-time live broadcast)
                                      ▼
                       ┌──────────────────────────────┐
                       │      Express Web Server      │
                       │     (Node.js REST / SSE)     │
                       └──────────────────────────────┘
```

1. **Vite + React 19 Frontend**: Componentized architecture divided into single-view dashboards, live chat consoles, and role-switching controls.
2. **Node.js + Express REST API Backend**: Full-stack design incorporating an in-memory database of active jobs, custom proposals, and secured message lines.
3. **Server-Sent Events (SSE) Engine**: Features a broadcast subscription channel at `/api/realtime/stream` that dynamically broadcasts job creation, proposal updates, milestone statuses, and live messages to all active client panes without expensive database polling.
4. **Document & Asset Vault**: Supports Drag-and-Drop file processing, encoding documents as high-payload Base64 hashes securely stored and downloadable in-context.

---

## 🛠️ Feature Breakdown

### 💼 1. Client Console
- **Instant Job Composer**: Submit job posts with specialized developer tag criteria and budgets.
- **Incoming Proposals Board**: Real-time bidding overview to examine cover letters, negotiable delivery timelines, and ratings.
- **Milestone Management**: Secure contracts validation with dynamic "Approve & Pay" disbursements.

### 💻 2. Freelancer Console
- **Smart Job Feed**: Real-time indexed jobs list. Filter by search queries, budget brackets, and tags.
- **Pitches Dashboard**: Inspect the status of submitted bids ("pending", "accepted", "declined").
- **Contracts Status Panel**: Visually track milestone advancements in locked scopes.

### 💬 3. Chat System & Document Vault
- **AES-256 Mock Encrypted Chat Room**: Automated initialization of real-time negotiation channels.
- **Drag-and-Drop Upload**: Secure briefs sharing with support for files up to 4MB encoded into URL streams.

---

## 🚀 Installation & Local Execution

Prerequisites: [Node.js v18+](https://nodejs.org/) installed.

### 1. Clone & Set Up Directory
```bash
git clone https://github.com/your-username/collabify-workspace.git
cd collabify-workspace
```

### 2. Install Project Dependencies
```bash
npm install
```

### 3. Run Development Server
Spins up both the Express server backend and the Vite frontend context concurrently on port `3000`:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 4. Build for Production Optimization
Compiles the static frontend assets and bundles the Node backend server into a single, optimized CommonJS file to prevent runtime module resolution issues:
```bash
npm run build
```

### 5. Run Live Container Instance
```bash
npm run start
```

---

## 🌍 Cloud Deployment Strategy

To showcase this portfolio applet to international clients, deploy using these recommended workflows:

### A. Frontend + Backend Joint Host (Railway / Render / Google Cloud Run)
Because Collabify is structured as a **full-stack unified application**, hosting the custom Express server automatically handles serving static files in production.
1. Create a project on [Railway](https://railway.app) or [Render](https://render.com).
2. Connect your GitHub repository.
3. Set the build command to `npm run build` and the start command to `npm run start`.
4. Ensure the environment variable `NODE_ENV` is set to `production`.

### B. Mitigating Real-Time Idle Disconnects (SSE Sleep State Solutions)
When utilizing free cloud tiers (like Render or Railway), idle servers fall into sleep states (Cold Starts). To keep real-time channels active:
- **Ping Keep-Alive Comments**: The Collabify Express backend sends dynamic visual `:ok` comments initially. Add an active interval worker on the client side that periodically executes a `HEAD` request to keep the websocket/SSE connection persistent.
- **Auto-Reconnect Loop**: The client-side subscription loop automatically reconnects with safety backoffs if the HTTP event stream terminates.

---

## 🧪 Testing Credentials (Local/Shared Preview)

Toggle smoothly between pre-seeded interactive users using the **Role Switcher Header** directly in the UI:

| Role | Name | Focus Stack / Tech | Usage Purpose |
|------|------|--------------------|---------------|
| **Client** | TechStart Inc. | Financial SaaS & Dashboards | Post jobs, inspect bids, pay contracts |
| **Client** | AURA Digital | Brand Design & UI/UX | Review files & creative profiles |
| **Freelancer** | Alex Rivera | Full-Stack React & Node | Submit pitches & share codes in chat |
| **Freelancer** | Sarah Chen | Product & UI/UX Designer | Submit spring-animated UI mockups |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
