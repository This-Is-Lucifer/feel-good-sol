import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ExternalLink } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Deployment {
  id: string;
  token_name: string | null;
  token_symbol: string | null;
  token_mint: string;
  tx_signature: string | null;
  created_at: string | null;
}

const MyDeployments = () => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkWallet = () => {
      const provider = (window as any)?.phantom?.solana;
      if (provider?.isConnected && provider?.publicKey) {
        setWalletAddress(provider.publicKey.toString());
      } else {
        setWalletAddress(null);
        setDeployments([]);
      }
    };

    checkWallet();
    const interval = setInterval(checkWallet, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!walletAddress) return;

    const fetchDeployments = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("token_deployments")
        .select("*")
        .eq("wallet_address", walletAddress)
        .order("created_at", { ascending: false });

      if (!error && data) setDeployments(data);
      setLoading(false);
    };

    fetchDeployments();
  }, [walletAddress]);

  if (!walletAddress || deployments.length === 0) return null;

  const truncate = (str: string, len = 8) =>
    str.length > len * 2 ? `${str.slice(0, len)}...${str.slice(-len)}` : str;

  return (
    <div className="w-full max-w-2xl mt-6">
      <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-display font-semibold text-sm text-foreground">
            My Token Deployments
          </h3>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-xs font-display text-muted-foreground">Name</TableHead>
                <TableHead className="text-xs font-display text-muted-foreground">Ticker</TableHead>
                <TableHead className="text-xs font-display text-muted-foreground">CA</TableHead>
                <TableHead className="text-xs font-display text-muted-foreground text-right">Solscan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deployments.map((d) => (
                <TableRow key={d.id} className="border-border">
                  <TableCell className="font-body text-sm text-foreground">
                    {d.token_name || "—"}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-primary">
                    {d.token_symbol ? `$${d.token_symbol}` : "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {truncate(d.token_mint)}
                  </TableCell>
                  <TableCell className="text-right">
                    {d.tx_signature ? (
                      <a
                        href={`https://solscan.io/tx/${d.tx_signature}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors font-display"
                      >
                        View
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default MyDeployments;
