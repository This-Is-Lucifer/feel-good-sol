import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Copy, Check, ArrowLeft, Wallet } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const RECIPIENT_WALLET = "6uMVznyeBD78PkBKucC3QyoqTgyyfmdgR6MAdPmkEddL";
const PRESET_AMOUNTS = [0.1, 0.25, 0.5, 1, 2, 5];
const LAMPORTS_PER_SOL = 1_000_000_000;

const Support = () => {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copied, setCopied] = useState(false);

  const activeAmount = selectedAmount ?? (customAmount ? parseFloat(customAmount) : 0);

  const copyAddress = async () => {
    await navigator.clipboard.writeText(RECIPIENT_WALLET);
    setCopied(true);
    toast.success("Wallet address copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDonate = async () => {
    if (!activeAmount || activeAmount <= 0) {
      toast.error("Please select or enter an amount.");
      return;
    }

    const provider = (window as any).phantom?.solana;
    if (!provider?.isPhantom) {
      toast.error("Phantom wallet not found. Please install Phantom to donate.");
      window.open("https://phantom.app/", "_blank");
      return;
    }

    try {
      setIsSending(true);

      // Connect wallet if not connected
      if (!provider.isConnected) {
        await provider.connect();
      }

      const { PublicKey, Transaction, SystemProgram, Connection } = await import("@solana/web3.js");

      // Use Phantom's own connection to avoid public RPC CORS/rate-limit issues
      const connection = new Connection("https://mainnet.helius-rpc.com/?api-key=15319bf4-47d5-4e17-8c27-45956b2767d3", "confirmed");
      const fromPubkey = provider.publicKey;
      const toPubkey = new PublicKey(RECIPIENT_WALLET);
      const lamports = Math.round(activeAmount * LAMPORTS_PER_SOL);

      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports,
        })
      );

      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = fromPubkey;

      const { signature } = await provider.signAndSendTransaction(transaction);

      toast.success(`Thank you! ${activeAmount} SOL sent successfully 🎉`);
      setSelectedAmount(null);
      setCustomAmount("");
    } catch (err: any) {
      console.error("Donation error:", err);
      if (err?.code === 4001 || err?.message?.includes("rejected")) {
        toast.error("Transaction cancelled.");
      } else {
        toast.error("Transaction failed. Please try again.");
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center px-4 py-12">
      {/* Back link */}
      <div className="w-full max-w-lg mb-8">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Support <span className="text-primary">MindFi</span>
          </h1>
          <p className="text-muted-foreground font-body text-sm md:text-base max-w-md mx-auto">
            Help us keep MindFi free and accessible for every trader. Your SOL donation fuels development and community growth.
          </p>
        </div>

        {/* Amount Selection */}
        <div className="bg-card/60 backdrop-blur-xl border border-border rounded-2xl p-6 mb-6">
          <h2 className="font-display text-lg font-semibold mb-4">Choose an amount (SOL)</h2>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {PRESET_AMOUNTS.map((amt) => (
              <button
                key={amt}
                onClick={() => { setSelectedAmount(amt); setCustomAmount(""); }}
                className={`py-3 rounded-xl font-display font-semibold text-sm transition-all border ${
                  selectedAmount === amt
                    ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                    : "bg-secondary/50 text-foreground border-border hover:border-primary/50"
                }`}
              >
                {amt} SOL
              </button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="relative">
            <input
              type="number"
              min="0.001"
              step="0.001"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedAmount(null);
              }}
              placeholder="Custom amount"
              className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 transition-colors"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">SOL</span>
          </div>
        </div>

        {/* Donate Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDonate}
          disabled={isSending || !activeAmount || activeAmount <= 0}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-base disabled:opacity-40 hover:opacity-90 transition-all mb-6"
        >
          {isSending ? (
            <>
              <Wallet className="w-5 h-5 animate-pulse" />
              Confirming in Phantom...
            </>
          ) : (
            <>
              <Wallet className="w-5 h-5" />
              Donate {activeAmount > 0 ? `${activeAmount} SOL` : ""}
            </>
          )}
        </motion.button>

        {/* Wallet Address */}
        <div className="bg-card/60 backdrop-blur-xl border border-border rounded-2xl p-5">
          <p className="text-xs text-muted-foreground mb-4 font-body">Or send manually to:</p>
          <div className="flex flex-col items-center gap-4 mb-4">
            <div className="bg-white p-3 rounded-xl">
              <QRCodeSVG
                value={`solana:${RECIPIENT_WALLET}`}
                size={160}
                bgColor="#ffffff"
                fgColor="#000000"
                level="H"
              />
            </div>
            <p className="text-xs text-muted-foreground">Scan with your Solana wallet</p>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs text-foreground/80 bg-secondary/50 rounded-lg px-3 py-2 overflow-hidden text-ellipsis">
              {RECIPIENT_WALLET}
            </code>
            <button
              onClick={copyAddress}
              className="p-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4 text-muted-foreground" />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Support;

