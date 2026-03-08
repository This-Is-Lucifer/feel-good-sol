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

    console.log("Phantom provider:", phantom);
    console.log("isPhantom:", phantom?.isPhantom);

    if (phantom?.isPhantom) {
      try {
        const resp = await phantom.connect({ onlyIfTrusted: false });
        const addr = resp.publicKey.toString();
        setAddress(addr);
        setConnected(true);
        setWalletType("phantom");
        toast({ title: "Phantom connected", description: addr.slice(0, 8) + "..." });
      } catch (err: any) {
        console.error("Phantom connect error:", err);
        toast({
          title: "Connection failed",
          description: err?.message || "Phantom connection was rejected or timed out.",
          variant: "destructive",
        });
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
              className="group flex items-center gap-3 w-full px-4 py-3 text-sm font-display text-foreground hover:bg-primary/10 hover:text-primary active:bg-primary/20 transition-all cursor-pointer"
            >
              <div className="p-1 rounded-lg group-hover:bg-primary/10 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 128 128" fill="none"><rect width="128" height="128" rx="26" fill="#AB9FF2"/><path d="M110.5 64.2c0-1-.8-1.8-1.8-1.8H97.5c-1 0-1.8.8-1.8 1.8 0 16.4-13.3 29.7-29.7 29.7S36.3 80.6 36.3 64.2c0-16.4 13.3-29.7 29.7-29.7 7.5 0 14.3 2.8 19.5 7.3.7.6 1.8.5 2.4-.2l7.9-9.4c.6-.7.5-1.8-.2-2.4C87.8 23 77.5 19 66 19 41.1 19 20.8 39.3 20.8 64.2S41.1 109.4 66 109.4s45.2-20.3 45.2-45.2h-.7z" fill="#fff"/><circle cx="44.5" cy="58" r="5.5" fill="#fff"/><circle cx="66" cy="58" r="5.5" fill="#fff"/></svg>
              </div>
              Phantom (Solana)
            </button>
            <div className="border-t border-border" />
            <button
              onClick={connectMetaMask}
              className="group flex items-center gap-3 w-full px-4 py-3 text-sm font-display text-foreground hover:bg-primary/10 hover:text-primary active:bg-primary/20 transition-all cursor-pointer"
            >
              <div className="p-1 rounded-lg group-hover:bg-primary/10 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 35 33" fill="none"><path d="M32.96 1l-13.14 9.72 2.45-5.73L32.96 1z" fill="#E2761B" stroke="#E2761B" strokeLinecap="round" strokeLinejoin="round"/><path d="M2.66 1l13.02 9.81L13.35 4.99 2.66 1zm25.57 22.53l-3.5 5.34 7.49 2.06 2.14-7.28-6.13-.12zm-26.96.12l2.13 7.28 7.47-2.06-3.48-5.34-6.12.12z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/><path d="M10.47 14.51l-2.08 3.14 7.4.34-.24-7.97-5.08 4.49zm14.68 0l-5.16-4.58-.17 8.06 7.4-.34-2.07-3.14zm-14.36 14.02l4.46-2.16-3.86-3.01-.6 5.17zm9.71-2.16l4.49 2.16-.63-5.17-3.86 3.01z" fill="#E4761B" stroke="#E4761B" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              MetaMask (EVM)
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default WalletConnect;
