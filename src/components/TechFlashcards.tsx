import React, { useState, useEffect } from "react";
import { Sparkles, RefreshCw, Star, CheckCircle, ChevronLeft, ChevronRight, HelpCircle, Eye, EyeOff, Plus, Play, RotateCcw, Trash2, Award, Zap, BookOpen } from "lucide-react";

interface Flashcard {
  id: string;
  category: string;
  question: string;
  answer: string;
  difficulty: "Easy" | "Medium" | "Hard";
  userStatus?: "mastered" | "needs-review" | "unviewed";
}

const INITIAL_DECK: Flashcard[] = [
  // Frontend Architecture
  {
    id: "fe-1",
    category: "Frontend Architecture",
    question: "Virtual DOM vs. Real DOM reconciliation process",
    answer: "The Virtual DOM is an in-memory lightweight representation of the real DOM. When state changes, a new structural tree is calculated. A highly optimized reconciliation algorithm ('diffing') evaluates the delta between the old and new trees, batching the minimal necessary updates to paint on the browser, preventing costly layout reflows.",
    difficulty: "Medium",
    userStatus: "unviewed"
  },
  {
    id: "fe-2",
    category: "Frontend Architecture",
    question: "Debouncing vs. Throttling optimization techniques",
    answer: "Debouncing delays event execution until a designated quiet period of inactivity expires (perfect for search inputs). Throttling enforces a maximum frequency rate limit, guaranteeing the callback executes at most once per time window (ideal for infinite scrolls or window resizing layouts).",
    difficulty: "Easy",
    userStatus: "unviewed"
  },
  {
    id: "fe-3",
    category: "Frontend Architecture",
    question: "Static Site Generation (SSG) vs. Server-Side Rendering (SSR)",
    answer: "SSG pre-builds entire pages into static HTML/JSON files at compile-time, allowing instant delivery via universal CDNs without server compute overhead. SSR generates the static page on the fly for each incoming HTTP request, enabling completely dynamic content at the cost of document TTFB delay.",
    difficulty: "Medium",
    userStatus: "unviewed"
  },
  {
    id: "fe-4",
    category: "Frontend Architecture",
    question: "Hydration in modern frameworks",
    answer: "Hydration is the client-side execution process where browser-loaded JavaScript runs to bind event listeners, initialize local states, and attach interactive capabilities to static server-rendered HTML markup already printed on the screen.",
    difficulty: "Hard",
    userStatus: "unviewed"
  },

  // Algorithms & DS
  {
    id: "algo-1",
    category: "Algorithms & DS",
    question: "Two-Pointer Technique time optimization benefit",
    answer: "By keeping two index references tracking positions (e.g., beginning and end) and shifting them inward based on condition evaluations, we can analyze sorted inputs or search pairs in linear O(N) time, eliminating the traditional nested double loop O(N^2) brute force search footprint.",
    difficulty: "Medium",
    userStatus: "unviewed"
  },
  {
    id: "algo-2",
    category: "Algorithms & DS",
    question: "Dynamic Programming (DP) core conditions",
    answer: "DP requires two key structural properties: (1) Overlapping Subproblems (the same micro-calculations are computed repeatedly) and (2) Optimal Substructure (an optimal overall solution can be constructed from optimal answers of its subproblems). Solved via memoization (top-down) or tabulation (bottom-up).",
    difficulty: "Hard",
    userStatus: "unviewed"
  },
  {
    id: "algo-3",
    category: "Algorithms & DS",
    question: "Trie Data Structure prefix mapping advantage",
    answer: "A Trie (prefix tree) organizes nodes representatively along sequential string characters. It enables lightning-fast auto-complete, prefix searches, and spelling dictionary operations in O(L) time where L is the string length, completely independent of the quantity of strings stored inside the dictionary.",
    difficulty: "Hard",
    userStatus: "unviewed"
  },
  {
    id: "algo-4",
    category: "Algorithms & DS",
    question: "Big O Time Scale of Hash Map operations",
    answer: "Hash maps achieve Average case O(1) constant time lookups, insertions, and deletions. However, under extreme hash collision saturation or poor bucket resizing functions, operations can degrade to Worst case O(N) linear time searches.",
    difficulty: "Easy",
    userStatus: "unviewed"
  },

  // System Design & Backend
  {
    id: "sys-1",
    category: "System Design & Backend",
    question: "Database Sharding vs. Horizontal Partitioning",
    answer: "Horizontal Partitioning splits dynamic tables inside a single local database instance based on rows (e.g., sorting users with odd IDs into table partition A). Sharding goes further by completely distributing targeted partitions across entirely separate physical database servers/nodes globally.",
    difficulty: "Hard",
    userStatus: "unviewed"
  },
  {
    id: "sys-2",
    category: "System Design & Backend",
    question: "CAP Theorem core constraint",
    answer: "CAP states a distributed service can satisfy at most two out of three guarantees simultaneously: Consistency (all nodes see the exact same data), Availability (every healthy node returns non-error answers), and Partition Tolerance (the platform operates through arbitrary communication drops). On active networks, Partition Tolerance is binary, meaning databases must choose strictly between CP or AP.",
    difficulty: "Medium",
    userStatus: "unviewed"
  },
  {
    id: "sys-3",
    category: "System Design & Backend",
    question: "ACID Database Transaction criteria",
    answer: "ACID ensures reliable data operations: Atomicity (all-or-nothing operations succeed), Consistency (violating strict structural constraints restarts state), Isolation (simultaneous parallel queries do not leak dirty intermediates), and Durability (hard disk logging survives complete severe powers outages).",
    difficulty: "Medium",
    userStatus: "unviewed"
  },
  {
    id: "sys-4",
    category: "System Design & Backend",
    question: "CDN Pull vs. CDN Push caching models",
    answer: "CDN Push uploads content files to edge cache storage folders directly during main application deployment build pipelines. CDN Pull queries origin servers dynamically on the very first localized user request, then caches that artifact globally for subsequent regional requests.",
    difficulty: "Easy",
    userStatus: "unviewed"
  }
];

