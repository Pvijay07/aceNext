import React, { useState, useEffect } from "react";
import { Vote, Users, HelpCircle, Check, AlertCircle, Sparkles, RefreshCw, BarChart2, BookOpen } from "lucide-react";

interface PollQuestion {
  id: string;
  dayIndex: number; // For rotating daily
  question: string;
  options: string[];
  correctIndex: number;
  initialCounts: number[]; // Community weights
  explanation: string;
}

const POLLS: PollQuestion[] = [
  {
    id: "poll-1",
    dayIndex: 1,
    question: "Under what condition does a child component avoid re-rendering when its parent state updates in React?",
    options: [
      "By placing a useEffect with an empty dependency array in the child component",
      "By wrapping the child component inside React.memo() or using useMemo helper",
      "By declaring the child component dynamically inside the parent render body",
      "By returning false inside the child's standard hook dependencies array"
    ],
    correctIndex: 1,
    initialCounts: [120, 485, 45, 18],
    explanation: "React.memo is a higher-order component that shallowly compares props. If the props haven't changed, React skips rendering the child, bypassing the reconciliation process. Declaring a component *inside* another parent actually destroys and recreates it on every render, causing slow mounts."
  },
  {
    id: "poll-2",
    dayIndex: 2,
    question: "In system design, what does 'Partition Tolerance' (P in CAP Theorem) specifically imply?",
    options: [
      "The network must process and distribute 100% of messages without latency drops",
      "The distributed architecture continues to operate despite arbitrary communication failure or packet drops",
      "All active system database writes are committed to physical local partitions immediately",
      "All partition tables are duplicated synchronously on at least 3 distributed master database nodes"
    ],
    correctIndex: 1,
    initialCounts: [56, 394, 82, 38],
    explanation: "Partition Tolerance guarantees the distributed cluster continues to handle requests despite networks dropping or delaying packages between physical system nodes. In real-world systems, network communication breakdowns are inevitable, forcing a choice between Consistency (C) and Availability (A)."
  },
  {
    id: "poll-3",
    dayIndex: 3,
    question: "Which of the following describes the average-case runtime complexity of looking up a value in a self-balancing binary search tree (like a Red-Black Tree) containing N elements?",
    options: [
      "O(1)",
      "O(log N)",
      "O(N)",
      "O(N log N)"
    ],
    correctIndex: 1,
    initialCounts: [45, 512, 115, 30],
    explanation: "Because self-balancing binary trees maintain a uniform tree height proportional to the logarithm of the nodes count, lookup, insertion, and deletion operations are guaranteed to run in O(log N) time, preventing the tree from degrading into a skewed linear structure."
  },
  {
    id: "poll-4",
    dayIndex: 4,
    question: "What is the primary difference between a Process and a Thread in modern operating systems?",
    options: [
      "A process represents a lighter execution context that shares its parent thread's call stack",
      "Threads run entirely isolated in their own physical hardware registers, while processes share cache",
      "A process possesses its own independent memory workspace, whereas threads share their parent process's memory space",
      "Threads are scheduled directly by network card firmware, while processes are handled by CPU drivers"
    ],
    correctIndex: 2,
    initialCounts: [78, 62, 451, 14],
    explanation: "Processes have their own dedicated virtual address space, file handlers, and system resources. Threads are spawned within a process and share its address space, making thread-to-thread communication extremely lightweight, though susceptible to memory state race conditions."
  },
  {
    id: "poll-5",
    dayIndex: 5,
    question: "Which of the following database operations guarantees a transaction is isolated and ACID compliant even during parallel concurrent executions?",
    options: [
      "Writing regular background backups to distributed object stores",
      "Enforcing strict database constraints like Foreign Key relationships",
      "Employing lock modes (pessimistic / optimistic) and serializable isolation levels",
      "Pre-compiling storage procedures to skip transaction planning steps"
    ],
    correctIndex: 2,
    initialCounts: [48, 112, 385, 32],
    explanation: "Isolation (the 'I' in ACID) ensures that concurrent transactions do not interfere with each other or leak partial intermediate states. This is implemented via dynamic locks or multi-version concurrency control (MVCC) yielding serializeable execution profiles."
  }
];

interface QuickPollProps {
  onTrackXp: (xp: number) => void;
}

