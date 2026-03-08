import { useState } from "react";
import { motion } from "framer-motion";
import { Wallet, ChevronDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";

type WalletType = "phantom" | "metamask" | null;

const WalletConnect = () => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [walletType, setWalletType] = useState<WalletType>(null);
  

  const isInIframe = () => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  };

  const connectPhantom = async () => {


    if (isInIframe()) {
      toast({
        title: "Open in a new tab",
        description: "Wallet extensions can't be accessed inside the preview. Open the published URL directly.",
        variant: "destructive",
      });
      return;
    }

    const provider = (window as any)?.phantom?.solana;

    if (!provider?.isPhantom) {
      toast({ title: "Phantom not found", description: "Redirecting to install Phantom..." });
      window.open("https://phantom.app/", "_blank");
      return;
    }

    try {
      // Disconnect first to clear any stale state
      try { await provider.disconnect(); } catch {}
      
      const resp = await provider.connect();
      const addr = resp.publicKey.toString();
      setAddress(addr);
      setConnected(true);
      setWalletType("phantom");
      toast({ title: "Phantom connected", description: addr.slice(0, 8) + "..." });
    } catch (err: any) {
      console.error("Phantom connect error:", err);
      
      // Fallback: try signIn method if connect fails
      try {
        const signInResp = await provider.signIn?.();
        if (signInResp?.address) {
          const addr = signInResp.address.toString();
          setAddress(addr);
          setConnected(true);
          setWalletType("phantom");
          toast({ title: "Phantom connected", description: addr.slice(0, 8) + "..." });
          return;
        }
      } catch {}

      toast({
        title: "Connection failed",
        description: "Please make sure Phantom is unlocked and try again.",
        variant: "destructive",
      });
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

    console.log("Ethereum provider:", ethereum);
    console.log("isMetaMask:", ethereum?.isMetaMask);

    if (ethereum?.isMetaMask) {
      try {
        const accounts = await ethereum.request({ method: "eth_requestAccounts" });
        const addr = accounts[0];
        setAddress(addr);
        setConnected(true);
        setWalletType("metamask");
        toast({ title: "MetaMask connected", description: addr.slice(0, 8) + "..." });
      } catch (err: any) {
        console.error("MetaMask connect error:", err);
        toast({
          title: "Connection failed",
          description: err?.message || "MetaMask connection was rejected.",
          variant: "destructive",
        });
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
        onClick={connected ? handleDisconnect : connectPhantom}
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
    </div>
  );
};

export default WalletConnect;
