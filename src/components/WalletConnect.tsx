import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";

const WalletConnect = () => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");

  const handleConnect = async () => {
    // Check for Phantom wallet
    const solana = (window as any)?.solana;
    if (solana?.isPhantom) {
      try {
        const resp = await solana.connect();
        const addr = resp.publicKey.toString();
        setAddress(addr);
        setConnected(true);
      } catch {
        // User rejected
      }
    } else {
      window.open("https://phantom.app/", "_blank");
    }
  };

  const handleDisconnect = async () => {
    const solana = (window as any)?.solana;
    if (solana) {
      await solana.disconnect();
    }
    setConnected(false);
    setAddress("");
  };

  const truncated = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "";

  return (
    <motion.button
      onClick={connected ? handleDisconnect : handleConnect}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-display text-sm font-medium transition-colors border ${
        connected
          ? "border-primary/30 bg-primary/10 text-primary hover:bg-primary/15"
          : "border-border bg-secondary hover:bg-secondary/80 text-foreground"
      }`}
    >
      <Wallet className="w-4 h-4" />
      {connected ? truncated : "Connect Wallet"}
    </motion.button>
  );
};

export default WalletConnect;
