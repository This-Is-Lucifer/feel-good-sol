import { useState } from "react";
import { Rocket, Loader2, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Connection, VersionedTransaction, Keypair } from "@solana/web3.js";
import { supabase } from "@/integrations/supabase/client";

const RPC_ENDPOINT = "https://api.mainnet-beta.solana.com";
const connection = new Connection(RPC_ENDPOINT, "confirmed");

const PUMP_PROXY_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/pump-proxy`;

interface TokenLaunchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Convert a base64 data URL to a File object */
function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
  return new File([u8arr], filename, { type: mime });
}

async function launchToken(
  provider: any,
  formValues: {
    name: string;
    symbol: string;
    description: string;
    twitter: string;
    telegram: string;
    website: string;
    initialBuy: number;
    slippage: number;
  },
  imageFile: File
) {
  // 1. Connect / get public key
  const publicKey = provider.publicKey.toString();

  // 2. Generate mint keypair
  const mintKeypair = Keypair.generate();

  // 3. Upload metadata to pump.fun IPFS
  const formData = new FormData();
  formData.append("file", imageFile);
  formData.append("name", formValues.name);
  formData.append("symbol", formValues.symbol);
  formData.append("description", formValues.description);
  formData.append("twitter", formValues.twitter);
  formData.append("telegram", formValues.telegram);
  formData.append("website", formValues.website);
  formData.append("showName", "true");

  const metadataResponse = await fetch(`${PUMP_PROXY_URL}?action=ipfs`, {
    method: "POST",
    body: formData,
  });

  if (!metadataResponse.ok) {
    throw new Error("Failed to upload metadata to IPFS");
  }

  const metadata = await metadataResponse.json();
  console.log("Metadata uploaded:", metadata);

  // 4. Request create transaction from PumpPortal
  const response = await fetch(`${PUMP_PROXY_URL}?action=trade`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      publicKey,
      action: "create",
      tokenMetadata: {
        name: metadata.metadata.name,
        symbol: metadata.metadata.symbol,
        uri: metadata.metadataUri,
      },
      mint: mintKeypair.publicKey.toBase58(),
      denominatedInSol: "true",
      amount: formValues.initialBuy,
      slippage: formValues.slippage,
      priorityFee: 0.0005,
      pool: "pump",
    }),
  });

  if (response.status !== 200) {
    const errText = await response.text();
    console.error("Trade API error:", errText);
    throw new Error(errText || "Failed to create transaction");
  }

  // 5. Deserialize VersionedTransaction
  const txBuffer = await response.arrayBuffer();
  const tx = VersionedTransaction.deserialize(new Uint8Array(txBuffer));

  // 6. Sign with mint keypair locally
  tx.sign([mintKeypair]);

  // 7. Phantom signs wallet part
  const signedTx = await provider.signTransaction(tx);

  // 8. Send and confirm
  const signature = await connection.sendRawTransaction(signedTx.serialize());
  await connection.confirmTransaction(signature);

  console.log("Token created!", `https://solscan.io/tx/${signature}`);
  return { signature, mint: mintKeypair.publicKey.toBase58() };
}

const inputClass =
  "w-full px-3 py-2.5 rounded-xl border border-border bg-secondary text-foreground text-sm font-body placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors disabled:opacity-50";