export default function QuickPoll({ onTrackXp }: QuickPollProps) {
  // Rotate poll question based on day index safely
  const todayDate = new Date();
  const dayOfMonth = todayDate.getDate();
  const activePollIndex = (dayOfMonth - 1) % POLLS.length;
  const poll = POLLS[activePollIndex];

  const localStorageVoteKey = `quick_poll_vote_state_${poll.id}`;
  const localStorageCountsKey = `quick_poll_counts_${poll.id}`;

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasVoted, setHasVoted] = useState<boolean>(false);
  const [voteCounts, setVoteCounts] = useState<number[]>(poll.initialCounts);
  const [userVoteIdx, setUserVoteIdx] = useState<number | null>(null);

  // Load vote states
  useEffect(() => {
    const savedVote = localStorage.getItem(localStorageVoteKey);
    const savedCounts = localStorage.getItem(localStorageCountsKey);

    if (savedVote !== null) {
      setHasVoted(true);
      const parsedVoteIdx = parseInt(savedVote, 10);
      setUserVoteIdx(parsedVoteIdx);
      setSelectedOption(parsedVoteIdx);
    } else {
      setHasVoted(false);
      setUserVoteIdx(null);
      setSelectedOption(null);
    }

    if (savedCounts) {
      try {
        setVoteCounts(JSON.parse(savedCounts));
      } catch (e) {
        setVoteCounts(poll.initialCounts);
      }
    } else {
      setVoteCounts(poll.initialCounts);
    }
  }, [poll.id, localStorageVoteKey, localStorageCountsKey]);

  // Cast vote
  const handleVoteSubmit = () => {
    if (selectedOption === null || hasVoted) return;

    // Increment selected index
    const nextCounts = [...voteCounts];
    nextCounts[selectedOption] = (nextCounts[selectedOption] || 0) + 1;

    setVoteCounts(nextCounts);
    setHasVoted(true);
    setUserVoteIdx(selectedOption);

    localStorage.setItem(localStorageVoteKey, String(selectedOption));
    localStorage.setItem(localStorageCountsKey, JSON.stringify(nextCounts));

    // Evaluate accuracy and reward XP
    const isCorrect = selectedOption === poll.correctIndex;
    const gXP = isCorrect ? 30 : 10;
    
    // Increment global XP
    onTrackXp(gXP);

    // Launch celebratory toast
    window.dispatchEvent(
      new CustomEvent("celebrate_achievement", {
        detail: {
          title: isCorrect ? "Poll Answer Correct! 🎯" : "Daily Poll Submited! 🗳️",
          subtitle: isCorrect 
            ? `Fantastic! You answered correctly and gained +30 XP boost!` 
            : `Thanks for participating! You gained +10 XP and unlocked community insights.`,
          type: "score",
        },
      })
    );
  };

  // Skip options list and reset just for demo testing purposes
  const handleResetPollForTesting = () => {
    localStorage.removeItem(localStorageVoteKey);
    localStorage.removeItem(localStorageCountsKey);
    setHasVoted(false);
    setSelectedOption(null);
    setUserVoteIdx(null);
    setVoteCounts(poll.initialCounts);
  };

  const totalVotes = voteCounts.reduce((total, count) => total + count, 0);

  return (
    <div id="quick-poll-widget" className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm space-y-4">
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-slate-50 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100/50">
            <Vote className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[9px] font-extrabold text-indigo-600 font-mono uppercase tracking-widest block">
              Daily Brain Teaser
            </span>
            <h4 className="font-bold text-slate-900 text-xs">Technical Skill-Check</h4>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <Users className="h-3.5 w-3.5 shrink-0" />
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
            {totalVotes} Votes Cast
          </span>
        </div>
      </div>

      {/* Question context */}
      <div className="space-y-3">
        <div className="flex items-start gap-2.5">
          <HelpCircle className="h-4 w-4 text-indigo-400 mt-0.5 shrink-0" />
          <p className="text-xs font-bold text-slate-800 leading-relaxed font-sans">
            {poll.question}
          </p>
        </div>

        {/* Dynamic List Container (Cast state vs Result state) */}
        {!hasVoted ? (
          <div className="space-y-2 pt-1 font-sans">
            {poll.options.map((opt, idx) => {
              const matchesSelected = selectedOption === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full text-left p-3 rounded-xl border text-xs font-medium leading-normal transition-all flex items-start gap-2.5 cursor-pointer ${
                    matchesSelected
                      ? "bg-indigo-50 border-indigo-400 text-indigo-950 font-bold shadow-sm"
                      : "bg-slate-50 hover:bg-slate-100/70 border-slate-150 text-slate-600"
                  }`}
                >
                  <span className={`h-4.5 w-4.5 rounded-full border shrink-0 flex items-center justify-center text-[10px] uppercase font-mono font-bold ${
                    matchesSelected
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "bg-white border-slate-300 text-slate-400"
                  }`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1 mt-0.5">{opt}</span>
                </button>
              );
            })}

            {/* CTA action trigger */}
            <div className="pt-2 flex items-center justify-between gap-2.5">
              <span className="text-[9px] text-slate-400 font-mono font-medium leading-none">
                🧠 Correct response values reward +30 XP
              </span>
              <button
                type="button"
                onClick={handleVoteSubmit}
                disabled={selectedOption === null}
                className="px-4.5 py-1.5 rounded-lg bg-slate-900 border-transparent hover:bg-slate-800 text-white text-xs font-bold font-sans tracking-tight transition disabled:opacity-40"
              >
                Submit Vote
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3.5 pt-1 animate-fade-in font-sans">
            {poll.options.map((opt, idx) => {
              const count = voteCounts[idx] || 0;
              const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
              const isCorrectTarget = idx === poll.correctIndex;
              const wasUserChoice = idx === userVoteIdx;

              return (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-medium leading-snug">
                    <div className="flex items-center gap-1.5 min-w-0 pr-4">
                      {isCorrectTarget ? (
                        <div className="h-4.5 w-4.5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 border border-emerald-600 shadow-sm" title="Correct Answer">
                          <Check className="h-3 w-3 stroke-[3]" />
                        </div>
                      ) : wasUserChoice ? (
                        <div className="h-4.5 w-4.5 rounded-full bg-rose-500 text-white flex items-center justify-center shrink-0 border border-rose-600 shadow-sm" title="Your Choice (Incorrect)">
                          <span className="font-mono text-[9px] font-black">X</span>
                        </div>
                      ) : (
                        <div className="h-4.5 w-4.5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center shrink-0 border border-slate-200">
                          <span className="font-mono text-[9px] font-black">{String.fromCharCode(65 + idx)}</span>
                        </div>
                      )}
                      <span className={`truncate ${isCorrectTarget ? "text-slate-800 font-bold" : "text-slate-500"}`}>
                        {opt}
                      </span>
                    </div>

                    <span className="font-mono text-xs font-bold text-slate-700 shrink-0">
                      {percentage}% <span className="text-[10px] text-slate-400">({count})</span>
                    </span>
                  </div>

                  {/* Visual slider track fill */}
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden relative border border-slate-50">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isCorrectTarget
                          ? "bg-gradient-to-r from-emerald-400 to-emerald-505"
                          : wasUserChoice
                          ? "bg-gradient-to-r from-rose-400 to-rose-500"
                          : "bg-slate-300"
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}

            {/* Concept explanation block */}
            <div className="p-3 bg-indigo-50/40 rounded-xl border border-indigo-100/50 space-y-1.5">
              <div className="flex items-center gap-1.5 text-[9px] text-indigo-700 font-black uppercase font-mono tracking-widest pl-0.5">
                <BookOpen className="h-3.5 w-3.5" />
                <span>Correct logic explanation</span>
              </div>
              <p className="text-[10px] leading-relaxed text-slate-600 font-medium">
                {poll.explanation}
              </p>
            </div>

            {/* Admin control or simulation reset */}
            <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 font-mono uppercase tracking-wide border-t border-slate-50 pt-2.5">
              <span className="flex items-center gap-1 text-emerald-600">
                <Sparkles className="h-3 w-3 text-emerald-600 shrink-0 animate-pulse" /> Live Community Statistics Enabled
              </span>
              <button
                type="button"
                onClick={handleResetPollForTesting}
                className="text-[9px] text-indigo-600 hover:text-indigo-800 font-mono font-bold flex items-center gap-1 uppercase transition cursor-pointer"
                title="Reset simulation"
              >
                <RefreshCw className="h-2.5 w-2.5" /> Reset Vote
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
