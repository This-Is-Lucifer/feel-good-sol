import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, ChevronDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type WalletType = "phantom" | "metamask" | null;

const WalletConnect = () => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [walletType, setWalletType] = useState<WalletType>(null);
  const [showDropdown, setShowDropdown] = useState(false);

  const isInIframe = () => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  };

  const connectPhantom = async () => {
    setShowDropdown(false);

    if (isInIframe()) {
      toast({
        title: "Open in a new tab",
        description: "Wallet extensions can't be accessed inside the preview. Open the published URL directly.",
        variant: "destructive",
      });
      return;
    }

    const phantom = (window as any)?.phantom?.solana || (window as any)?.solana;

    if (phantom?.isPhantom) {
      try {
        const resp = await phantom.connect();
        const addr = resp.publicKey.toString();
        setAddress(addr);
        setConnected(true);
        setWalletType("phantom");
        toast({ title: "Phantom connected", description: addr.slice(0, 8) + "..." });
      } catch {
        toast({ title: "Connection rejected", description: "You declined the Phantom request.", variant: "destructive" });
      }
    } else {
      toast({ title: "Phantom not found", description: "Redirecting to install Phantom..." });
      window.open("https://phantom.app/", "_blank");
    }
  };

  const connectMetaMask = async () => {
    setShowDropdown(false);

    if (isInIframe()) {
      toast({
        title: "Open in a new tab",
        description: "Wallet extensions can't be accessed inside the preview. Open the published URL directly.",
        variant: "destructive",
      });
      return;
    }

    const ethereum = (window as any)?.ethereum;

    if (ethereum?.isMetaMask) {
      try {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        const addr = accounts[0];
        setAddress(addr);
        setConnected(true);
        setWalletType("metamask");
        toast({ title: "MetaMask connected", description: addr.slice(0, 8) + "..." });
      } catch {
        toast({ title: "Connection rejected", description: "You declined the MetaMask request.", variant: "destructive" });
      }
    } else {
      toast({ title: "MetaMask not found", description: "Redirecting to install MetaMask..." });
      window.open("https://metamask.io/download/", "_blank");
    }
  };

  const handleDisconnect = async () => {
    if (walletType === "phantom") {
      const phantom = (window as any)?.phantom?.solana || (window as any)?.solana;
      if (phantom) await phantom.disconnect();
    }
    setConnected(false);
    setAddress("");
    setWalletType(null);
  };

  const truncated = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "";

  return (
    <div className="relative">
      <motion.button
        onClick={connected ? handleDisconnect : () => setShowDropdown(!showDropdown)}
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
        {!connected && <ChevronDown className="w-3 h-3" />}
      </motion.button>

      {showDropdown && !connected && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="absolute right-0 top-full mt-2 z-50 w-52 rounded-xl border border-border bg-card shadow-lg overflow-hidden"
          >
            <button
              onClick={connectPhantom}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm font-display text-foreground hover:bg-accent transition-colors"
            >
              <img src="https://phantom.app/img/phantom-icon-purple.svg" alt="Phantom" className="w-5 h-5" />
              Phantom (Solana)
            </button>
            <div className="border-t border-border" />
            <button
              onClick={connectMetaMask}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm font-display text-foreground hover:bg-accent transition-colors"
            >
              <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" alt="MetaMask" className="w-5 h-5" />
              MetaMask (EVM)
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default WalletConnect;
