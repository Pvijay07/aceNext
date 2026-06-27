import { useState, useRef, useEffect } from "react";
import {
  Send,
  Sparkles,
  MessageSquare,
  RefreshCw,
  User,
  HelpCircle,
} from "lucide-react";
import { UserProfile, Course } from "../../types";
import { api } from "../../api";

interface Message {
  role: "user" | "model";
  content: string;
}

interface TutorBotProps {
  profile: UserProfile;
  courses: Course[];
  focusMode?: boolean;
  onTrackXp: (xp: number) => void;
}

export default function TutorBot({
  profile,
  courses,
  focusMode,
  onTrackXp,
}: TutorBotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "model",
      content: `👋 Hi **${profile.name}**! I'm your continuous **AI Tutor**. \n\nI possess deep insight into your courses: **React 19, Modern Tailwind CSS, and Express API schemas**. Feel free to ask me to explain algorithms step-by-step, review syntactic components, list typical exam pointers, or elaborate on study topics!`,
    },
  ]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([
    "Explain React 19 concurrent state updates in simple terms",
    "Describe typical isolation levels for locking database transactions in SQL",
    "Show me a quick, highly optimized binary search function in Javascript",
    "What are sliding window algorithms used for?",
  ]);

  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Auto scroll
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    const userMsg: Message = { role: "user", content: textToSend };

    // Append user message and an empty model message placeholder
    setMessages((prev) => [...prev, userMsg, { role: "model", content: "" }]);
    setIsLoading(true);
    setInput("");

    try {
      const data = await api.post("/tutor/chat", {
        messages: [...messages, userMsg].filter(
          (m) => m.content.trim() !== "",
        ),
        context: {
          courseName: courses[0]?.title,
          lessonTitle: "Interactive Doubt Solving",
          topic: textToSend,
        },
      });

      setMessages((prev) => {
        const newMessages = [...prev];
        const lastIndex = newMessages.length - 1;
        newMessages[lastIndex] = {
          role: "model",
          content: data.content || "No response received.",
        };
        return newMessages;
      });

      if (data.suggestedQuestions) {
        setSuggestedQuestions(data.suggestedQuestions);
      }

      onTrackXp(10);
    } catch (e) {
      console.error(e);
      setMessages((prev) => {
        const newMessages = [...prev];
        newMessages[newMessages.length - 1].content =
          "Oops! I hit a routing buffer. Please check if your server is running.";
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      id="ai-tutor-view"
      className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-14rem)] max-h-[750px]"
    >
      {/* Left: Chat interface */}
      <div
        className={`${focusMode ? "lg:col-span-12 max-w-4xl mx-auto w-full" : "lg:col-span-8"} flex flex-col border border-slate-100 bg-white rounded-2xl shadow-sm overflow-hidden h-full`}
      >
        {/* Tutor Info bar */}
        <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
              <Sparkles className="h-4 w-4 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs font-bold leading-none select-none">
                AceNext Dedicated AI Tutor
              </h4>
              <p className="text-[10px] text-slate-400 mt-1">
                Ready for doubt explanations • Earns +10 XP per reply
              </p>
            </div>
          </div>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
            Powered by Gemini
          </span>
        </div>

        {/* Chat Bubbles */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg, index) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={index}
                className={`flex items-start gap-2.5 ${isUser ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-xs shrink-0 ${
                    isUser
                      ? "bg-slate-900 text-white"
                      : "bg-indigo-100 text-indigo-700 font-bold"
                  }`}
                >
                  {isUser ? <User className="h-3.5 w-3.5" /> : "AI"}
                </div>
                <div
                  className={`max-w-[82%] rounded-2xl p-4 text-xs leading-relaxed shadow-sm ${
                    isUser
                      ? "bg-slate-900 text-white rounded-tr-none"
                      : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                  }`}
                >
                  <div className="prose prose-slate max-w-none whitespace-pre-line font-sans">
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-start gap-2.5">
              <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs shrink-0 animate-pulse">
                AI
              </div>
              <div className="max-w-[80%] rounded-2xl p-4 bg-white border border-slate-100 text-xs text-slate-500 flex items-center gap-2">
                <RefreshCw className="h-3.5 w-3.5 animate-spin text-indigo-600" />
                Thinking in-depth...
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>

        {/* Chat input bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="border-t border-slate-100 p-3 bg-white flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything: 'explain closures', 'suggest a database project query'..."
            disabled={isLoading}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 text-xs py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl px-4 flex items-center justify-center transition disabled:opacity-50 shadow-sm"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Right: Suggested Shortcuts & Prompts */}
      {!focusMode && (
        <div className="lg:col-span-4 flex flex-col justify-between h-full bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <div className="space-y-4">
            <h4 className="font-extrabold text-[11px] text-slate-500 tracking-wider uppercase font-mono flex items-center gap-1">
              <HelpCircle className="h-3.5 w-3.5 text-slate-400" /> Continuous
              Topic Guide
            </h4>
            <p className="text-[11px] text-slate-500 leading-normal">
              Jumpstart your doubts using our specialized preset questions.
              Click any pill to initiate an immediate technical discussion with
              your tutor!
            </p>

            <div className="space-y-2.5 pt-2">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => sendMessage(q)}
                  disabled={isLoading}
                  className="w-full text-left p-3 rounded-xl border border-white bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 hover:border-slate-200 text-xs transition flex items-start gap-2 shadow-sm font-medium"
                >
                  <MessageSquare className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{q}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-tr from-indigo-50 to-blue-50 p-4 rounded-xl border border-indigo-100/50 space-y-2">
            <span className="text-[10px] font-extrabold text-indigo-700 tracking-widest uppercase font-mono">
              Dynamic Context
            </span>
            <p className="text-[11px] text-indigo-950 leading-relaxed font-sans">
              Your tutor tracks lesson progress in-stride. Complete syllabus
              sections to refresh and update your active AI scope.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
