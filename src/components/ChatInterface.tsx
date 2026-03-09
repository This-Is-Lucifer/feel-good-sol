import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Loader2, Trash2, Mic, MicOff, Volume2, VolumeX } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hey there 👋 I'm MindFlow — your crypto wellness companion. How are you feeling about the markets today?",
};

const SYSTEM_MESSAGE = "You are MindFlow, an empathetic and supportive AI assistant for crypto traders. Your role is to help users manage stress, anxiety, and emotional decision-making while trading. Provide concise, practical guidance, stay understanding and calm, and tailor responses to the user's emotional state and trading context. Keep your tone conversational, friendly, and encouraging.";

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [micDenied, setMicDenied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Speech-to-Text setup
  const startListening = useCallback(async () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({ variant: "destructive", title: "Not Supported", description: "Speech recognition is not supported in this browser." });
      return;
    }

    // Check microphone permission first
    try {
      const permissionStatus = await navigator.permissions.query({ name: "microphone" as PermissionName });
      if (permissionStatus.state === "denied") {
        setMicDenied(true);
        toast({
          variant: "destructive",
          title: "Microphone Blocked",
          description: "Microphone access was denied. Click the lock/site-settings icon in your browser's address bar to allow microphone access, then try again.",
        });
        return;
      }
    } catch {
      // permissions API may not be available, proceed anyway
    }

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicDenied(false);
    } catch {
      setMicDenied(true);
      toast({
        variant: "destructive",
        title: "Microphone Blocked",
        description: "Microphone access was denied. Click the lock/site-settings icon in your browser's address bar to allow microphone access, then try again.",
      });
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join("");
      setInput(transcript);
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = (e: any) => {
      setIsListening(false);
      if (e.error === "not-allowed") {
        setMicDenied(true);
        toast({
          variant: "destructive",
          title: "Microphone Blocked",
          description: "Microphone access was denied. Click the lock/site-settings icon in your browser's address bar to allow it.",
        });
      }
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }, [toast]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  // Text-to-Speech
  const speakText = useCallback((text: string) => {
    if (!ttsEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  }, [ttsEnabled]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("https://e975-119-42-59-192.ngrok-free.app/api/ollama", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system: SYSTEM_MESSAGE,
          prompt: userMessage,
        }),
      });

      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      const aiText = typeof data === "string" ? data : data.response || data.message?.content || "I'm here for you. Could you tell me more?";

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: aiText,
      };
      setMessages((prev) => [...prev, aiMsg]);
      speakText(aiText);
    } catch (err) {
      console.error("Chat AI error:", err);
      const fallback = "I'm having trouble connecting right now. Please try again in a moment. 🙏";
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: fallback,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClear = () => {
    window.speechSynthesis.cancel();
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <div className="flex flex-col w-full max-w-lg h-[400px] md:h-[440px] rounded-2xl border border-border bg-card/60 backdrop-blur-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
        </span>
        <span className="text-sm font-display font-medium text-foreground/80">MindFlow AI</span>
        <button
          onClick={() => {
            const next = !ttsEnabled;
            setTtsEnabled(next);
            if (!next) window.speechSynthesis.cancel();
            toast({ title: next ? "Voice enabled 🔊" : "Voice muted 🔇" });
          }}
          className="p-1 rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors ml-auto"
          title={ttsEnabled ? "Mute voice" : "Unmute voice"}
        >
          {ttsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={handleClear}
          className="p-1 rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors"
          title="Clear chat"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <span className="text-xs text-muted-foreground">powered by AI</span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-secondary text-secondary-foreground rounded-bl-md"
                }`}
              >
                {msg.role === "user" ? msg.content : (
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-secondary text-muted-foreground px-4 py-2.5 rounded-2xl rounded-bl-md text-sm flex items-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Thinking...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex items-center gap-2 bg-secondary/50 rounded-xl px-3 py-2">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`p-1.5 rounded-lg transition-all ${
              isListening
                ? "bg-destructive text-destructive-foreground animate-pulse"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary"
            }`}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={isListening ? "Listening..." : "How are you feeling today?"}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-1.5 rounded-lg bg-primary text-primary-foreground disabled:opacity-30 hover:opacity-90 transition-opacity"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
