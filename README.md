# 👻 Ghost – The First Programmable Disappearing dApp

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with React](https://img.shields.io/badge/Built%20with-React-61dafb)](https://reactjs.org/)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.x-363636)](https://soliditylang.org/)

**Ghost** is a new type of decentralized application where blockchain rooms exist only temporarily and permanently self‑destruct after fulfilling their purpose. Unlike traditional dApps built for permanent storage, Ghost introduces *programmable impermanence* – temporary decentralized realities that automatically disappear after a timer, event, or condition is completed.

🔗 **Live Demo**: [https://your-demo-url.vercel.app](https://ethghostvert.vercel.app/)  
📄 **Smart Contracts address**: [0xaF4E698C975DbeBe3cE243e746C8F481459EfB47]

---

## ✨ Key Features

- 🕳️ **Temporary Blockchain Rooms** – Create rooms that automatically expire after a chosen duration.
- 🔥 **On‑Chain Self‑Destruction** – Rooms permanently lock and become inaccessible after expiration.
- 👛 **Wallet‑Based Access** – Interact with any EVM‑compatible wallet (Portaldot, MetaMask, etc.).
- ⏳ **Live Countdown System** – Each room displays a real‑time timer until destruction.
- 💬 **Temporary Messaging** – Participants can send ephemeral messages before the room disappears.
- 📜 **Proof of Destruction** – The blockchain permanently records that the room existed and was destroyed.
- 🧩 **Open Source Contracts** – Core smart contracts are fully auditable and open.

---

## 🧠 The Problem & Solution

Most blockchain applications are designed around **permanence** – permanent records, permanent contracts, permanent communities. But many real‑world interactions are temporary: confidential negotiations, one‑time votes, short‑term collaborations, self‑expiring agreements.

**Ghost** builds native infrastructure for **temporary decentralized interactions**. Rooms self‑destruct after their purpose is fulfilled, creating a new blockchain interaction model where disappearance is a feature, not a bug.

---

## 🚀 Use Cases

| Use Case | Description |
|----------|-------------|
| 🗳️ Temporary DAO Voting | A DAO vote exists only until voting finishes, then self‑destructs. |
| 🤐 One‑Time Secret Collaboration | Teams collaborate without leaving permanent accessible records. |
| 📝 Self‑Destructing Agreements | Parties approve agreements that disappear after execution. |
| 🎟️ Temporary Event Access | Rooms act as temporary access spaces for events or communities. |

---

## 🏗️ Technical Architecture

### Blockchain (EVM – Portaldot)

- **Smart Contracts**: Solidity `^0.8.0`
- **Core Functions**:
  - `createRoom(expirationTimestamp, participants[])`
  - `sendMessage(roomId, content)`
  - `destroyRoom(roomId)` (automatically called after expiration)
  - `getRoom(roomId)`
- **Gas Token**: POT (Portaldot native token)

### Frontend

- **Framework**: React + Vite
- **Styling**: CSS modules 
- **Wallet Integration**: ethers.js
- **Hosting**: Vercel 

### Contract Structure (Simplified)

```solidity
struct Room {
    address creator;
    uint256 expirationTimestamp;
    mapping(address => string[]) messages;
    bool destroyed;
}
