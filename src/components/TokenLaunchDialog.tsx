import { useState } from "react";
import { Rocket, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Connection, Transaction, Keypair } from "@solana/web3.js";

const RPC = "https://api.mainnet-beta.solana.com";
const connection = new Connection(RPC);

interface TokenLaunchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

async function uploadMetadata(name: string, symbol: string, description: string, image: string) {
  const res = await fetch("https://pumpportal.fun/api/ipfs", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, symbol, description, image }),
  });
  const data = await res.json();
  return data.metadataUri;
}

async function createPumpToken(
  provider: any,
  formData: { name: string; symbol: string; description: string; image: string }
) {
  const wallet = provider.publicKey.toString();

  const metadataUri = await uploadMetadata(
    formData.name,
    formData.symbol,
    formData.description,
    formData.image
  );
  console.log("Metadata URI:", metadataUri);

  const mint = Keypair.generate();

  const res = await fetch("https://pumpportal.fun/api/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      wallet,
      name: formData.name,
      symbol: formData.symbol,
      uri: metadataUri,
      mint: mint.publicKey.toString(),
    }),
  });

  const data = await res.json();

  const tx = Transaction.from(
    Uint8Array.from(atob(data.tx), (c) => c.charCodeAt(0))
  );
  tx.feePayer = provider.publicKey;

  const signedTx = await provider.signTransaction(tx);
  const sig = await connection.sendRawTransaction(signedTx.serialize());
  console.log("Launch TX:", sig);

  await connection.confirmTransaction(sig);
  console.log("TOKEN LAUNCHED");

  return { signature: sig, mint: mint.publicKey.toString() };
}

const TokenLaunchDialog = ({ open, onOpenChange }: TokenLaunchDialogProps) => {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [launching, setLaunching] = useState(false);

  const handleLaunch = async () => {
    if (!name || !symbol) {
      toast({ title: "Missing fields", description: "Name and Symbol are required.", variant: "destructive" });
      return;
    }

    const provider = (window as any)?.phantom?.solana;
    if (!provider?.isPhantom || !provider.publicKey) {
      toast({ title: "Wallet not connected", description: "Please connect your Phantom wallet first.", variant: "destructive" });
      return;
    }

    setLaunching(true);
    try {
      const result = await createPumpToken(provider, { name, symbol, description, image });
      toast({
        title: "Token Launched! 🚀",
        description: `Mint: ${result.mint.slice(0, 8)}... | TX: ${result.signature.slice(0, 8)}...`,
      });
      onOpenChange(false);
      setName("");
      setSymbol("");
      setDescription("");
      setImage("");
    } catch (err: any) {
      console.error("Token launch error:", err);
      toast({
        title: "Launch failed",
        description: err?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLaunching(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader className="items-center text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-2">
            <Rocket className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="font-display text-xl text-foreground">Launch My Token</DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm mt-1">
            Create and deploy your token on Pump.fun via Phantom wallet.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-3">
          <div>
            <label className="text-xs font-display font-medium text-muted-foreground mb-1 block">Token Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. MindFi Token"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-secondary text-foreground text-sm font-body placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
              disabled={launching}
            />
          </div>
          <div>
            <label className="text-xs font-display font-medium text-muted-foreground mb-1 block">Symbol *</label>
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="e.g. MINDFI"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-secondary text-foreground text-sm font-body placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
              disabled={launching}
            />
          </div>
          <div>
            <label className="text-xs font-display font-medium text-muted-foreground mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your token..."
              rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-secondary text-foreground text-sm font-body placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors resize-none"
              disabled={launching}
            />
          </div>
          <div>
            <label className="text-xs font-display font-medium text-muted-foreground mb-1 block">Image URL</label>
            <input
              value={image}
              onChange={(e) => setImage(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full px-3 py-2.5 rounded-xl border border-border bg-secondary text-foreground text-sm font-body placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
              disabled={launching}
            />
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3">
          <button
            onClick={handleLaunch}
            disabled={launching}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {launching ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Launching...
              </>
            ) : (
              <>
                <Rocket className="w-4 h-4" />
                Launch Token
              </>
            )}
          </button>
          <button
            onClick={() => onOpenChange(false)}
            disabled={launching}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors font-display"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TokenLaunchDialog;