interface TechFlashcardsProps {
  onTrackXp: (xp: number) => void;
}

export default function TechFlashcards({ onTrackXp }: TechFlashcardsProps) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("All Decks");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [xpClaimedList, setXpClaimedList] = useState<Record<string, boolean>>({});

  // Form custom card state
  const [showForm, setShowForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newCategory, setNewCategory] = useState("Frontend Architecture");
  const [newDifficulty, setNewDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");

  // Load from local storage
  useEffect(() => {
    const backupKey = "platform_tech_flashcards_backup_v1";
    const saved = localStorage.getItem(backupKey);
    if (saved) {
      try {
        setCards(JSON.parse(saved));
      } catch (e) {
        setCards(INITIAL_DECK);
      }
    } else {
      setCards(INITIAL_DECK);
      localStorage.setItem(backupKey, JSON.stringify(INITIAL_DECK));
    }

    const xpSaved = localStorage.getItem("platform_flashcards_xp_claims");
    if (xpSaved) {
      try {
        setXpClaimedList(JSON.parse(xpSaved));
      } catch (e) {}
    }
  }, []);

  const saveDeck = (newDeck: Flashcard[]) => {
    setCards(newDeck);
    localStorage.setItem("platform_tech_flashcards_backup_v1", JSON.stringify(newDeck));
  };

  const filteredCards = activeCategory === "All Decks"
    ? cards
    : cards.filter((c) => c.category === activeCategory);

  const activeCard = filteredCards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    if (currentIndex < filteredCards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0); // Loop back
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else {
      setCurrentIndex(filteredCards.length - 1); // Loop to end
    }
  };

  const markStatus = (status: "mastered" | "needs-review") => {
    if (!activeCard) return;

    const updated = cards.map((c) => {
      if (c.id === activeCard.id) {
        return { ...c, userStatus: status };
      }
      return c;
    });

    saveDeck(updated);

    // Give reward XP on first-time mastery of the term card!
    if (status === "mastered" && !xpClaimedList[activeCard.id]) {
      const xpValue = activeCard.difficulty === "Easy" ? 10 : activeCard.difficulty === "Medium" ? 20 : 35;
      onTrackXp(xpValue);
      setXpClaimedList((prev) => {
        const next = { ...prev, [activeCard.id]: true };
        localStorage.setItem("platform_flashcards_xp_claims", JSON.stringify(next));
        return next;
      });

      // Simple visual celebrate feedback
      window.dispatchEvent(
        new CustomEvent("celebrate_achievement", {
          detail: {
            title: `Technical Concept Mastered! 🌟`,
            subtitle: `You reviewed & fully mastered: "${activeCard.question}". Gained +${xpValue} XP!`,
            type: "score",
          },
        })
      );
    }

    // Auto trigger slide of card next
    setTimeout(() => {
      handleNext();
    }, 400);
  };

  const resetProgress = () => {
    const reset = cards.map((c) => ({ ...c, userStatus: "unviewed" }));
    saveDeck(reset);
    setXpClaimedList({});
    localStorage.removeItem("platform_flashcards_xp_claims");
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  // Add custom card
  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    const newCard: Flashcard = {
      id: `custom-${Date.now()}`,
      category: newCategory,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      difficulty: newDifficulty,
      userStatus: "unviewed"
    };

    const nextDeck = [newCard, ...cards];
    saveDeck(nextDeck);

    // Reset inputs
    setNewQuestion("");
    setNewAnswer("");
    setShowForm(false);
    setCurrentIndex(0);
    setIsFlipped(false);

    // Toast reward
    window.dispatchEvent(
      new CustomEvent("celebrate_achievement", {
        detail: {
          title: "Custom Card Saved! 📇",
          subtitle: `Added your custom research concept to the "${newCategory}" study deck folder!`,
          type: "badge",
        },
      })
    );
  };

  const handleDeleteCard = (cardId: string) => {
    const updated = cards.filter((c) => c.id !== cardId);
    saveDeck(updated);
    if (currentIndex >= updated.length && currentIndex > 0) {
      setCurrentIndex(updated.length - 1);
    }
    setIsFlipped(false);
  };

  // Stats calculation
  const totalInFiltered = filteredCards.length;
  const masteredCount = filteredCards.filter((c) => c.userStatus === "mastered").length;
  const reviewCount = filteredCards.filter((c) => c.userStatus === "needs-review").length;
  const masteryPercentage = totalInFiltered > 0 ? Math.round((masteredCount / totalInFiltered) * 100) : 0;

  const categories = ["All Decks", "Frontend Architecture", "Algorithms & DS", "System Design & Backend"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full font-sans">
      {/* 1. Left controls panel */}
      <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
        <div className="space-y-4">
          {/* Deck selector */}
          <div className="rounded-xl border border-slate-100 bg-white p-4.5 shadow-sm space-y-3.5">
            <h4 className="font-extrabold text-[10px] text-slate-400 font-mono uppercase tracking-widest">
              Available Study Decks
            </h4>
            <div className="space-y-1">
              {categories.map((cat) => {
                const countOfCat = cat === "All Decks" ? cards.length : cards.filter((c) => c.category === cat).length;
                const active = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      setCurrentIndex(0);
                      setIsFlipped(false);
                    }}
                    className={`w-full text-left text-xs px-3 py-2.5 rounded-lg flex items-center justify-between transition-all ${
                      active
                        ? "bg-slate-900 border-transparent text-white font-bold shadow-md shadow-slate-900/10"
                        : "bg-transparent text-slate-600 hover:bg-slate-50 font-semibold border border-transparent"
                    }`}
                  >
                    <span className="truncate">{cat}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                      {countOfCat}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Core Analytics Tracker widget */}
          <div className="rounded-xl border border-slate-100 bg-white p-4.5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-extrabold text-[10px] text-slate-400 font-mono uppercase tracking-widest">
                Active Deck Progress
              </h4>
              <button
                onClick={resetProgress}
                className="text-[10px] font-black font-mono text-indigo-600 hover:text-indigo-800 flex items-center gap-1 uppercase transition"
                title="Reset review states"
              >
                <RotateCcw className="h-3 w-3" /> Reset Stat
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-emerald-50 border border-emerald-100/50 p-2.5 rounded-xl">
                  <span className="block text-[8px] font-bold text-emerald-600 font-mono uppercase">Mastered</span>
                  <span className="text-base font-black text-emerald-950 font-mono mt-0.5 block">{masteredCount}</span>
                </div>
                <div className="bg-amber-50 border border-amber-100/50 p-2.5 rounded-xl">
                  <span className="block text-[8px] font-bold text-amber-600 font-mono uppercase">Review Pile</span>
                  <span className="text-base font-black text-amber-950 font-mono mt-0.5 block">{reviewCount}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 font-mono">
                  <span>MASTERY DEGREE</span>
                  <span>{masteryPercentage}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-indigo-600 transition-all duration-300"
                    style={{ width: `${masteryPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button: Create Custom Term card */}
        <button
          onClick={() => setShowForm(!showForm)}
          className="w-full py-2.5 bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 border border-slate-200/50 cursor-pointer"
        >
          <Plus className="h-4 w-4 text-slate-500 shrink-0" />
          {showForm ? "Close Drawer" : "Create Custom Flashcard"}
        </button>
      </div>

      {/* 2. Middle Interactive Flashcard Panel */}
      <div className="lg:col-span-8 flex flex-col space-y-4">
        {showForm ? (
          <form onSubmit={handleCreateCard} className="bg-white border border-slate-150 rounded-2xl p-6 shadow-md space-y-4 animate-fade-in">
            <div className="border-b border-slate-50 pb-3">
              <h4 className="font-extrabold text-sm text-slate-900">Create Custom Study Terminology</h4>
              <p className="text-xs text-slate-500 mt-1">Append your own technical definitions, code structures, or research vectors.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1.5">Target Topic Deck</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Frontend Architecture">Frontend Architecture</option>
                  <option value="Algorithms & DS">Algorithms & DS</option>
                  <option value="System Design & Backend">System Design & Backend</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono mb-1.5">Interview Difficulty</label>
                <select
                  value={newDifficulty}
                  onChange={(e) => setNewDifficulty(e.target.value as "Easy" | "Medium" | "Hard")}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="Easy">Easy Level</option>
                  <option value="Medium">Medium Level</option>
                  <option value="Hard">Hard Level (System Architect)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono">Concept Question / Title</label>
              <textarea
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                placeholder="e.g. Describe difference between symmetric and asymmetric encryption"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none h-16 resize-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] uppercase font-bold text-slate-400 font-mono">Detailed Solution Explanation</label>
              <textarea
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                placeholder="State deep details, core mechanisms, runtime constraints, and trade-offs..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none h-24 resize-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2 border-t border-slate-50">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/10"
              >
                Save Flashcard
              </button>
            </div>
          </form>
        ) : totalInFiltered === 0 ? (
          <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center space-y-4 shadow-sm flex flex-col items-center justify-center min-h-[360px]">
            <div className="h-12 w-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100">
              <BookOpen className="h-6 w-6 text-slate-400" />
            </div>
            <div className="space-y-1">
              <h5 className="font-bold text-slate-900 text-base">This Selection Is Empty</h5>
              <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                No technical terms are active. Create a custom terminology card or switch category decks on the left parameters panel.
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-extrabold shadow"
            >
              Add One Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* The Flashcard Object container */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className={`relative cursor-pointer transition-all duration-500 min-h-[280px] w-full rounded-2xl border bg-white shadow-sm flex flex-col justify-between p-6 select-none overflow-hidden ${
                isFlipped 
                  ? "border-indigo-100 shadow-indigo-50/70 shadow-lg ring-1 ring-indigo-50" 
                  : "border-slate-150 hover:border-slate-350"
              }`}
            >
              {/* Card top banner with metrics */}
              <div className="flex items-center justify-between border-b border-slate-50/80 pb-3 h-8">
                <span className="text-[9px] font-mono font-black text-indigo-500 uppercase tracking-widest">
                  {activeCard.category}
                </span>

                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-black uppercase font-mono px-2 py-0.5 rounded ${
                    activeCard.difficulty === "Easy" ? "bg-emerald-50 text-emerald-600" :
                    activeCard.difficulty === "Medium" ? "bg-indigo-50 text-indigo-600" :
                    "bg-rose-50 text-rose-600"
                  }`}>
                    {activeCard.difficulty}
                  </span>

                  {activeCard.userStatus === "mastered" && (
                    <span className="text-[8px] font-black uppercase font-mono px-2 py-0.5 rounded bg-emerald-500 text-white">
                      ✓ Mastered
                    </span>
                  )}

                  {activeCard.userStatus === "needs-review" && (
                    <span className="text-[8px] font-black uppercase font-mono px-2 py-0.5 rounded bg-amber-500 text-white animate-pulse">
                      ✎ Review
                    </span>
                  )}
                </div>
              </div>

              {/* Card Main Body */}
              <div className="py-8 flex flex-col items-center justify-center text-center flex-1 space-y-4 px-2 sm:px-6">
                {!isFlipped ? (
                  // Front (Question)
                  <div className="space-y-2">
                    <span className="mx-auto h-8 w-8 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-2">
                      <HelpCircle className="h-4.5 w-4.5 text-slate-400" />
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base leading-tight select-text">
                      {activeCard.question}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-mono uppercase tracking-widest pt-2">
                      Click anywhere on card to flip & reveal response
                    </p>
                  </div>
                ) : (
                  // Back (Answer)
                  <div className="space-y-2 text-left w-full select-text animate-fade-in">
                    <span className="text-[9px] font-mono font-bold text-slate-400 uppercase tracking-widest block border-b border-slate-50 pb-1 mb-2">
                      Solution blueprint answer:
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium font-sans">
                      {activeCard.answer}
                    </p>
                  </div>
                )}
              </div>

              {/* Card Footer instructions */}
              <div className="flex items-center justify-between border-t border-slate-50/80 pt-3 text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                <span>CARD {currentIndex + 1} OF {totalInFiltered}</span>
                <span className="flex items-center gap-1">
                  {isFlipped ? (
                    <>
                      <EyeOff className="h-3 w-3 text-slate-400" /> TAP TO SHOW QUESTION
                    </>
                  ) : (
                    <>
                      <Eye className="h-3 w-3 text-slate-400" /> TAP TO SPELL ANSWER
                    </>
                  )}
                </span>
              </div>
            </div>

            {/* Pagination & Status markers row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Pagination arrows */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="p-2 border border-slate-200/80 rounded-xl hover:bg-slate-50 bg-white text-slate-600 transition shadow-sm"
                  title="Previous card"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs font-mono font-bold text-slate-600 bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-xl">
                  {currentIndex + 1} / {totalInFiltered}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="p-2 border border-slate-200/80 rounded-xl hover:bg-slate-50 bg-white text-slate-600 transition shadow-sm"
                  title="Next card"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Assessment reviews state modifier */}
              {isFlipped && (
                <div className="flex items-center gap-2 animate-fade-in animate-duration-150">
                  <button
                    type="button"
                    onClick={() => markStatus("needs-review")}
                    className="py-2 px-4 rounded-xl border border-amber-200 bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 text-xs font-bold font-sans transition shadow-sm"
                  >
                    ✎ Need Review
                  </button>
                  <button
                    type="button"
                    onClick={() => markStatus("mastered")}
                    className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold font-sans transition flex items-center gap-1 shadow-lg shadow-emerald-600/10"
                  >
                    <CheckCircle className="h-4 w-4" /> Got It! ({xpClaimedList[activeCard.id] ? "Saved" : `+${activeCard.difficulty === "Easy" ? 10 : activeCard.difficulty === "Medium" ? 20 : 35} XP`})
                  </button>
                </div>
              )}

              {/* Custom deletor for added cards */}
              {activeCard.id.startsWith("custom-") && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteCard(activeCard.id);
                  }}
                  className="text-xs text-rose-500 hover:text-rose-700 font-bold tracking-tight bg-rose-50 hover:bg-rose-100 p-2 rounded-xl transition"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            {/* Explanatory tips card */}
            <div className="p-4 bg-indigo-50/40 rounded-2xl border border-indigo-100/30 flex items-start gap-3">
              <span className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-500 shrink-0">
                <Zap className="h-4 w-4" />
              </span>
              <div className="space-y-0.5">
                <h5 className="text-[11px] font-black text-indigo-900 uppercase font-mono tracking-wider">
                  The Spaced Repetition Formula
                </h5>
                <p className="text-[11px] text-slate-600 leading-normal">
                  Toggle <strong>"Got It!"</strong> on questions you confidently explain without clicking, or <strong>"Need Review"</strong> on complex patterns. Master cards to trigger high-fidelity XP boosts and complete your mock portfolio setup!
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
