export const GHOST_ROOM_ABI = [
  {
    "inputs": [{"internalType": "string","name": "name","type": "string"},{"internalType": "uint256","name": "duration","type": "uint256"}],
    "name": "createRoom",
    "outputs": [{"internalType": "uint256","name": "roomId","type": "uint256"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "roomId","type": "uint256"}],
    "name": "joinRoom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "roomId","type": "uint256"},{"internalType": "string","name": "content","type": "string"}],
    "name": "sendMessage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "roomId","type": "uint256"}],
    "name": "destroyRoom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "roomId","type": "uint256"}],
    "name": "getRoom",
    "outputs": [{"components": [{"internalType": "uint256","name": "id","type": "uint256"},{"internalType": "address","name": "creator","type": "address"},{"internalType": "string","name": "name","type": "string"},{"internalType": "uint256","name": "expiresAt","type": "uint256"},{"internalType": "bool","name": "destroyed","type": "bool"},{"internalType": "bool","name": "isLive","type": "bool"},{"internalType": "uint256","name": "participantCount","type": "uint256"},{"internalType": "uint256","name": "messageCount","type": "uint256"},{"internalType": "uint256","name": "secondsRemaining","type": "uint256"}],"internalType": "struct GhostRoom.RoomView","name": "","type": "tuple"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "roomId","type": "uint256"}],
    "name": "getMessages",
    "outputs": [{"components": [{"internalType": "address","name": "sender","type": "address"},{"internalType": "string","name": "content","type": "string"},{"internalType": "uint256","name": "timestamp","type": "uint256"}],"internalType": "struct GhostRoom.Message[]","name": "","type": "tuple[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "roomId","type": "uint256"}],
    "name": "getParticipants",
    "outputs": [{"internalType": "address[]","name": "","type": "address[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address","name": "user","type": "address"}],
    "name": "getUserRooms",
    "outputs": [{"internalType": "uint256[]","name": "","type": "uint256[]"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256","name": "roomId","type": "uint256"},{"internalType": "address","name": "user","type": "address"}],
    "name": "isParticipant",
    "outputs": [{"internalType": "bool","name": "","type": "bool"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalRooms",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true,"internalType": "uint256","name": "roomId","type": "uint256"},{"indexed": true,"internalType": "address","name": "creator","type": "address"},{"indexed": false,"internalType": "string","name": "name","type": "string"},{"indexed": false,"internalType": "uint256","name": "expiresAt","type": "uint256"}],
    "name": "RoomCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true,"internalType": "uint256","name": "roomId","type": "uint256"},{"indexed": true,"internalType": "address","name": "triggeredBy","type": "address"},{"indexed": false,"internalType": "uint256","name": "destroyedAt","type": "uint256"}],
    "name": "RoomDestroyed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [{"indexed": true,"internalType": "uint256","name": "roomId","type": "uint256"},{"indexed": true,"internalType": "address","name": "sender","type": "address"},{"indexed": false,"internalType": "uint256","name": "messageIndex","type": "uint256"},{"indexed": false,"internalType": "uint256","name": "timestamp","type": "uint256"}],
    "name": "MessageSent",
    "type": "event"
  }
];

// Replace with your deployed contract address
export const GHOST_ROOM_ADDRESS = import.meta.env.VITE_GHOST_ROOM_ADDRESS || "0x0000000000000000000000000000000000000000";
