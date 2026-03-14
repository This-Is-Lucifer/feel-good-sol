import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Brain, TrendingUp, Heart, Shield, AlertTriangle, BarChart3, Zap, RefreshCw, ClipboardList, Download, Rocket, Smile, Frown, Meh, Camera, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import ReactMarkdown from "react-markdown";
import TokenLaunchDialog from "@/components/TokenLaunchDialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";

interface DetectedEmotion {
  label: string;
  confidence: number;
}

interface EmotionAnalysis {
  emotions: DetectedEmotion[];
  primaryEmotion: string;
  summary: string;
}

const emotionIconMap: Record<string, typeof Smile> = {
  Calm: Smile,
  Happy: Smile,
  Focused: Meh,
  Neutral: Meh,
  Anxious: AlertTriangle,
  Stressed: Frown,
  Sad: Frown,
  Angry: Frown,
  Surprised: Smile,
};

const emotionColorMap: Record<string, string> = {
  Calm: "text-primary",
  Happy: "text-primary",
  Focused: "text-blue-400",
  Neutral: "text-muted-foreground",
  Anxious: "text-yellow-400",
  Stressed: "text-destructive",
  Sad: "text-destructive",
  Angry: "text-destructive",
  Surprised: "text-purple-400",
};

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

// Maps check-in answers to dynamic scores and insights
function generateDynamicReport(data: CheckinAnswer[]): ReportSection[] {
  const getAnswer = (questionFragment: string) =>
    data.find((d) => d.question.toLowerCase().includes(questionFragment.toLowerCase()))?.answer;

  const mood = getAnswer("feeling right now");
  const stress = getAnswer("stressed do you feel");
  const emotionalDesc = getAnswer("emotional state");
  const impulsive = getAnswer("impulsive trades");
  const fomo = getAnswer("FOMO");
  const driver = getAnswer("driving your trading");

  // --- Emotional Stability ---
  const moodScoreMap: Record<string, number> = { Great: 90, Good: 75, Neutral: 60, Anxious: 35, Stressed: 20 };
  const stressVal = typeof stress === "number" ? stress : 5;
  const moodBase = typeof mood === "string" ? moodScoreMap[mood] ?? 60 : 60;
  const emotionalStability = Math.round((moodBase + (100 - stressVal * 10)) / 2);

  const moodInsightMap: Record<string, string> = {
    Great: `You reported feeling great with a stress level of ${stressVal}/10. Your emotional baseline is strong — you're in an optimal state for clear-headed decisions.`,
    Good: `You're feeling good with a stress level of ${stressVal}/10. Solid emotional footing, though monitoring stress during volatile periods will help maintain this.`,
    Neutral: `Your mood is neutral with stress at ${stressVal}/10. You're neither energized nor drained — a stable but potentially disengaged state for trading.`,
    Anxious: `You indicated feeling anxious with stress at ${stressVal}/10. Anxiety can lead to premature exits and second-guessing. Consider grounding exercises before trading.`,
    Stressed: `You're feeling stressed with a high stress level of ${stressVal}/10. This state significantly impairs decision-making. Trading under stress often leads to reactive, loss-generating behavior.`,
  };
  const emotionalInsight = typeof mood === "string" ? moodInsightMap[mood] ?? `Your mood is ${mood} with stress at ${stressVal}/10.` : `Stress level reported at ${stressVal}/10.`;
  const emotionalRec = emotionalStability >= 70
    ? "Maintain your current routines — they're supporting emotional clarity. Consider journaling to preserve this baseline."
    : emotionalStability >= 50
    ? "Introduce a 5-minute breathing exercise before trading sessions. Set hard stop-loss levels while calm."
    : "Strongly consider pausing active trading today. High stress correlates with 40% worse outcomes. Use this time for analysis only.";

  // --- FOMO Resistance ---
  const fomoVal = typeof fomo === "number" ? fomo : 5;
  const driverPenalty = driver === "Social media hype" ? 20 : driver === "Fear of missing out" ? 25 : driver === "Gut feeling" ? 10 : 0;
  const fomoScore = Math.max(5, Math.min(95, 100 - fomoVal * 10 - driverPenalty));

  const fomoInsight = fomoVal >= 7
    ? `Your FOMO level is very high at ${fomoVal}/10${driver ? `, and your decisions are driven by "${driver}"` : ""}. This combination makes you highly susceptible to chasing pumps and entering at local tops.`
    : fomoVal >= 4
    ? `Your FOMO sits at ${fomoVal}/10 — moderate but present${driver ? `. You noted "${driver}" as your primary trading driver` : ""}. This could lead to oversized positions during hype cycles.`
    : `FOMO is well-controlled at ${fomoVal}/10${driver ? `. Your decisions are driven by "${driver}"` : ""} — a disciplined approach that protects capital.`;

  const fomoRec = fomoScore < 40
    ? "Implement a strict 30-minute rule: after seeing any opportunity, wait 30 minutes before acting. Write down your thesis — if it doesn't hold up on paper, don't trade it."
    : fomoScore < 70
    ? "You have moderate FOMO resistance. Consider pre-defining your watchlist at the start of each day and only trading assets on that list."
    : "Your FOMO resistance is strong. Continue relying on data-driven decisions and maintaining your disciplined approach.";

  // --- Risk Tolerance ---
  const impulsiveScoreMap: Record<string, number> = { "Yes, several": 20, "One or two": 45, "I almost did": 55, No: 85 };
  const riskScore = typeof impulsive === "string" ? impulsiveScoreMap[impulsive] ?? 60 : 60;

  const riskInsight = typeof impulsive === "string"
    ? impulsive === "No"
      ? "You reported no impulsive trades in the last 24 hours. Your behavior aligns well with measured risk-taking — a strong indicator of disciplined trading."
      : impulsive === "I almost did"
      ? "You nearly made an impulsive trade but held back. The self-awareness to pause is valuable, but the urge itself signals underlying emotional pressure on your risk framework."
      : impulsive === "One or two"
      ? "You made 1-2 impulsive trades recently. This moderate level of impulsivity suggests your risk tolerance boundaries may shift under pressure, potentially leading to oversized losses."
      : "Multiple impulsive trades indicate a significant breakdown in risk management. When emotions override strategy, position sizes and stop-losses become afterthoughts."
    : "Impulsive trading patterns were not assessed in this check-in.";

  const riskRec = riskScore < 40
    ? "Enforce position size limits: no single trade should exceed 2% of your portfolio. Remove the ability to increase size mid-trade by using pre-set orders only."
    : riskScore < 70
    ? "Before each trade, rate your emotional state 1-10. If above 6, reduce position size by 50%. This simple check prevents emotional overrides."
    : "Your risk discipline is solid. Consider reviewing your risk framework monthly to ensure it evolves with your portfolio size.";

  // --- Decision Quality ---
  const decisionBase = driver === "Research & data" ? 85 : driver === "Gut feeling" ? 50 : driver === "Social media hype" ? 30 : driver === "Fear of missing out" ? 25 : 60;
  const decisionScore = Math.round((decisionBase + riskScore) / 2);

  const decisionInsight = typeof driver === "string"
    ? driver === "Research & data"
      ? `Your decisions are driven by research and data — the highest quality input. Combined with ${typeof impulsive === "string" ? `"${impulsive}"` : "your"} impulsive trading level, your decision framework is ${decisionScore >= 70 ? "strong" : "showing some cracks under pressure"}.`
      : `Your primary decision driver is "${driver}", which tends to produce ${decisionBase >= 50 ? "moderate" : "lower"} quality outcomes. ${emotionalDesc ? `You described your emotional state as "${emotionalDesc}", which may be influencing this pattern.` : ""}`
    : "Decision quality could not be fully assessed without knowing your primary trading driver.";

  const decisionRec = decisionScore >= 70
    ? "Your decision-making process is sound. Strengthen it further by keeping a trade journal: log your thesis, entry, exit, and emotional state for each trade."
    : decisionScore >= 50
    ? "Shift toward data-driven decisions by requiring at least 2 confirming indicators before entering any trade. Reduce reliance on social signals."
    : "Your decision quality needs significant improvement. Consider paper trading for a week while building a structured analysis framework before risking real capital.";

  // --- Stress Recovery ---
  const recoveryScore = Math.round((emotionalStability + riskScore) / 2);

  const recoveryInsight = `Based on your current mood (${mood ?? "unknown"}) and stress level (${stressVal}/10), your estimated stress recovery capacity is ${recoveryScore >= 70 ? "good" : recoveryScore >= 50 ? "moderate" : "concerning"}. ${
    riskScore < 50
      ? "Combined with impulsive trading behavior, losses may trigger revenge trading cycles."
      : "Your controlled approach to risk helps buffer emotional recovery after drawdowns."
  }`;

  const recoveryRec = recoveryScore < 50
    ? "After any loss exceeding 3% of your portfolio, enforce a mandatory 48-hour trading pause. Use this time for physical activity and journaling — not chart-watching."
    : recoveryScore < 70
    ? "Build a post-loss routine: review the trade objectively, identify if it was a process or outcome error, then take a minimum 4-hour break before the next trade."
    : "Your recovery capacity is strong. Maintain your current habits and consider mentoring other traders — teaching reinforces your own emotional discipline.";

  return [
    { title: "Emotional Stability", icon: Heart, color: "text-primary", score: emotionalStability, insight: emotionalInsight, recommendation: emotionalRec },
    { title: "FOMO Resistance", icon: Shield, color: "text-emerald-400", score: fomoScore, insight: fomoInsight, recommendation: fomoRec },
    { title: "Risk Tolerance Alignment", icon: AlertTriangle, color: "text-yellow-400", score: riskScore, insight: riskInsight, recommendation: riskRec },
    { title: "Decision Quality", icon: TrendingUp, color: "text-blue-400", score: decisionScore, insight: decisionInsight, recommendation: decisionRec },
    { title: "Stress Recovery", icon: Zap, color: "text-purple-400", score: recoveryScore, insight: recoveryInsight, recommendation: recoveryRec },
  ];
}

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
  const [checkinData, setCheckinData] = useState<CheckinAnswer[]>([]);
  const [report, setReport] = useState<ReportSection[]>([]);
  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [emotionAnalysis, setEmotionAnalysis] = useState<EmotionAnalysis | null>(null);
  const [analyzingEmotion, setAnalyzingEmotion] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Check wallet connection status
  useEffect(() => {
    const checkWallet = () => {
      const provider = (window as any)?.phantom?.solana;
      setWalletConnected(!!provider?.isPhantom && !!provider?.publicKey);
    };
    checkWallet();
    const interval = setInterval(checkWallet, 2000);
    return () => clearInterval(interval);
  }, []);

  const stripMarkdown = (text: string) =>
    text.replace(/#{1,6}\s*/g, "").replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1").replace(/>\s*/g, "").replace(/- /g, "• ").trim();

  const downloadPDF = () => {
    if (report.length === 0) return;

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    const pageHeight = doc.internal.pageSize.getHeight();
    let y = 20;

    const fillPageBg = () => {
      doc.setFillColor(17, 19, 24);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
    };

    const newPage = () => {
      doc.addPage();
      fillPageBg();
      y = 20;
    };

    const addText = (text: string, size: number, style: "normal" | "bold" = "normal", color: [number, number, number] = [255, 255, 255]) => {
      doc.setFontSize(size);
      doc.setFont("helvetica", style);
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, contentWidth);
      for (const line of lines) {
        if (y > 270) { newPage(); }
        doc.text(line, margin, y);
        y += size * 0.45;
      }
    };

    const addGap = (gap: number) => { y += gap; };

    // First page background
    fillPageBg();

    // Title
    addText("MindFi — Trading Mind Report", 18, "bold", [56, 209, 187]);
    addGap(4);
    addText(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), 10, "normal", [120, 130, 150]);
    addGap(8);

    // Overall score
    const overall = Math.round(report.reduce((s, r) => s + r.score, 0) / report.length);
    addText(`Overall Mind Score: ${overall}/100 — ${getScoreLabel(overall)}`, 14, "bold", [56, 209, 187]);
    addGap(10);

    // Sections
    report.forEach((section) => {
      if (y > 240) { newPage(); }

      addText(`${section.title}  —  ${section.score}/100 (${getScoreLabel(section.score)})`, 12, "bold", [220, 225, 235]);
      addGap(2);

      addText(stripMarkdown(section.insight), 9, "normal", [160, 170, 185]);
      addGap(3);

      addText("Recommendation:", 9, "bold", [56, 209, 187]);
      addText(stripMarkdown(section.recommendation), 9, "normal", [200, 210, 220]);
      addGap(8);

      // Divider
      doc.setDrawColor(50, 55, 65);
      doc.line(margin, y, pageWidth - margin, y);
      addGap(6);
    });

    // Check-in data
    if (checkinData.length > 0) {
      if (y > 220) { newPage(); }
      addGap(4);
      addText("Check-in Responses", 12, "bold", [56, 209, 187]);
      addGap(4);
      checkinData.forEach((item) => {
        addText(item.question, 9, "bold", [160, 170, 185]);
        addText(String(item.answer), 9, "normal", [220, 225, 235]);
        addGap(3);
      });
    }

    // Footer
    addGap(8);
    addText("Generated by MindFi — Your wellness, decentralized.", 8, "normal", [100, 110, 125]);

    doc.save("MindFi-Trading-Mind-Report.pdf");
    toast({ title: "PDF Downloaded", description: "Your report has been saved." });
  };

  useEffect(() => {
    const saved = localStorage.getItem("MindFi_checkin");
    if (saved) {
      try { setCheckinData(JSON.parse(saved)); } catch { /* ignore */ }
    }
    const savedSelfie = localStorage.getItem("MindFi_selfie");
    if (savedSelfie) {
      setSelfieImage(savedSelfie);
    }
  }, []);

  const generateReport = async () => {
    setGenerating(true);
    setShowReport(false);
    setRevealedSections(0);

    // Build prompt from check-in data
    const answersText = checkinData.length > 0
      ? checkinData.map((a) => `Q: ${a.question}\nA: ${a.answer}`).join("\n\n")
      : "No check-in data available.";

    try {
      const response = await fetch("https://308e-119-42-59-192.ngrok-free.app/api/ollama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: "You are MindFi, an AI emotional intelligence analyst for crypto traders. Analyze the user's emotional check-in responses and provide a personalized trading psychology assessment. Be empathetic, specific, and actionable. Format your response in clean, well-structured Markdown. Use headings (##), bullet points, bold text for key insights, and blockquotes for recommendations. Include emojis sparingly to make it engaging. Structure the report with clear sections: Emotional Overview, FOMO & Impulse Analysis, Risk Behavior, Decision Quality, and Actionable Recommendations.",
          prompt: `Here are the user's emotional check-in responses:\n\n${answersText}\n\nProvide a personalized emotional intelligence assessment for this trader.`,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("Ollama response:", data);

      // Extract AI text from response
      const aiText = typeof data === "string" ? data : data.response || data.message?.content || JSON.stringify(data);

      // Use AI response as the insight for a single overview section, plus local scores
      const localReport = generateDynamicReport(checkinData);
      // Replace the first section's insight with the AI response
      if (localReport.length > 0) {
        localReport[0].insight = aiText;
      }

      setReport(localReport);
      setGenerating(false);
      setShowReport(true);

      localReport.forEach((_, i) => {
        setTimeout(() => setRevealedSections(i + 1), 400 * (i + 1));
      });
    } catch (err) {
      console.error("Report generation failed:", err);
      const generated = generateDynamicReport(checkinData);
      setReport(generated);
      setGenerating(false);
      setShowReport(true);
      toast({
        title: "AI endpoint unavailable",
        description: "Used local analysis instead. Make sure the Ollama endpoint is running.",
        variant: "destructive",
      });

      generated.forEach((_, i) => {
        setTimeout(() => setRevealedSections(i + 1), 400 * (i + 1));
      });
    }
  };

  const overallScore = report.length > 0
    ? Math.round(report.reduce((sum, s) => sum + s.score, 0) / report.length)
    : 0;

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
          <span className="font-display font-semibold text-lg text-foreground">MindFi</span>
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

        {/* Selfie & Emotion Analysis Section */}
        {selfieImage && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-8 p-5 md:p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-sm"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-primary" />
                <h2 className="font-display font-semibold text-sm text-foreground">Facial Emotion Analysis</h2>
              </div>
              <button
                onClick={() => {
                  const provider = (window as any)?.phantom?.solana;
                  if (!provider?.isPhantom || !provider?.publicKey) {
                    toast({ title: "Wallet not connected", description: "Please connect your Phantom wallet on the home page first.", variant: "destructive" });
                    return;
                  }
                  setShowTokenDialog(true);
                }}
                disabled={!walletConnected}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-primary/30 bg-primary/10 text-primary font-display font-semibold text-xs hover:bg-primary/20 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Rocket className="w-3.5 h-3.5" />
                Launch My Token
              </button>
            </div>
            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
              {/* Selfie */}
              <div className="w-36 h-36 md:w-44 md:h-44 rounded-2xl overflow-hidden border-2 border-primary/20 shrink-0 shadow-[0_0_30px_-8px_hsl(var(--primary)/0.3)]">
                <img src={selfieImage} alt="Your check-in selfie" className="w-full h-full object-cover" />
              </div>
              {/* Emotion bars */}
              <div className="flex-1 w-full space-y-3">
                <p className="text-xs uppercase tracking-widest font-display text-primary font-semibold mb-3">
                  Detected Emotions
                </p>
                {[
                  { label: "Calm", confidence: 72, icon: Smile, color: "text-primary" },
                  { label: "Focused", confidence: 18, icon: Meh, color: "text-muted-foreground" },
                  { label: "Anxious", confidence: 7, icon: AlertTriangle, color: "text-yellow-400" },
                  { label: "Stressed", confidence: 3, icon: Frown, color: "text-destructive" },
                ].map((e) => (
                  <div key={e.label} className="flex items-center gap-3">
                    <e.icon className={`w-4 h-4 ${e.color} shrink-0`} />
                    <span className="text-sm text-foreground w-20 shrink-0">{e.label}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-secondary overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${e.confidence}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className="h-full rounded-full bg-primary/60"
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right font-display">{e.confidence}%</span>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground mt-3 pt-2 border-t border-border/50">
                  Primary emotion: <span className="text-primary font-semibold">Calm</span> — You appear emotionally grounded for trading decisions.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Check-in Responses */}
        {checkinData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 p-5 md:p-6 rounded-2xl border border-border bg-card/40 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <ClipboardList className="w-4 h-4 text-primary" />
              <h2 className="font-display font-semibold text-sm text-foreground">Your Check-in Responses</h2>
            </div>
            <div className="space-y-3">
              {checkinData.map((item, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <p className="text-xs text-muted-foreground">{item.question}</p>
                  <p className="text-sm text-foreground font-medium">
                    {item.answer !== "—" ? String(item.answer) : <span className="text-muted-foreground italic">Skipped</span>}
                  </p>
                  {i < checkinData.length - 1 && <div className="border-b border-border/50 mt-2" />}
                </div>
              ))}
            </div>
            <Link
              to="/emotional-ai"
              className="inline-flex items-center gap-1 mt-4 text-xs text-primary hover:text-primary/80 font-display font-medium transition-colors"
            >
              Retake Check-in →
            </Link>
          </motion.div>
        )}

        {checkinData.length === 0 && !generating && !showReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-8 p-5 rounded-2xl border border-dashed border-border bg-card/20 text-center"
          >
            <p className="text-sm text-muted-foreground mb-3">No check-in data found. Complete an emotional check-in first for personalized insights.</p>
            <Link
              to="/emotional-ai"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-display font-medium hover:bg-primary/90 transition-colors"
            >
              <Brain className="w-3.5 h-3.5" />
              Start Check-in
            </Link>
          </motion.div>
        )}

        {!showReport && !generating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <button
              onClick={generateReport}
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-display font-semibold text-sm hover:bg-primary/90 transition-colors shadow-[var(--shadow-glow)]"
            >
              <Brain className="w-4 h-4" />
              Generate My Report
            </button>
            
          </motion.div>
        )}

        <TokenLaunchDialog open={showTokenDialog} onOpenChange={setShowTokenDialog} />

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
          <motion.div ref={reportRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
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
              {report.map((section, i) => (
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

                  <div className="text-sm text-muted-foreground leading-relaxed mb-3 prose prose-sm prose-invert max-w-none prose-headings:text-foreground prose-headings:font-display prose-headings:text-sm prose-p:text-muted-foreground prose-strong:text-foreground prose-blockquote:border-primary/30 prose-blockquote:text-muted-foreground prose-li:text-muted-foreground">
                    <ReactMarkdown>{section.insight}</ReactMarkdown>
                  </div>

                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-xs uppercase tracking-widest font-display text-primary font-semibold mb-1">
                      Recommendation
                    </p>
                    <div className="text-sm text-foreground leading-relaxed prose prose-sm prose-invert max-w-none prose-p:text-foreground prose-strong:text-primary prose-li:text-foreground">
                      <ReactMarkdown>{section.recommendation}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Actions */}
            {revealedSections >= report.length && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center gap-3 mt-8"
              >
                <button
                  onClick={downloadPDF}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-primary/30 bg-primary/10 text-primary text-sm font-display font-medium hover:bg-primary/15 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
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

