import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, TrendingUp, Heart, Shield, AlertTriangle, BarChart3, Zap, RefreshCw, ClipboardList } from "lucide-react";
import { Link } from "react-router-dom";

interface CheckinAnswer {
  question: string;
  answer: string | number;
  category: "mood" | "trading";
}

interface ReportSection {
  title: string;
  icon: typeof Brain;
  color: string;
  score: number;
  insight: string;
  recommendation: string;
}

const mockReport: ReportSection[] = [
  {
    title: "Emotional Stability",
    icon: Heart,
    color: "text-primary",
    score: 72,
    insight:
      "Your emotional baseline shows moderate stability with occasional spikes in anxiety during high-volatility periods. You tend to feel most stressed between 2–4 PM UTC when US markets overlap with crypto activity.",
    recommendation:
      "Consider stepping away from charts during peak volatility windows. Set price alerts instead of watching live feeds.",
  },
  {
    title: "FOMO Resistance",
    icon: Shield,
    color: "text-emerald-400",
    score: 45,
    insight:
      "Your FOMO index is moderately high. Historical patterns suggest you're 3x more likely to enter a position after seeing social media hype rather than independent analysis.",
    recommendation:
      "Implement a 30-minute cooling period before executing any trade triggered by social media. Journal the impulse first.",
  },
  {
    title: "Risk Tolerance Alignment",
    icon: AlertTriangle,
    color: "text-yellow-400",
    score: 61,
    insight:
      "There's a mismatch between your stated risk tolerance (moderate) and actual behavior (aggressive). Your average position size is 2.3x higher during emotional trading sessions.",
    recommendation:
      "Pre-define max position sizes when calm. Use automated stop-losses to prevent emotional override during drawdowns.",
  },
  {
    title: "Decision Quality",
    icon: TrendingUp,
    color: "text-blue-400",
    score: 78,
    insight:
      "When you trade with a plan, your win rate is 68%. Without a plan, it drops to 34%. Your best decisions come in the morning before market noise accumulates.",
    recommendation:
      "Front-load your trading decisions to morning hours. Write trade theses before market open and stick to them.",
  },
  {
    title: "Stress Recovery",
    icon: Zap,
    color: "text-purple-400",
    score: 55,
    insight:
      "After a significant loss, it takes you an average of 2.4 days to return to baseline emotional state. During recovery, you're prone to revenge trading.",
    recommendation:
      "After any loss exceeding 5% of your portfolio, enforce a mandatory 48-hour trading pause. Use the time for journaling and reflection.",
  },
];

const overallScore = Math.round(mockReport.reduce((sum, s) => sum + s.score, 0) / mockReport.length);

const getScoreColor = (score: number) => {
  if (score >= 70) return "text-primary";
  if (score >= 50) return "text-yellow-400";
  return "text-destructive";
};

const getScoreLabel = (score: number) => {
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Needs Work";
  return "Critical";
};

const PersonalizedIntelligence = () => {
  const [generating, setGenerating] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [revealedSections, setRevealedSections] = useState(0);

  const generateReport = () => {
    setGenerating(true);
    setShowReport(false);
    setRevealedSections(0);

    setTimeout(() => {
      setGenerating(false);
      setShowReport(true);

      // Reveal sections one by one
      mockReport.forEach((_, i) => {
        setTimeout(() => setRevealedSections(i + 1), 400 * (i + 1));
      });
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-glow-secondary/5 rounded-full blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 md:px-12 py-5">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary" />
          </div>
          <span className="font-display font-semibold text-lg text-foreground">MindFlow</span>
        </Link>
      </header>

      <main className="relative z-10 max-w-3xl mx-auto px-6 pt-8 pb-20">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-display mb-4">
            <BarChart3 className="w-3 h-3" />
            Personalized Intelligence
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">
            Your Trading Mind Report
          </h1>
          <p className="mt-3 text-muted-foreground text-sm max-w-md mx-auto">
            AI-generated insights about your emotional patterns, trading psychology, and personalized recommendations.
          </p>
        </motion.div>

        {/* Generate button */}
        {!showReport && !generating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mb-12">
            <button
              onClick={generateReport}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm hover:bg-primary/90 transition-colors shadow-[var(--shadow-glow)]"
            >
              <Brain className="w-4 h-4" />
              Generate My Report
            </button>
          </motion.div>
        )}

        {/* Loading state */}
        {generating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-4 py-16"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center"
            >
              <Brain className="w-6 h-6 text-primary" />
            </motion.div>
            <div className="text-center">
              <p className="text-foreground font-display font-semibold mb-1">Analyzing your data...</p>
              <p className="text-muted-foreground text-sm">
                Processing emotional patterns and trading behavior
              </p>
            </div>
            <div className="w-48 h-1.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 2.5, ease: "easeInOut" }}
              />
            </div>
          </motion.div>
        )}

        {/* Report */}
        {showReport && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Overall score */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 md:p-8 rounded-2xl border border-border bg-card/60 backdrop-blur-sm mb-6 text-center"
            >
              <p className="text-xs uppercase tracking-widest font-display text-muted-foreground mb-3">
                Overall Mind Score
              </p>
              <div className={`font-display text-6xl font-bold ${getScoreColor(overallScore)} mb-2`}>
                {overallScore}
              </div>
              <p className={`text-sm font-display font-semibold ${getScoreColor(overallScore)}`}>
                {getScoreLabel(overallScore)}
              </p>
              <p className="mt-3 text-muted-foreground text-sm max-w-md mx-auto">
                Based on your emotional check-in data and trading behavior analysis across 5 key dimensions.
              </p>
            </motion.div>

            {/* Sections */}
            <div className="space-y-4">
              {mockReport.map((section, i) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0, x: 20 }}
                  animate={i < revealedSections ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4 }}
                  className={`p-5 md:p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-sm transition-opacity ${
                    i >= revealedSections ? "opacity-0" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
                        <section.icon className={`w-4.5 h-4.5 ${section.color}`} />
                      </div>
                      <div>
                        <h3 className="font-display font-semibold text-foreground text-sm">{section.title}</h3>
                        <span className={`text-xs font-display font-semibold ${getScoreColor(section.score)}`}>
                          {section.score}/100 — {getScoreLabel(section.score)}
                        </span>
                      </div>
                    </div>
                    {/* Score bar */}
                    <div className="w-20 h-2 rounded-full bg-secondary overflow-hidden mt-1.5">
                      <motion.div
                        className="h-full rounded-full bg-primary/70"
                        initial={{ width: 0 }}
                        animate={i < revealedSections ? { width: `${section.score}%` } : {}}
                        transition={{ duration: 0.8, delay: 0.2 }}
                      />
                    </div>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{section.insight}</p>

                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-xs uppercase tracking-widest font-display text-primary font-semibold mb-1">
                      Recommendation
                    </p>
                    <p className="text-sm text-foreground leading-relaxed">{section.recommendation}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Regenerate */}
            {revealedSections >= mockReport.length && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex justify-center gap-4 mt-8"
              >
                <button
                  onClick={generateReport}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-secondary text-foreground text-sm font-display font-medium hover:bg-secondary/80 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerate
                </button>
                <Link
                  to="/emotional-ai"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-display font-medium hover:bg-primary/90 transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  New Check-in
                </Link>
              </motion.div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default PersonalizedIntelligence;
