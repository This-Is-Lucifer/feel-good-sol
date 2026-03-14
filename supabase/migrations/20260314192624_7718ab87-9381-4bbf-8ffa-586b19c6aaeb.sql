CREATE TABLE public.token_deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address text NOT NULL,
  token_mint text NOT NULL,
  token_name text,
  token_symbol text,
  tx_signature text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.token_deployments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read token deployments"
  ON public.token_deployments FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert token deployments"
  ON public.token_deployments FOR INSERT
  WITH CHECK (true);