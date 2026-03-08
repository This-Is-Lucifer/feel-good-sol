import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Shield, BarChart3 } from "lucide-react";
import AvatarOrb from "@/components/AvatarOrb";
import ChatInterface from "@/components/ChatInterface";
import WalletConnect from "@/components/WalletConnect";

const Index = () => {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background ambient effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-glow-secondary/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display font-semibold text-lg text-foreground">MindFlow</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground font-body">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="/emotional-ai" className="hover:text-foreground transition-colors">Emotional AI</a>
          <a href="#about" className="hover:text-foreground transition-colors">About</a>
          <a href="#community" className="hover:text-foreground transition-colors">Community</a>
        </nav>

        <WalletConnect />
      </header>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-12 md:pt-20 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-display mb-6">
            <Shield className="w-3 h-3" />
            Trusted by 12,000+ Solana traders
          </div>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight tracking-tight">
            Your Mind Matters
            <br />
            <span className="text-primary">More Than Markets</span>
          </h1>
          <p className="mt-5 text-muted-foreground text-base md:text-lg max-w-xl mx-auto font-body leading-relaxed">
            AI-powered emotional intelligence for crypto traders. Navigate volatility with clarity, not anxiety.
          </p>
        </motion.div>

        {/* Avatar + Chat Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col items-center gap-8"
        >
          {!chatOpen ? (
            <div className="flex flex-col items-center gap-6">
              <AvatarOrb onClick={() => setChatOpen(true)} />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-muted-foreground text-sm font-body animate-float"
              >
                Tap to start a conversation
              </motion.p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <AvatarOrb isSpeaking onClick={() => setChatOpen(false)} />
              <ChatInterface />
            </div>
          )}
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-20 max-w-4xl w-full"
        >
          {[
            {
              icon: Brain,
              title: "Emotional AI",
              desc: "Real-time mood analysis calibrated for crypto market dynamics",
            },
            {
              icon: BarChart3,
              title: "Stress Metrics",
              desc: "Track your emotional correlation with portfolio performance",
            },
            {
              icon: Shield,
              title: "On-chain Privacy",
              desc: "Your mental health data stays yours — encrypted on Solana",
            },
          ].map((item, i) => (
            <motion.div
              key={item.title}
              whileHover={{ y: -4 }}
              className="group p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-sm hover:border-primary/20 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-8 px-6 text-center">
        <p className="text-xs text-muted-foreground font-body">
          © 2026 MindFlow. Built on Solana. Your wellness, decentralized.
        </p>
      </footer>
    </div>
  );
};

export default Index;
