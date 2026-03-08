import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const WalletConnect = () => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");

  const isInIframe = () => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  };

  const handleConnect = async () => {

    // In iframe, wallet extensions are inaccessible
    if (inIframe) {
      toast({
        title: "Open in a new tab",
        description: "Wallet extensions can't be accessed inside the preview. Open the published URL directly in your browser.",
        variant: "destructive",
      });
      return;
    }

    const solana = (window as any)?.solana;
    const phantom = (window as any)?.phantom?.solana;
    const provider = phantom || solana;

    if (provider?.isPhantom) {
      try {
        const resp = await provider.connect();
        const addr = resp.publicKey.toString();
        setAddress(addr);
        setConnected(true);
        toast({ title: "Wallet connected", description: addr.slice(0, 8) + "..." });
      } catch {
        toast({ title: "Connection rejected", description: "You declined the wallet request.", variant: "destructive" });
      }
    } else {
      toast({ title: "Phantom not found", description: "Redirecting to install Phantom..." });
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
