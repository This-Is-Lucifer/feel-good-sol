import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "ipfs") {
      // Proxy the IPFS metadata upload to pump.fun
      const formData = await req.formData();

      const response = await fetch("https://pump.fun/api/ipfs", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error("pump.fun IPFS error:", errText);
        return new Response(JSON.stringify({ error: errText }), {
          status: response.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const data = await response.json();
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "trade") {
      // Proxy the trade-local call to pumpportal
      const body = await req.text();

      const response = await fetch("https://pumpportal.fun/api/trade-local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      });

      if (response.status !== 200) {
        const errText = await response.text();
        console.error("pumpportal trade error:", errText);
        return new Response(errText, {
          status: response.status,
          headers: corsHeaders,
        });
      }

      // Return the raw transaction bytes
      const buffer = await response.arrayBuffer();
      return new Response(buffer, {
        status: 200,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/octet-stream",
        },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use ?action=ipfs or ?action=trade" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
