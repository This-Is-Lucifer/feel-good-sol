import { useState, useRef, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Camera, ChevronRight, ChevronLeft, Smile, Frown, Meh, AlertTriangle, TrendingUp, X, Upload, RotateCcw } from "lucide-react";
import { Link } from "react-router-dom";

interface Question {
  id: number;
  text: string;
  type: "text" | "scale" | "choice" | "camera";
  category: "mood" | "trading";
  options?: string[];
}

const questionPool: Question[] = [
  // Mood - Choice
  { id: 1, text: "How are you feeling right now?", type: "choice", category: "mood", options: ["Great", "Good", "Neutral", "Anxious", "Stressed"] },
  { id: 2, text: "How well did you sleep last night?", type: "choice", category: "mood", options: ["Very well", "Okay", "Poorly", "Barely slept"] },
  { id: 3, text: "How would you describe your energy level?", type: "choice", category: "mood", options: ["High energy", "Moderate", "Low", "Exhausted"] },
  { id: 4, text: "Are you feeling optimistic about today?", type: "choice", category: "mood", options: ["Very optimistic", "Somewhat", "Neutral", "Pessimistic"] },
  { id: 5, text: "How confident are you in your decisions today?", type: "choice", category: "mood", options: ["Very confident", "Somewhat", "Unsure", "Not at all"] },
  { id: 6, text: "Have you taken a break today?", type: "choice", category: "mood", options: ["Yes, multiple", "One short break", "Not yet", "I don't plan to"] },
  { id: 7, text: "How is your focus right now?", type: "choice", category: "mood", options: ["Laser focused", "Good", "Distracted", "Can't concentrate"] },
  { id: 8, text: "Are you feeling any physical tension?", type: "choice", category: "mood", options: ["None", "Slight", "Moderate", "Severe"] },
  { id: 9, text: "How hydrated are you today?", type: "choice", category: "mood", options: ["Well hydrated", "Could drink more", "Barely any water", "Haven't thought about it"] },
  { id: 10, text: "Did you exercise recently?", type: "choice", category: "mood", options: ["Today", "Yesterday", "This week", "Not recently"] },

  // Mood - Text
  { id: 11, text: "Describe your current emotional state in a few words.", type: "text", category: "mood" },
  { id: 12, text: "What's the first thought that comes to mind right now?", type: "text", category: "mood" },
  { id: 13, text: "What would make today a great day for you?", type: "text", category: "mood" },
  { id: 14, text: "Is there anything weighing on your mind?", type: "text", category: "mood" },
  { id: 15, text: "How would you describe your mood in one sentence?", type: "text", category: "mood" },
  { id: 16, text: "What's one thing you're grateful for today?", type: "text", category: "mood" },
  { id: 17, text: "What emotion are you trying to avoid right now?", type: "text", category: "mood" },
  { id: 18, text: "Describe how your body feels physically right now.", type: "text", category: "mood" },
  { id: 19, text: "What's your inner dialogue saying to you?", type: "text", category: "mood" },
  { id: 20, text: "If you could change one thing about how you feel, what would it be?", type: "text", category: "mood" },

  // Mood - Scale
  { id: 21, text: "On a scale of 1–10, how happy are you right now?", type: "scale", category: "mood" },
  { id: 22, text: "Rate your mental clarity right now (1–10).", type: "scale", category: "mood" },
  { id: 23, text: "How calm do you feel on a scale of 1–10?", type: "scale", category: "mood" },
  { id: 24, text: "Rate your motivation level (1–10).", type: "scale", category: "mood" },
  { id: 25, text: "How emotionally stable do you feel (1–10)?", type: "scale", category: "mood" },
  { id: 26, text: "Rate your patience level right now (1–10).", type: "scale", category: "mood" },
  { id: 27, text: "How present/mindful are you feeling (1–10)?", type: "scale", category: "mood" },
  { id: 28, text: "Rate your self-confidence today (1–10).", type: "scale", category: "mood" },
  { id: 29, text: "How irritable are you right now (1–10)?", type: "scale", category: "mood" },
  { id: 30, text: "Rate how overwhelmed you feel (1–10).", type: "scale", category: "mood" },

  // Trading - Choice
  { id: 31, text: "Have you made any impulsive trades in the last 24 hours?", type: "choice", category: "trading", options: ["Yes, several", "One or two", "No", "I almost did"] },
  { id: 32, text: "What's driving your trading decisions today?", type: "choice", category: "trading", options: ["Research & data", "Gut feeling", "Social media hype", "Fear of missing out"] },
  { id: 33, text: "How do you handle a losing trade?", type: "choice", category: "trading", options: ["Accept & move on", "Try to recover immediately", "Feel frustrated for hours", "Stop trading for the day"] },
  { id: 34, text: "Are you revenge trading after a loss?", type: "choice", category: "trading", options: ["Yes", "Tempted to", "No", "I don't know what that is"] },
  { id: 35, text: "How often do you check your portfolio?", type: "choice", category: "trading", options: ["Every few minutes", "Hourly", "A few times a day", "Once a day or less"] },
  { id: 36, text: "Are you following your trading plan today?", type: "choice", category: "trading", options: ["Strictly", "Mostly", "Not really", "I don't have one"] },
  { id: 37, text: "Have you set stop-losses on your current positions?", type: "choice", category: "trading", options: ["Yes, all of them", "Some", "No", "I don't use stop-losses"] },
  { id: 38, text: "How do you feel about your recent performance?", type: "choice", category: "trading", options: ["Very satisfied", "It's okay", "Disappointed", "Frustrated"] },
  { id: 39, text: "Are you overexposed to a single asset?", type: "choice", category: "trading", options: ["Yes", "Slightly", "No, well diversified", "Not sure"] },
  { id: 40, text: "When was your last profitable trade?", type: "choice", category: "trading", options: ["Today", "This week", "Last week", "Can't remember"] },

  // Trading - Text
  { id: 41, text: "What's your biggest trading fear right now?", type: "text", category: "trading" },
  { id: 42, text: "Describe your trading mindset in one sentence.", type: "text", category: "trading" },
  { id: 43, text: "What lesson has the market taught you recently?", type: "text", category: "trading" },
  { id: 44, text: "What would you tell a beginner trader right now?", type: "text", category: "trading" },
  { id: 45, text: "What's your biggest regret in trading this week?", type: "text", category: "trading" },
  { id: 46, text: "Describe a trade you're proud of recently.", type: "text", category: "trading" },
  { id: 47, text: "What's the hardest part about trading for you?", type: "text", category: "trading" },
  { id: 48, text: "What's your current exit strategy for open positions?", type: "text", category: "trading" },
  { id: 49, text: "How do emotions typically affect your trading?", type: "text", category: "trading" },
  { id: 50, text: "What would you do differently if you could restart today?", type: "text", category: "trading" },

  // Trading - Scale
  { id: 51, text: "On a scale of 1–10, how stressed do you feel about your portfolio?", type: "scale", category: "trading" },
  { id: 52, text: "How strong is your FOMO right now (1–10)?", type: "scale", category: "trading" },
  { id: 53, text: "Rate your risk tolerance today (1–10).", type: "scale", category: "trading" },
  { id: 54, text: "How disciplined have you been with trades today (1–10)?", type: "scale", category: "trading" },
  { id: 55, text: "Rate your greed level right now (1–10).", type: "scale", category: "trading" },
  { id: 56, text: "How anxious are you about the market (1–10)?", type: "scale", category: "trading" },
  { id: 57, text: "Rate your attachment to current positions (1–10).", type: "scale", category: "trading" },
  { id: 58, text: "How much is social media influencing your trades (1–10)?", type: "scale", category: "trading" },
  { id: 59, text: "Rate your overconfidence level (1–10).", type: "scale", category: "trading" },
  { id: 60, text: "How much pressure do you feel to make money today (1–10)?", type: "scale", category: "trading" },

  // Extra Mood - Choice
  { id: 61, text: "How social are you feeling today?", type: "choice", category: "mood", options: ["Very social", "Neutral", "Prefer solitude", "Avoiding everyone"] },
  { id: 62, text: "How creative do you feel right now?", type: "choice", category: "mood", options: ["Very creative", "Somewhat", "Not really", "Mentally blocked"] },
  { id: 63, text: "What's your stress-relief method?", type: "choice", category: "mood", options: ["Exercise", "Meditation", "Music", "Nothing specific"] },
  { id: 64, text: "Have you eaten well today?", type: "choice", category: "mood", options: ["Balanced meals", "Snacks only", "Skipped meals", "Stress eating"] },
  { id: 65, text: "How connected do you feel to others today?", type: "choice", category: "mood", options: ["Very connected", "Somewhat", "Isolated", "Lonely"] },

  // Extra Mood - Text
  { id: 66, text: "What's one positive affirmation you can tell yourself?", type: "text", category: "mood" },
  { id: 67, text: "What triggered your current mood?", type: "text", category: "mood" },
  { id: 68, text: "What coping mechanism are you using right now?", type: "text", category: "mood" },
  { id: 69, text: "What's one thing that made you smile today?", type: "text", category: "mood" },
  { id: 70, text: "How would your best friend describe your mood right now?", type: "text", category: "mood" },

  // Extra Mood - Scale
  { id: 71, text: "Rate your overall wellbeing today (1–10).", type: "scale", category: "mood" },
  { id: 72, text: "How anxious are you right now (1–10)?", type: "scale", category: "mood" },
  { id: 73, text: "Rate your ability to handle setbacks today (1–10).", type: "scale", category: "mood" },
  { id: 74, text: "How much mental bandwidth do you have left (1–10)?", type: "scale", category: "mood" },
  { id: 75, text: "Rate your emotional awareness right now (1–10).", type: "scale", category: "mood" },

  // Extra Trading - Choice
  { id: 76, text: "Are you taking more risk than usual today?", type: "choice", category: "trading", options: ["Much more", "Slightly more", "About the same", "Less than usual"] },
  { id: 77, text: "How often do you second-guess your trades?", type: "choice", category: "trading", options: ["Always", "Often", "Sometimes", "Rarely"] },
  { id: 78, text: "Did market news affect your mood today?", type: "choice", category: "trading", options: ["Yes, positively", "Yes, negatively", "Slightly", "Not at all"] },
  { id: 79, text: "Are you holding a position longer than planned?", type: "choice", category: "trading", options: ["Yes, hoping it recovers", "Yes, it's going well", "No", "I don't set timeframes"] },
  { id: 80, text: "How do you react to seeing others profit?", type: "choice", category: "trading", options: ["Happy for them", "Jealous", "Motivated", "Frustrated"] },

  // Extra Trading - Text
  { id: 81, text: "What's one rule you've broken in trading recently?", type: "text", category: "trading" },
  { id: 82, text: "What cognitive bias might be affecting you right now?", type: "text", category: "trading" },
  { id: 83, text: "Describe your ideal trading state of mind.", type: "text", category: "trading" },
  { id: 84, text: "What would a rational version of yourself do right now?", type: "text", category: "trading" },
  { id: 85, text: "What's your biggest distraction while trading?", type: "text", category: "trading" },

  // Extra Trading - Scale
  { id: 86, text: "How much do you trust your current analysis (1–10)?", type: "scale", category: "trading" },
  { id: 87, text: "Rate your fear of loss right now (1–10).", type: "scale", category: "trading" },
  { id: 88, text: "How attached are you to being 'right' (1–10)?", type: "scale", category: "trading" },
  { id: 89, text: "Rate your willingness to cut losses today (1–10).", type: "scale", category: "trading" },
  { id: 90, text: "How much is ego driving your trades (1–10)?", type: "scale", category: "trading" },

  // More variety
  { id: 91, text: "Are you trading to make money or to feel something?", type: "choice", category: "trading", options: ["To make money", "For the thrill", "Both", "I'm not sure"] },
  { id: 92, text: "How long can you go without checking charts?", type: "choice", category: "trading", options: ["Minutes", "An hour", "Several hours", "All day"] },
  { id: 93, text: "What's your relationship with uncertainty?", type: "text", category: "trading" },
  { id: 94, text: "Do you feel in control of your trading?", type: "choice", category: "trading", options: ["Fully in control", "Mostly", "Barely", "Not at all"] },
  { id: 95, text: "Rate how impulsive you feel right now (1–10).", type: "scale", category: "trading" },
  { id: 96, text: "What would happen if you took the rest of the day off?", type: "text", category: "mood" },
  { id: 97, text: "How do you feel about asking for help?", type: "choice", category: "mood", options: ["Comfortable", "Somewhat okay", "Reluctant", "I never ask"] },
  { id: 98, text: "Rate your emotional resilience today (1–10).", type: "scale", category: "mood" },
  { id: 99, text: "What's one boundary you should set today?", type: "text", category: "mood" },
  { id: 100, text: "How would you rate your self-awareness right now (1–10)?", type: "scale", category: "mood" },
];

