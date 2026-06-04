import { Course, CodeChallenge, ProjectLab, JobItem, QuizQuestion } from "./types";

export const initialCourses: Course[] = [
  {
    id: "c1",
    category: "Frontend Development",
    title: "Mastering React 19 & Tailwind v4",
    description: "Learn state synchronization, concurrent rendering features, functional clean architectures, and modern Tailwind layouts.",
    thumbnail: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=60",
    xpReward: 350,
    modules: [
      {
        id: "m1_1",
        title: "Module 1: React 19 Ecosystem & Hooks",
        lessons: [
          {
            id: "l1",
            title: "Lesson 1: Introduction to React 19 Core States",
            duration: "12 mins",
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            topic: "React hooks state management",
          },
          {
            id: "l2",
            title: "Lesson 2: Optimizing Render Loops with useMemo & Refs",
            duration: "18 mins",
            videoUrl: "https://www.w3schools.com/html/movie.mp4",
            topic: "Optimizing render loops",
          }
        ]
      },
      {
        id: "m1_2",
        title: "Module 2: Advanced Tailwind CSS Layouting & Rhythms",
        lessons: [
          {
            id: "l3",
            title: "Lesson 3: Custom Theme Rules and Dynamic Clamping",
            duration: "15 mins",
            pdfUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            topic: "Dynamic Tailwind styling",
          }
        ]
      }
    ]
  },
  {
    id: "c2",
    category: "Backend Development",
    title: "High Performance RESTful APIs with Node & Express",
    description: "Master server design, lazy SDK initialization, security headers, database isolation levels, and Redis caching.",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60",
    xpReward: 500,
    modules: [
      {
        id: "m2_1",
        title: "Module 1: Server Initialization & Middleware Design",
        lessons: [
          {
            id: "l4",
            title: "Lesson 1: Setting up robust Express routing",
            duration: "20 mins",
            videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4",
            topic: "Express routing and server architecture",
          },
          {
            id: "l5",
            title: "Lesson 2: Security principles and CORS constraints",
            duration: "14 mins",
            topic: "Web security headers",
          }
        ]
      }
    ]
  },
  {
    id: "c3",
    category: "Data Structures & Algos",
    title: "Algorithms & Logic Mastery",
    description: "Crack the FAANG screening by learning how to tackle complex list operations, trees, graphs, and dynamically optimized variables.",
    thumbnail: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format&fit=crop&q=60",
    xpReward: 600,
    modules: [
      {
        id: "m3_1",
        title: "Module 1: List Implementations & Stacks",
        lessons: [
          {
            id: "l6",
            title: "Lesson 1: Two Pointer Techniques and Sliding Windows",
            duration: "25 mins",
            topic: "Optimized complex searching arrays",
          }
        ]
      }
    ]
  }
];

