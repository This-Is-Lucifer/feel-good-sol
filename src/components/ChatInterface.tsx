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
  content: "Hey there 👋 I'm MindFi — your crypto wellness companion. How are you feeling about the markets today?",
};

const SYSTEM_MESSAGE = "You are MindFi, an empathetic and supportive AI assistant for crypto traders. Your role is to help users manage stress, anxiety, and emotional decision-making while trading. Provide concise, practical guidance, stay understanding and calm, and tailor responses to the user's emotional state and trading context. Keep your tone conversational, friendly, and encouraging.";

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [micDenied, setMicDenied] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const speakingIdRef = useRef<string | null>(null);
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

  // Text-to-Speech for a specific message
  const speakMessage = useCallback((msgId: string, text: string) => {
    // If already speaking this message, stop it
    if (speakingIdRef.current === msgId) {
      window.speechSynthesis.cancel();
      speakingIdRef.current = null;
      setSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const plainText = text.replace(/[#*_~`>]/g, "").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
    const utterance = new SpeechSynthesisUtterance(plainText);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.lang = "en-US";
    utterance.onend = () => { speakingIdRef.current = null; setSpeakingId(null); };
    utterance.onerror = () => { speakingIdRef.current = null; setSpeakingId(null); };
    speakingIdRef.current = msgId;
    setSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: userMessage,
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);

    try {
      const chatUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
      const resp = await fetch(chatUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: updatedMessages
            .filter((m) => m.id !== "welcome")
            .map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!resp.ok || !resp.body) {
        throw new Error(`API error: ${resp.status}`);
      }

      const aiMsgId = (Date.now() + 1).toString();
      let assistantText = "";

      setMessages((prev) => [...prev, { id: aiMsgId, role: "assistant", content: "" }]);

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantText += content;
              setMessages((prev) =>
                prev.map((m) => (m.id === aiMsgId ? { ...m, content: assistantText } : m))
              );
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }

      // Auto-speak the final response
      if (assistantText) {
        speakMessage(aiMsgId, assistantText);
      }
    } catch (err) {
      console.error("Chat AI error:", err);
      const fallback = "I'm having trouble connecting right now. Please try again in a moment. 🙏";
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), role: "assistant", content: fallback }]);
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
        <span className="text-sm font-display font-medium text-foreground/80">MindFi AI</span>
        <button
          onClick={() => {
            window.speechSynthesis.cancel();
            setSpeakingId(null);
            toast({ title: "Speech stopped 🔇" });
          }}
          className="p-1 rounded-md hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-colors ml-auto"
          title="Stop speaking"
        >
          {speakingId ? <Volume2 className="w-3.5 h-3.5 text-primary animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
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
                className={`max-w-[80%] group relative px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    speakMessage(msg.id, msg.content);
                  }}
                  className={`absolute -bottom-1 ${msg.role === "user" ? "-left-7" : "-right-7"} p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                    speakingId === msg.id
                      ? "opacity-100 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title={speakingId === msg.id ? "Stop reading" : "Read aloud"}
                >
                  {speakingId === msg.id ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
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

