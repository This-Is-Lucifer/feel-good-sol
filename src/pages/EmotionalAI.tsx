import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Camera, ChevronRight, ChevronLeft, Smile, Frown, Meh, AlertTriangle, TrendingUp, X } from "lucide-react";
import { Link } from "react-router-dom";

interface Question {
  id: number;
  text: string;
  type: "text" | "scale" | "choice" | "camera";
  category: "mood" | "trading";
  options?: string[];
}

const questions: Question[] = [
  {
    id: 1,
    text: "How are you feeling right now?",
    type: "choice",
    category: "mood",
    options: ["Great", "Good", "Neutral", "Anxious", "Stressed"],
  },
  {
    id: 2,
    text: "On a scale of 1–10, how stressed do you feel about your portfolio?",
    type: "scale",
    category: "trading",
  },
  {
    id: 3,
    text: "Describe your current emotional state in a few words.",
    type: "text",
    category: "mood",
  },
  {
    id: 4,
    text: "Have you made any impulsive trades in the last 24 hours?",
    type: "choice",
    category: "trading",
    options: ["Yes, several", "One or two", "No", "I almost did"],
  },
  {
    id: 5,
    text: "Let's read your face — capture a selfie for mock emotion analysis.",
    type: "camera",
    category: "mood",
  },
  {
    id: 6,
    text: "How strong is your FOMO right now?",
    type: "scale",
    category: "trading",
  },
  {
    id: 7,
    text: "What's driving your trading decisions today?",
    type: "choice",
    category: "trading",
    options: ["Research & data", "Gut feeling", "Social media hype", "Fear of missing out"],
  },
];

const mockEmotions = [
  { label: "Calm", confidence: 72, icon: Smile, color: "text-primary" },
  { label: "Focused", confidence: 18, icon: Meh, color: "text-muted-foreground" },
  { label: "Anxious", confidence: 7, icon: AlertTriangle, color: "text-yellow-400" },
  { label: "Stressed", confidence: 3, icon: Frown, color: "text-destructive" },
];

const EmotionalAI = () => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [completed, setCompleted] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const q = questions[currentQ];

  const [cameraError, setCameraError] = useState(false);

  const startCamera = useCallback(async () => {
    setCameraError(false);
    try {
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
      localStorage.setItem("mindflow_checkin", JSON.stringify(savedData));
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
          <span className="font-display font-semibold text-lg text-foreground">MindFlow</span>
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
                  {!capturedImage && !cameraActive && (
                    <button
                      onClick={startCamera}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl border border-primary/30 bg-primary/10 text-primary text-sm font-display font-medium hover:bg-primary/15 transition-colors"
                    >
                      <Camera className="w-4 h-4" />
                      Open Camera
                    </button>
                  )}

                  {cameraActive && (
                    <div className="relative w-full max-w-sm">
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full rounded-xl border border-border"
                      />
                      <button
                        onClick={capturePhoto}
                        className="mt-3 w-full flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-display font-medium hover:bg-primary/90 transition-colors"
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
                          onClick={() => {
                            setCapturedImage(null);
                            setShowAnalysis(false);
                          }}
                          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-background/80 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <X className="w-3.5 h-3.5" />
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
                            Emotion Analysis (Mock)
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
            <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center mx-auto mb-5">
              <TrendingUp className="w-7 h-7 text-primary" />
            </div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-3">Check-in Complete</h2>
            <p className="text-muted-foreground text-sm mb-6 max-w-sm mx-auto">
              Your emotional profile has been captured. In a full version, this data would generate personalized trading insights.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-display font-medium hover:bg-primary/90 transition-colors"
            >
              Back to Home
            </Link>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default EmotionalAI;
