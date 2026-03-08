import { motion } from "framer-motion";
import { Brain, MessageCircle, Camera, BarChart3, Shield, Mic, Volume2, Wallet, Heart, FileText, Zap, Globe, Lock, TrendingUp, Bot, Sparkles, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface Feature {
  icon: typeof Brain;
  title: string;
  description: string;
  link?: string;
}

const currentFeatures: Feature[] = [
  {
    icon: MessageCircle,
    title: "AI Wellness Chatbot",
    description: "Conversational AI companion that helps traders manage stress, anxiety, and emotional decision-making with calm, human-like responses.",
    link: "/",
  },
  {
    icon: Mic,
    title: "Voice Input & Read Aloud",
    description: "Speak to MindFlow using your microphone and hear AI responses read aloud — hands-free emotional support while you trade.",
  },
  {
    icon: Camera,
    title: "Facial Emotion Detection",
    description: "Use your camera to capture real-time facial expressions. AI analyzes your emotional state and provides tailored wellness insights.",
    link: "/emotional-ai",
  },
  {
    icon: BarChart3,
    title: "Personalized Intelligence Reports",
    description: "Complete a check-in questionnaire and receive an AI-generated wellness report with mood scores, stress analysis, and actionable recommendations.",
    link: "/personalized-intelligence",
  },
  {
    icon: FileText,
    title: "PDF Report Export",
    description: "Download your personalized intelligence reports as PDF documents for record-keeping and progress tracking.",
    link: "/personalized-intelligence",
  },
  {
    icon: Wallet,
    title: "Multi-Wallet Connection",
    description: "Connect Phantom (Solana) or MetaMask (EVM) wallets with seamless authentication and balance display.",
  },
  {
    icon: Heart,
    title: "SOL Donation Support",
    description: "Support MindFlow directly through Phantom wallet with preset or custom SOL amounts, QR code, and copy-to-clipboard.",
    link: "/support",
  },
  {
    icon: Shield,
    title: "On-Chain Privacy",
    description: "Your mental health data stays yours — all interactions are private and encrypted on the Solana blockchain.",
  },
];

interface UpcomingFeature {
  icon: typeof Brain;
  title: string;
  description: string;
  eta: string;
}

const upcomingFeatures: UpcomingFeature[] = [
  {
    icon: TrendingUp,
    title: "Live Portfolio Sentiment Tracker",
    description: "Real-time emotional correlation analysis between your mood patterns and portfolio performance across chains.",
    eta: "Q3 2026",
  },
  {
    icon: Bot,
    title: "Autonomous Trading Guardian",
    description: "AI agent that detects emotional trading patterns and can pause or flag risky trades when stress levels are elevated.",
    eta: "Q3 2026",
  },
  {
    icon: Globe,
    title: "Community Mood Heatmap",
    description: "Anonymous, aggregated emotional pulse of the MindFlow community — see how the collective feels about the market.",
    eta: "Q4 2026",
  },
  {
    icon: Lock,
    title: "On-Chain Wellness NFTs",
    description: "Mint soulbound NFTs representing your wellness milestones — meditation streaks, stress management achievements, and more.",
    eta: "Q4 2026",
  },
  {
    icon: Sparkles,
    title: "AI Journaling & Mood Diary",
    description: "Guided daily journaling with AI insights that track emotional patterns over weeks and months to improve trading discipline.",
    eta: "Q1 2027",
  },
  {
    icon: Zap,
    title: "Telegram & Discord Bot",
    description: "Access MindFlow's wellness companion directly from your favorite trading communities with inline check-ins and alerts.",
    eta: "Q1 2027",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const Features = () => {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-primary/3 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display font-semibold text-lg text-foreground">MindFlow</span>
        </Link>
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </header>

      <div className="relative z-10 px-6 md:px-12 py-12 max-w-6xl mx-auto">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-display mb-6">
            <Zap className="w-3 h-3" />
            Platform Capabilities
          </div>
          <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Built for <span className="text-primary">Trader Wellness</span>
          </h1>
          <p className="mt-4 text-muted-foreground text-base md:text-lg max-w-2xl mx-auto font-body">
            Everything you need to trade with emotional clarity — powered by AI, secured on Solana.
          </p>
        </motion.div>

        {/* Current Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-20"
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
            Live Features
          </h2>
          <p className="text-muted-foreground font-body text-sm mb-8">Available now on MindFlow</p>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {currentFeatures.map((feature) => (
              <motion.div
                key={feature.title}
                variants={item}
                whileHover={{ y: -4 }}
                className="group relative p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-sm hover:border-primary/30 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <feature.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed mb-3">{feature.description}</p>
                {feature.link && (
                  <Link
                    to={feature.link}
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-display"
                  >
                    Try it →
                  </Link>
                )}
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-display font-medium">
                    Live
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Upcoming Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-2">
            Coming Soon 🚀
          </h2>
          <p className="text-muted-foreground font-body text-sm mb-8">Features on our roadmap</p>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {upcomingFeatures.map((feature) => (
              <motion.div
                key={feature.title}
                variants={item}
                whileHover={{ y: -4 }}
                className="group relative p-6 rounded-2xl border border-border/50 bg-card/20 backdrop-blur-sm hover:border-muted-foreground/20 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-muted/50 flex items-center justify-center mb-4 group-hover:bg-muted transition-colors">
                  <feature.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="font-display font-semibold text-foreground/80 mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground/80 leading-relaxed">{feature.description}</p>
                <div className="absolute top-4 right-4">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-[10px] font-display font-medium">
                    {feature.eta}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-center mt-20 mb-10"
        >
          <p className="text-muted-foreground font-body text-sm mb-4">Want to shape what we build next?</p>
          <a
            href="https://t.me/mindflow"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-display font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Join the Community
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default Features;