const TokenLaunchDialog = ({ open, onOpenChange }: TokenLaunchDialogProps) => {
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [description, setDescription] = useState("");
  const [twitter, setTwitter] = useState("");
  const [telegram, setTelegram] = useState("");
  const [website, setWebsite] = useState("");
  const [launching, setLaunching] = useState(false);
  const [initialBuy, setInitialBuy] = useState("0");
  const [slippage, setSlippage] = useState("10");

  const selfieImage = localStorage.getItem("MindFi_selfie");

  const handleLaunch = async () => {
    if (!name || !symbol) {
      toast({
        title: "Missing fields",
        description: "Token Name and Symbol are required.",
        variant: "destructive",
      });
      return;
    }

    if (!selfieImage) {
      toast({
        title: "No image found",
        description: "Please complete your check-in with a selfie first.",
        variant: "destructive",
      });
      return;
    }

    const provider = (window as any)?.phantom?.solana;
    if (!provider?.isPhantom || !provider.publicKey) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your Phantom wallet first.",
        variant: "destructive",
      });
      return;
    }

    setLaunching(true);
    try {
      const imageFile = dataURLtoFile(selfieImage, `${symbol.toLowerCase()}-logo.png`);

      const result = await launchToken(
        provider,
        { name, symbol, description, twitter, telegram, website, initialBuy: parseFloat(initialBuy) || 0, slippage: parseFloat(slippage) || 10 },
        imageFile
      );

      toast({
        title: "Token Launched! 🚀",
        description: `Mint: ${result.mint.slice(0, 8)}...`,
      });
      onOpenChange(false);
      // Reset form
      setName("");
      setSymbol("");
      setDescription("");
      setTwitter("");
      setTelegram("");
      setWebsite("");
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
      <DialogContent className="bg-card border-border max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader className="items-center text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-2">
            <Rocket className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="font-display text-xl text-foreground">
            Launch My Token
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm mt-1">
            Deploy your token on Pump.fun via Phantom wallet.
          </DialogDescription>
        </DialogHeader>

        {/* Token Image Preview */}
        {selfieImage && (
          <div className="flex flex-col items-center gap-1.5 mt-2">
            <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-primary/20 shadow-md">
              <img
                src={selfieImage}
                alt="Token image"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-[11px] text-muted-foreground">
              Using your check-in selfie as token image
            </span>
          </div>
        )}

        {!selfieImage && (
          <div className="text-center py-3 px-4 rounded-xl bg-destructive/10 border border-destructive/20">
            <p className="text-xs text-destructive font-medium">
              No selfie found. Please complete a check-in with a photo first.
            </p>
          </div>
        )}

        <div className="mt-2 space-y-3">
          {/* Name */}
          <div>
            <label className="text-xs font-display font-medium text-muted-foreground mb-1 block">
              Token Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. MindFi Token"
              className={inputClass}
              disabled={launching}
            />
          </div>

          {/* Symbol */}
          <div>
            <label className="text-xs font-display font-medium text-muted-foreground mb-1 block">
              Symbol *
            </label>
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="e.g. MINDFI"
              className={inputClass}
              disabled={launching}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-display font-medium text-muted-foreground mb-1 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your token..."
              rows={2}
              className={`${inputClass} resize-none`}
              disabled={launching}
            />
          </div>

          {/* Trading Settings */}
          <div className="pt-1">
            <span className="text-[11px] font-display font-semibold text-muted-foreground/70 uppercase tracking-wider">
              Trading Settings
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-display font-medium text-muted-foreground mb-1 block">
                Initial Dev Buy (SOL)
              </label>
              <input
                value={initialBuy}
                onChange={(e) => setInitialBuy(e.target.value)}
                placeholder="0"
                type="number"
                min="0"
                step="0.1"
                className={inputClass}
                disabled={launching}
              />
            </div>
            <div>
              <label className="text-xs font-display font-medium text-muted-foreground mb-1 block">
                Slippage (%)
              </label>
              <input
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                placeholder="10"
                type="number"
                min="1"
                max="100"
                className={inputClass}
                disabled={launching}
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="pt-1">
            <span className="text-[11px] font-display font-semibold text-muted-foreground/70 uppercase tracking-wider">
              Social Links (optional)
            </span>
          </div>

          <div>
            <label className="text-xs font-display font-medium text-muted-foreground mb-1 block">
              Twitter / X
            </label>
            <input
              value={twitter}
              onChange={(e) => setTwitter(e.target.value)}
              placeholder="https://x.com/yourtoken"
              className={inputClass}
              disabled={launching}
            />
          </div>

          <div>
            <label className="text-xs font-display font-medium text-muted-foreground mb-1 block">
              Telegram
            </label>
            <input
              value={telegram}
              onChange={(e) => setTelegram(e.target.value)}
              placeholder="https://t.me/yourtoken"
              className={inputClass}
              disabled={launching}
            />
          </div>

          <div>
            <label className="text-xs font-display font-medium text-muted-foreground mb-1 block">
              Website
            </label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="https://yourtoken.com"
              className={inputClass}
              disabled={launching}
            />
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          <button
            onClick={handleLaunch}
            disabled={launching || !selfieImage}
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
