import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Shield, BarChart3, Users, MessageCircle, TrendingUp, Heart, Star, Globe, Zap } from "lucide-react";
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
          <a href="/personalized-intelligence" className="hover:text-foreground transition-colors">Intelligence</a>
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

      {/* Community Section */}
      <section id="community" className="relative z-10 px-6 md:px-12 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <a
            href="https://t.me/mindflow"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-display mb-6 hover:bg-primary/10 transition-colors cursor-pointer"
          >
            <Users className="w-3 h-3" />
            Join the Movement
          </a>
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            A Community That <span className="text-primary">Feels Together</span>
          </h2>
          <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto font-body">
            Thousands of traders are choosing mental clarity over market chaos. Here's what they're saying.
          </p>
        </motion.div>

        {/* Community Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-16"
        >
          {[
            { icon: Users, value: "12,400+", label: "Active Traders" },
            { icon: MessageCircle, value: "89,000+", label: "AI Sessions" },
            { icon: TrendingUp, value: "34%", label: "Avg. Stress Reduction" },
            { icon: Globe, value: "62", label: "Countries" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -4 }}
              className="p-5 rounded-2xl border border-border bg-card/40 backdrop-blur-sm text-center"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              <p className="font-display text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-body mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mx-auto mb-16">
          {[
            {
              name: "Alex K.",
              role: "DeFi Trader",
              quote: "MindFlow caught my panic-selling pattern before I even noticed it. Saved me from a $14k loss during the last dip.",
              rating: 5,
            },
            {
              name: "Priya M.",
              role: "NFT Collector",
              quote: "The emotional AI feels like having a therapist who actually understands crypto. It's the tool I didn't know I needed.",
              rating: 5,
            },
            {
              name: "Jordan T.",
              role: "Swing Trader",
              quote: "My stress scores dropped 40% in two weeks. I make clearer decisions now and actually sleep before big unlocks.",
              rating: 5,
            },
          ].map((testimonial, i) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-sm hover:border-primary/20 transition-colors"
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground font-body leading-relaxed mb-5 italic">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
                  <span className="text-xs font-display font-bold text-primary">
                    {testimonial.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-display font-semibold text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Community Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <div className="p-8 md:p-10 rounded-2xl border border-primary/20 bg-primary/5 backdrop-blur-sm text-center">
            <Heart className="w-8 h-8 text-primary mx-auto mb-4" />
            <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-3">
              Wellness-First Trading Community
            </h3>
            <p className="text-muted-foreground font-body max-w-xl mx-auto mb-6 text-sm leading-relaxed">
              Weekly group check-ins, anonymous mood boards, and shared insights — all encrypted on-chain. 
              Your emotional data is never sold. Period.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { icon: Zap, label: "Weekly Live Sessions" },
                { icon: Shield, label: "Anonymous & Encrypted" },
                { icon: MessageCircle, label: "24/7 AI Support" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-background/50 text-xs font-display text-foreground"
                >
                  <item.icon className="w-3.5 h-3.5 text-primary" />
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

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