// Camera question is always included as the last question
const cameraQuestion: Question = {
  id: 999,
  text: "Let's read your face — take a selfie for AI-powered emotion analysis.",
  type: "camera",
  category: "mood",
};

function shuffleAndPick<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const mockEmotions = [
  { label: "Calm", confidence: 72, icon: Smile, color: "text-primary" },
  { label: "Focused", confidence: 18, icon: Meh, color: "text-muted-foreground" },
  { label: "Anxious", confidence: 7, icon: AlertTriangle, color: "text-yellow-400" },
  { label: "Stressed", confidence: 3, icon: Frown, color: "text-destructive" },
];

const EmotionalAI = () => {
  // Camera first + 9 random choice-only questions = 10 total
  const questions = useMemo(() => {
    const choiceQuestions = questionPool.filter((q) => q.type === "choice");
    const picked = shuffleAndPick(choiceQuestions, 9);
    return [cameraQuestion, ...picked];
  }, []);

  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [completed, setCompleted] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const q = questions[currentQ];

  const [cameraError, setCameraError] = useState(false);

  const startCamera = useCallback(async () => {
    setCameraError(false);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // No camera API available (e.g. iframe restrictions) — fallback to file upload
        setCameraError(true);
        fileInputRef.current?.click();
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
        };
        setCameraActive(true);
      }
    } catch {
      setCameraError(true);
      // Auto-open file picker as fallback
      fileInputRef.current?.click();
    }
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      ctx?.drawImage(videoRef.current, 0, 0);
      const dataUrl = canvasRef.current.toDataURL("image/png");
      setCapturedImage(dataUrl);

      // Stop camera
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach((t) => t.stop());
      setCameraActive(false);

      // Simulate analysis delay
      setTimeout(() => setShowAnalysis(true), 1500);
    }
  }, []);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setCapturedImage(reader.result as string);
      setCameraError(false);
      setTimeout(() => setShowAnalysis(true), 1500);
    };
    reader.readAsDataURL(file);
  }, []);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
    setShowAnalysis(false);
    // Stop any active camera stream
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach((t) => t.stop());
    }
    setCameraActive(false);
  }, []);

  const setAnswer = (val: string | number) => {
    setAnswers((prev) => ({ ...prev, [q.id]: val }));
  };

  const next = () => {
    if (currentQ < questions.length - 1) setCurrentQ((p) => p + 1);
    else {
      setCompleted(true);
      // Save answers with question text for the Intelligence page
      const savedData = questions
        .filter((q) => q.type !== "camera")
        .map((q) => ({ question: q.text, answer: answers[q.id] ?? "—", category: q.category }));
      localStorage.setItem("MindFi_checkin", JSON.stringify(savedData));
      // Save captured image if available
      if (capturedImage) {
        localStorage.setItem("MindFi_selfie", capturedImage);
      }
    }
  };

  const prev = () => {
    if (currentQ > 0) setCurrentQ((p) => p - 1);
  };

  const progress = ((currentQ + (completed ? 1 : 0)) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-glow-secondary/5 rounded-full blur-[100px]" />
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

      <main className="relative z-10 max-w-2xl mx-auto px-6 pt-8 pb-20">
        {/* Title */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-display mb-4">
            <Brain className="w-3 h-3" />
            Emotional AI Check-in
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground">How's Your Mind Today?</h1>
          <p className="mt-3 text-muted-foreground text-sm max-w-md mx-auto">
            Answer a few questions so we can understand your emotional state and trading psychology.
          </p>
        </motion.div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-secondary mb-8">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {!completed ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={q.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.3 }}
              className="p-6 md:p-8 rounded-2xl border border-border bg-card/60 backdrop-blur-sm"
            >
              {/* Category badge */}
              <span
                className={`inline-block text-[10px] uppercase tracking-widest font-display font-semibold mb-3 ${
                  q.category === "mood" ? "text-primary" : "text-glow-secondary"
                }`}
              >
                {q.category === "mood" ? "Mood" : "Trading Psychology"}
              </span>

              <h2 className="font-display text-xl font-semibold text-foreground mb-6">{q.text}</h2>

              {/* Text input */}
              {q.type === "text" && (
                <textarea
                  value={(answers[q.id] as string) || ""}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Type your response..."
                  className="w-full h-28 rounded-xl bg-secondary border border-border px-4 py-3 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              )}

              {/* Choice */}
              {q.type === "choice" && q.options && (
                <div className="grid gap-3">
                  {q.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setAnswer(opt)}
                      className={`text-left px-4 py-3 rounded-xl border text-sm font-body transition-colors ${
                        answers[q.id] === opt
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-secondary/50 text-foreground hover:border-primary/30"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* Scale */}
              {q.type === "scale" && (
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => setAnswer(n)}
                      className={`w-11 h-11 rounded-xl border text-sm font-display font-semibold transition-colors ${
                        answers[q.id] === n
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              )}

              {/* Camera */}
              {q.type === "camera" && (
                <div className="flex flex-col items-center gap-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="user"
                    onChange={handleFileUpload}
                    className="hidden"
                  />

                  {!capturedImage && !cameraActive && (
                    <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                      {/* Primary: Open Camera */}
                      <button
                        onClick={startCamera}
                        className="w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl border border-primary/30 bg-primary/10 text-primary text-sm font-display font-medium hover:bg-primary/15 transition-colors"
                      >
                        <Camera className="w-5 h-5" />
                        Open Camera
                      </button>

                      {/* Fallback: Upload photo */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-secondary/50 text-foreground text-sm font-display font-medium hover:bg-secondary transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Upload a Selfie Instead
                      </button>

                      {cameraError && (
                        <p className="text-xs text-destructive text-center">
                          Camera access denied. Please use the upload option.
                        </p>
                      )}
                    </div>
                  )}

                  {cameraActive && (
                    <div className="relative w-full max-w-sm">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full aspect-[4/3] object-cover rounded-xl border border-border bg-secondary"
                      />
                      <button
                        onClick={capturePhoto}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-display font-medium hover:bg-primary/90 transition-colors shadow-lg"
                      >
                        <Camera className="w-4 h-4" />
                        Capture
                      </button>
                    </div>
                  )}

                  {capturedImage && (
                    <div className="w-full max-w-sm">
                      <div className="relative">
                        <img src={capturedImage} alt="Captured selfie" className="w-full rounded-xl border border-border" />
                        <button
                          onClick={retakePhoto}
                          className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-background/90 border border-border text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Retake
                        </button>
                      </div>

                      {!showAnalysis && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground text-sm">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full"
                          />
                          Analyzing facial expression...
                        </div>
                      )}

                      {showAnalysis && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-4 p-4 rounded-xl border border-border bg-secondary/50 space-y-3"
                        >
                          <p className="text-xs uppercase tracking-widest font-display text-primary font-semibold">
                            Emotion Analysis
                          </p>
                          {mockEmotions.map((e) => (
                            <div key={e.label} className="flex items-center gap-3">
                              <e.icon className={`w-4 h-4 ${e.color}`} />
                              <span className="text-sm text-foreground w-20">{e.label}</span>
                              <div className="flex-1 h-2 rounded-full bg-background">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${e.confidence}%` }}
                                  transition={{ duration: 0.8, delay: 0.2 }}
                                  className="h-full rounded-full bg-primary/60"
                                />
                              </div>
                              <span className="text-xs text-muted-foreground w-8 text-right">{e.confidence}%</span>
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </div>
                  )}

                  <canvas ref={canvasRef} className="hidden" />
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={prev}
                  disabled={currentQ === 0}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
                <span className="text-xs text-muted-foreground font-display">
                  {currentQ + 1} / {questions.length}
                </span>
                <button
                  onClick={next}
                  className="flex items-center gap-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-display font-medium hover:bg-primary/90 transition-colors"
                >
                  {currentQ === questions.length - 1 ? "Finish" : "Next"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 rounded-2xl border border-border bg-card/60 backdrop-blur-sm text-center"
          >
            {capturedImage && (
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/30 mx-auto mb-5">
                <img src={capturedImage} alt="Your selfie" className="w-full h-full object-cover" />
              </div>
            )}
            {!capturedImage && (
              <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-5">
                <TrendingUp className="w-7 h-7 text-primary" />
              </div>
            )}
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">Check-in Complete</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
              Your emotional profile has been captured. In a full version, this data would generate personalized trading insights.
            </p>
            <Link
              to="/personalized-intelligence"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-display font-medium hover:bg-primary/90 transition-colors"
            >
              Generate My Report
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default EmotionalAI;