export const mockChallenges: CodeChallenge[] = [
  {
    id: "challenge-1",
    title: "1. Two Sum Target Index Finder",
    difficulty: "Easy",
    category: "Arrays",
    problem: "Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    hint: "Use a hashmap (or object dictionary) to store complements (target - current_num) as you iterate. This reduces the search to O(N) complexity instead of standard nested loops.",
    initialCode: {
      javascript: `function twoSum(nums, target) {\n  // Write your code here\n  const lookup = {};\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (complement in lookup) {\n      return [lookup[complement], i];\n    }\n    lookup[nums[i]] = i;\n  }\n  return [];\n}`,
      python: `def two_sum(nums, target):\n    # Write your code here\n    lookup = {}\n    for i, num in enumerate(nums):\n        comp = target - num\n        if comp in lookup:\n            return [lookup[comp], i]\n        lookup[num] = i\n    return []`
    },
    testCases: [
      { input: "[2, 7, 11, 15], target = 9", output: "[0, 1]" },
      { input: "[3, 2, 4], target = 6", output: "[1, 2]" }
    ]
  },
  {
    id: "challenge-2",
    title: "2. Reverse a Singly Linked List",
    difficulty: "Medium",
    category: "Linked Lists",
    problem: "Given the head of a singly linked list, reverse the list and return its new head node.\n\n*Example*:\nInput: head = [1, 2, 3, 4, 5]\nOutput: [5, 4, 3, 2, 1]",
    hint: "Maintain three pointer markers dynamically: 'prev' (initialized to null), 'current' (at the head), and 'next' (to preserve the forward link before swapping current.next).",
    initialCode: {
      javascript: `function reverseList(head) {\n  // Write your code here\n  let prev = null;\n  let current = head;\n  while (current) {\n    let nextTemp = current.next;\n    current.next = prev;\n    prev = current;\n    current = nextTemp;\n  }\n  return prev;\n}`,
      python: `def reverse_list(head):\n    # Write your code here\n    prev = None\n    current = head\n    while current:\n        next_temp = current.next\n        current.next = prev\n        prev = current\n        current = next_temp\n    return prev`
    },
    testCases: [
      { input: "[1, 2, 3, 4, 5]", output: "[5, 4, 3, 2, 1]" }
    ]
  },
  {
    id: "challenge-3",
    title: "3. Longest Substring Without Repeating Characters",
    difficulty: "Hard",
    category: "Strings & Sliding Window",
    problem: "Given a string `s`, find the length of the longest substring without repeating characters.\n\n*Example*:\nInput: s = \"abcabcbb\"\nOutput: 3 (because \"abc\" length is 3)",
    hint: "Use a sliding window with left and right indices. Keep a Set of characters. Slide the left edge whenever a duplicate is found at the right edge.",
    initialCode: {
      javascript: `function lengthOfLongestSubstring(s) {\n  // Write your code here\n  let set = new Set();\n  let left = 0, maxLength = 0;\n  for (let right = 0; right < s.length; right++) {\n    while (set.has(s[right])) {\n      set.delete(s[left]);\n      left++;\n    }\n    set.add(s[right]);\n    maxLength = Math.max(maxLength, right - left + 1);\n  }\n  return maxLength;\n}`,
      python: `def length_of_longest_substring(s):\n    # Write your code here\n    char_set = set()\n    left = 0\n    max_len = 0\n    for right in range(len(s)):\n        while s[right] in char_set:\n            char_set.remove(s[left])\n            left += 1\n        char_set.add(s[right])\n        max_len = max(max_len, right - left + 1)\n    return max_len`
    },
    testCases: [
      { input: "'abcabcbb'", output: "3" },
      { input: "'bbbbb'", output: "1" }
    ]
  }
];

export const initialQuizzes: QuizQuestion[] = [
  {
    id: "quiz-1",
    question: "Which of the following is NOT a hook introduced in React?",
    options: ["useActionState", "useEffect", "useNamespace", "useTransition"],
    answer: 2,
    explanation: "`useNamespace` is not a React hook. React 19 introduced several concurrent hooks, but namespace scoping is handled natively via JS modules."
  },
  {
    id: "quiz-2",
    question: "Under standard SQL isolation levels, which level completely prevents Dirty Reads, Non-repeatable Reads, and Phantom Reads?",
    options: ["Read Committed", "Repeatable Read", "Serializable", "Read Uncommitted"],
    answer: 2,
    explanation: "`Serializable` isolation locks key tables across transaction boundaries, entirely safeguarding against phantoms and non-repeatables, but at the cost of higher query locks."
  },
  {
    id: "quiz-3",
    question: "What is the primary role of Redis inside a custom full-stack web API architecture?",
    options: ["Serving static compilation files", "Storing long-term structural schemas", "Caching heavy DB query responses & serving queues", "Hosting Node runtime scripts"],
    answer: 2,
    explanation: "Redis is an in-memory key-value database, optimized for near zero-latency cache retrievals, sub-second queues, and ephemeral sessions."
  }
];

