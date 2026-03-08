import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet, ChevronDown, RefreshCw, LogOut, Copy, Check } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const WalletConnect = () => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState<number | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const isInIframe = () => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  };

  const getProvider = () => (window as any)?.phantom?.solana;

  const fetchBalance = async (addr: string) => {
    try {
      const res = await fetch("https://api.mainnet-beta.solana.com", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "getBalance",
          params: [addr],
        }),
      });
      const data = await res.json();
      if (data?.result?.value !== undefined) {
        setBalance(data.result.value / 1e9);
      }
    } catch (err) {
      console.error("Failed to fetch balance:", err);
      setBalance(null);
    }
  };

  const connectPhantom = async () => {
    setShowMenu(false);

    if (isInIframe()) {
      toast({
        title: "Open in a new tab",
        description: "Wallet extensions can't be accessed inside the preview. Open the published URL directly.",
        variant: "destructive",
      });
      return;
    }

    const provider = getProvider();

    if (!provider?.isPhantom) {
      toast({ title: "Phantom not found", description: "Redirecting to install Phantom..." });
      window.open("https://phantom.app/", "_blank");
      return;
    }

    try {
      try { await provider.disconnect(); } catch {}
      const resp = await provider.connect();
      const addr = resp.publicKey.toString();
      setAddress(addr);
      setConnected(true);
      fetchBalance(addr);
      toast({ title: "Phantom connected", description: addr.slice(0, 8) + "..." });
    } catch (err: any) {
      console.error("Phantom connect error:", err);
      try {
        const signInResp = await provider.signIn?.();
        if (signInResp?.address) {
          const addr = signInResp.address.toString();
          setAddress(addr);
          setConnected(true);
          fetchBalance(addr);
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

  const switchWallet = async () => {
    setShowMenu(false);

    if (isInIframe()) {
      toast({
        title: "Open in a new tab",
        description: "Wallet extensions can't be accessed inside the preview.",
        variant: "destructive",
      });
      return;
    }

    const provider = getProvider();
    if (!provider?.isPhantom) return;

    try {
      await provider.disconnect();
      const resp = await provider.connect({ onlyIfTrusted: false });
      const addr = resp.publicKey.toString();
      setAddress(addr);
      setConnected(true);
      fetchBalance(addr);
      toast({ title: "Wallet switched", description: addr.slice(0, 8) + "..." });
    } catch (err: any) {
      console.error("Switch wallet error:", err);
      toast({
        title: "Switch failed",
        description: err?.message || "Could not switch wallet.",
        variant: "destructive",
      });
    }
  };

  const handleDisconnect = async (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowMenu(false);
    setConnected(false);
    setAddress("");
    setBalance(null);
    try {
      const provider = getProvider();
      if (provider) await provider.disconnect();
    } catch {}
    toast({ title: "Wallet disconnected" });
  };

  // Listen for account changes in Phantom
  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;

    const handleAccountChanged = (publicKey: any) => {
      if (publicKey) {
        const addr = publicKey.toString();
        setAddress(addr);
        fetchBalance(addr);
        toast({ title: "Account changed", description: addr.slice(0, 8) + "..." });
      } else {
        setConnected(false);
        setAddress("");
        setBalance(null);
      }
    };

    provider.on("accountChanged", handleAccountChanged);
    return () => {
      provider.removeListener?.("accountChanged", handleAccountChanged);
    };
  }, []);

  const truncated = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : "";
  const balanceDisplay = balance !== null ? `${balance.toFixed(4)} SOL` : "◎ ...";

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="relative z-50">
      <TooltipProvider delayDuration={200}>
        <Tooltip open={showMenu ? false : undefined}>
          <TooltipTrigger asChild>
            <motion.button
              onClick={connected ? () => setShowMenu(!showMenu) : connectPhantom}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`relative z-50 flex items-center gap-2 px-5 py-2.5 rounded-xl font-display text-sm font-medium transition-all border ${
                connected
                  ? "border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 shadow-[0_0_12px_hsl(var(--primary)/0.15)]"
                  : "border-border bg-secondary hover:bg-secondary/80 text-foreground"
              }`}
            >
              <Wallet className="w-4 h-4" />
              {connected ? (
                <span className="flex items-center gap-2">
                  <span className="font-mono tracking-wide">{truncated}</span>
                  <span className="w-1 h-1 rounded-full bg-primary/50" />
                  <span className="text-xs text-primary/70">{balanceDisplay}</span>
                </span>
              ) : (
                "Connect Wallet"
              )}
              {connected && <ChevronDown className={`w-3 h-3 transition-transform ${showMenu ? "rotate-180" : ""}`} />}
            </motion.button>
          </TooltipTrigger>
          {connected && !showMenu && (
            <TooltipContent side="bottom" className="font-mono text-xs max-w-[320px] break-all flex items-center gap-2">
              <span>{address}</span>
              <button onClick={copyAddress} className="shrink-0 hover:text-primary transition-colors">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </button>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>

      {showMenu && connected && (
        <>
          <div className="fixed inset-0 z-[60]" onClick={() => setShowMenu(false)} />
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 top-full mt-2 z-[70] w-52 rounded-xl border border-border bg-card shadow-lg overflow-hidden"
          >
            <button
              onClick={switchWallet}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm font-display text-foreground hover:bg-primary/10 hover:text-primary active:bg-primary/20 transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Switch Wallet
            </button>
            <div className="border-t border-border" />
            <button
              onClick={handleDisconnect}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm font-display text-destructive hover:bg-destructive/10 active:bg-destructive/20 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              Disconnect
            </button>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default WalletConnect;