export const projectLabs: ProjectLab[] = [
  {
    id: "lab-1",
    title: "1. Advanced Dynamic Calculator App",
    difficulty: "Beginner",
    description: "Build a single-screen responsive mathematical solver which persists your formula log and shows instant previews.",
    tasks: [
      "Implement a clean grid layout for numerals and binary operators",
      "Include a memory store panel (M+, M-, MR) which utilizes standard local storage",
      "Handle divide-by-zero errors gracefully with a friendly message"
    ],
    learningObjectives: ["React state handlers", "CSS Grid placement", "Strict error boundaries"]
  },
  {
    id: "lab-2",
    title: "2. Real-time CRM & Leads Board",
    difficulty: "Intermediate",
    description: "Design a full leads tracking CRM pipeline containing columns like New, Contacted, Under Review, and Won, using beautiful Kanban drag feedback.",
    tasks: [
      "Create columns holding lead cards with contacts and deal sizes",
      "Implement a search bar prioritizing results by deal size and contact creation dates",
      "Add a quick form modal to append new leads on-the-fly"
    ],
    learningObjectives: ["Drag & drop states", "Array filters & search optimizations", "Interactive modals"]
  },
  {
    id: "lab-3",
    title: "3. Pet Management & Veterinary Care Portal",
    difficulty: "Advanced",
    description: "Develop a robust portal to schedule clinics, track vaccine statuses, and request prescriptions with automated reminders.",
    tasks: [
      "Construct a dynamic pet registry supporting image uploads (or avatars) and basic descriptions",
      "Incorporate an appointment booking calendar showing available time-slots",
      "Establish active indicator bars showing upcoming vaccine alerts"
    ],
    learningObjectives: ["Advanced structured objects state", "Time scheduling validators", "Complex UI indicators"]
  }
];

export const mockJobsList: JobItem[] = [
  {
    id: "job-1",
    company: "Google",
    logo: "https://images.unsplash.com/photo-1573804633927-bfcbcd909acd?w=100&auto=format&fit=crop&q=60",
    role: "Frontend Developer Intern",
    salary: "₹45,000 / month",
    location: "Bangalore, India (Hybrid)",
    type: "Internship",
    requirements: [
      "Excellent mastery over HTML5, CSS3, modern JavaScript (ES6+)",
      "Strong conceptual grasp of React components lifecycle and state syncing",
      "Familiarity with Tailwind CSS & Responsive breakpoints coding"
    ]
  },
  {
    id: "job-2",
    company: "Stripe",
    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60",
    role: "Junior Software Engineer - APIs",
    salary: "₹1,200,000 / year",
    location: "Remote (India)",
    type: "Full-Time",
    requirements: [
      "Proficient backend development in Node.js, Express, or Python frameworks",
      "Basic understanding of SQL queries and key database structures",
      "Experience interacting with REST client APIs & third party services integrations"
    ]
  },
  {
    id: "job-3",
    company: "Meta",
    logo: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=100&auto=format&fit=crop&q=60",
    role: "React Native Mobile Developer",
    salary: "₹1,800,000 / year",
    location: "Hyderabad, India (In-Office)",
    type: "Full-Time",
    requirements: [
      "1+ years launching performant cross-platform React Native layouts",
      "Solid understanding of standard Redux Toolkit or Recoil global states",
      "Excellent skill optimizing bridge bottlenecks & asset image sizes"
    ]
  },
  {
    id: "job-4",
    company: "Sarvam AI",
    logo: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=100&auto=format&fit=crop&q=60",
    role: "AI Engineering Associate",
    salary: "₹1,500,000 / year",
    location: "Bangalore, India",
    type: "Full-Time",
    requirements: [
      "Basic logic fine-tuning or prompting LLMs (GPT, Gemini, Llama)",
      "Strong Python core algorithms and FastAPI server logic building",
      "Familiarity with Vector databases (Pinecone, Chroma, pgvector)"
    ]
  }
];
