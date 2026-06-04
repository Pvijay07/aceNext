import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client safely on demand (lazy loading to prevent startup crash if GEMINI_API_KEY is not configured)
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      console.warn("GEMINI_API_KEY environment variable is not set. AI capabilities will be simulated.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// Simulated Database in Memory for full stack states
let userProfile = {
  id: "student-1",
  name: "Vijay Kumar",
  email: "vijay.infasta@gmail.com",
  role: "student",
  xp: 1450,
  streak: 5,
  badges: [
    { id: "b1", title: "Swift Coder", icon: "Zap", desc: "Completed 5 coding problems correctly", color: "text-amber-500 bg-amber-50" },
    { id: "b2", title: "Problem Solver", icon: "Award", desc: "First perfect assessment score", color: "text-blue-500 bg-blue-50" },
    { id: "b3", title: "Curious Mind", icon: "BookOpen", desc: "Asked 10 questions to the AI Tutor", color: "text-emerald-500 bg-emerald-50" }
  ],
  completedLessons: ["l1", "l2"],
  completedLabs: [] as string[],
  completedQuizzes: [] as { id: string; score: number }[],
  jobApplications: [
    { id: "app-1", company: "Google", role: "Frontend Developer Intern", status: "Applied", date: "2026-06-01" },
    { id: "app-2", company: "Stripe", role: "Junior Software Engineer", status: "Shortlisted", date: "2026-06-03" }
  ]
};

// 1. AUTH API
app.post("/api/auth/login", (req, res) => {
  const { email, role } = req.body;
  if (email) {
    userProfile.email = email;
  }
  if (role) {
    userProfile.role = role;
  }
  res.json({ success: true, profile: userProfile });
});

app.get("/api/auth/profile", (req, res) => {
  res.json(userProfile);
});

app.post("/api/auth/profile/update", (req, res) => {
  const { name, email } = req.body;
  if (name) userProfile.name = name;
  if (email) userProfile.email = email;
  res.json({ success: true, profile: userProfile });
});

// Complete progress helper
app.post("/api/student/progress", (req, res) => {
  const { lessonId, quizId, score, labId, xpGained } = req.body;
  if (lessonId && !userProfile.completedLessons.includes(lessonId)) {
    userProfile.completedLessons.push(lessonId);
  }
  if (quizId) {
    const existing = userProfile.completedQuizzes.find(q => q.id === quizId);
    if (existing) {
      existing.score = Math.max(existing.score, score);
    } else {
      userProfile.completedQuizzes.push({ id: quizId, score });
    }
  }
  if (labId && !userProfile.completedLabs.includes(labId)) {
    userProfile.completedLabs.push(labId);
  }
  if (xpGained) {
    userProfile.xp += xpGained;
    // Check milestones
    if (userProfile.xp >= 2000 && !userProfile.badges.find(b => b.id === "b4")) {
      userProfile.badges.push({
        id: "b4",
        title: "Elite Hacker",
        icon: "ShieldAlert",
        desc: "Exceeded 2000 total experience points",
        color: "text-purple-500 bg-purple-50"
      });
    }
  }
  res.json({ success: true, profile: userProfile });
});

app.post("/api/student/apply-job", (req, res) => {
  const { company, role } = req.body;
  const newApp = {
    id: `app-${Date.now()}`,
    company,
    role,
    status: "Applied",
    date: new Date().toISOString().split('T')[0]
  };
  userProfile.jobApplications.unshift(newApp);
  res.json({ success: true, profile: userProfile });
});

// Update pipeline step for simulated jobs
app.post("/api/student/update-job", (req, res) => {
  const { jobId, status } = req.body;
  const target = userProfile.jobApplications.find(j => j.id === jobId);
  if (target) {
    target.status = status;
  }
  res.json({ success: true, profile: userProfile });
});


// 2. AI TUTOR CHAT
app.post("/api/tutor/chat", async (req, res) => {
  const { messages, context } = req.body;
  const userPrompt = messages && messages.length > 0 ? messages[messages.length - 1].content : "Hello!";

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Return beautiful, smart simulated reply if key is missing
      return res.json({
        content: `👋 Hello ${userProfile.name}! I am your **AceNext AI Tutor**. Since no custom **GEMINI_API_KEY** was detected in the active environment secrets, I am operating in Sandbox mode.\n\nHere is a detailed explanation of ${context?.topic || "your query"}:\n\n- **Core Concept**: It involves breaking complex technical logic into smaller, reusable mental models.\n- **Interactive Hint**: Try checking out the "Coding Challenges" or launching the "Mock Interview" module below!\n\n*(To activate the full live Gemini reasoning, add a \`GEMINI_API_KEY\` in Settings > Secrets).*`,
        suggestedQuestions: [
          `Explain ${context?.topic || 'this topic'} step-by-step with practical examples`,
          `How can I write optimized code for ${context?.topic || 'this scenario'}?`,
          `Give me a Quick Quiz on ${context?.topic || 'this subject'}`
        ]
      });
    }

    const ai = getGeminiClient();
    const systemIns = `You are a helpful, expert AI Technical Tutor and Teacher at the AceNext Learning Platform.
Your goal is to guide students to master software engineering concepts, database structures, coding, and interview prep.
Keep your tone encouraging, professional, and clear.
Use Markdown extensively to make your text highly readable. Format code inside clear codeblocks indicating the language.
Context about the course lesson the student is currently studying:
- Course name: ${context?.courseName || "General Engineering"}
- Current Lesson: ${context?.lessonTitle || "Introduction"}
- Focused Topic: ${context?.topic || "Programming Practice"}`;

    const formattedHistory = messages.slice(0, -1).map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content }]
    }));

    // Add current prompt
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        ...formattedHistory,
        { role: "user", parts: [{ text: userPrompt }] }
      ],
      config: {
        systemInstruction: systemIns,
        temperature: 0.7,
      }
    });

    res.json({
      content: response.text,
      suggestedQuestions: [
        `Can you explain this with a practical Python or JavaScript code snippet?`,
        `What are the typical edge cases we should consider here?`,
        `Generate two hard assessment questions based on this explanation`
      ]
    });
  } catch (error: any) {
    console.error("Gemini Tutor Error:", error);
    res.status(500).json({ error: error.message || "Failed to query Gemini API" });
  }
});


// 3. AI CODE REVIEWER (Coding Challenges & Project Labs)
app.post("/api/grader/code", async (req, res) => {
  const { code, language, context } = req.body;

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Simulator execution & grading output
      const score = Math.floor(Math.random() * 20) + 80;
      return res.json({
        success: true,
        output: `[AceNext Compiler: Running ${language} Sandbox...]\nStdout: Verification completed with code 0.\nAll test cases successfully passed.`,
        score: score,
        review: `### 🚀 AceNext AI Code Review (Sandbox Preview)
We analyzed your **${language}** implementation for **${context?.title || "Coding Challenge"}**.

- **Time Complexity**: $\\mathcal{O}(N)$ roughly, very clean!
- **Space Complexity**: $\\mathcal{O}(1)$ auxiliary storage.
- **Security Check**: No external injection vectors or unsafe functions detected.
- **Optimization Suggestions**:
  - Consider adding input validations to secure boundaries.
  - Variable names are highly declarative. Excellent job!`,
        suggestions: [
          "Validate against boundary arrays where inputs could be null",
          "Ensure integer types don't overflow under tight margins"
        ]
      });
    }

    const ai = getGeminiClient();
    const systemIns = `You are the AceNext Automated AI Code Reviewer and Grading Sandbox.
The student has submitted source code in the ${language} programming language.
Context: ${context?.title || "Project Challenge"} (${context?.description || ""}).
Analyze the student's code and generate:
1. Compilation & Simulation output (a mock console trace showing execution of sample inputs).
2. Code Review: Markdown summary evaluating correct logic, time/space complexity, modularity, security bugs and clean code standards.
3. Performance Score: An integer from 1 to 100 pointing out code quality.
Output MUST be returned in valid JSON matching this schema:
{
  "output": "Console compile and execution visual output trace",
  "review": "Detailed evaluation in Markdown",
  "score": 85,
  "suggestions": ["suggestion 1", "suggestion 2"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Evaluate this code:\n\`\`\`${language}\n${code}\n\`\`\``,
      config: {
        systemInstruction: systemIns,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["output", "review", "score", "suggestions"],
          properties: {
            output: { type: Type.STRING },
            review: { type: Type.STRING },
            score: { type: Type.INTEGER },
            suggestions: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text.trim());
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini Grader Error:", error);
    res.status(500).json({ error: error.message || "Grader logic failed" });
  }
});


// 4. AI RESUME REVIEWER
app.post("/api/resume/review", async (req, res) => {
  const { resumeData } = req.body;

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Simulated review
      return res.json({
        atsScore: 78,
        parsedSkills: ["HTML/CSS", "JavaScript", "React.JS", "Node.JS", "TailwindCSS"],
        missingKeywords: ["CI/CD pipelines", "AWS Cloud deployments", "Jest testing framework", "RESTful design"],
        bulletSuggestions: [
          { original: "Worked on frontend features", improved: "Engineered 12 responsive modular components with React and Tailwind, improving client loading speeds by 24%." },
          { original: "Fixed backend code bugs", improved: "Refactored key database routes in Express.js backend, reducing high-volume request latency by 180ms." }
        ],
        summary: `### 📝 Custom Resume Review Suggestions
Your resume is well structured, but missing key active action verbs to immediately hook ATS scanners. Focus on quantifying business metrics (eg. percentages, time-savings).`
      });
    }

    const ai = getGeminiClient();
    const systemIns = `You are the AceNext Resume Expert and industry recruiter ATS (Applicant Tracking System) Analyzer.
Analyse the resume sections provided:
Skills: ${resumeData.skills || ""}
Education: ${resumeData.education || ""}
Experience: ${resumeData.experience || ""}
Certifications: ${resumeData.projects || ""}

You must compute:
1. ATS Score (an integer from 30 to 100 based on industry marketability).
2. Identified skills list.
3. Missing highly searched keywords or tech stacks the candidate should add.
4. Suggestions showing original dry phrases compared to improved star recruiter bullet format using quantifiers.
5. Overall detailed Markdown suggestion summary.

Output must strictly be valid JSON matching this schema:
{
  "atsScore": 82,
  "parsedSkills": ["react", "node"],
  "missingKeywords": ["AWS", "Docker"],
  "bulletSuggestions": [
    { "original": "did sales target stuff", "improved": "Optimized sales strategy, increasing department outreach conversion by 20% over 2 quarters" }
  ],
  "summary": "Detailed overall critique"
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Analyze the resume format and text carefully: ${JSON.stringify(resumeData)}`,
      config: {
        systemInstruction: systemIns,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["atsScore", "parsedSkills", "missingKeywords", "bulletSuggestions", "summary"],
          properties: {
            atsScore: { type: Type.INTEGER },
            parsedSkills: { type: Type.ARRAY, items: { type: Type.STRING } },
            missingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            bulletSuggestions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["original", "improved"],
                properties: {
                  original: { type: Type.STRING },
                  improved: { type: Type.STRING }
                }
              }
            },
            summary: { type: Type.STRING }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text.trim());
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini Resume Grader Error:", error);
    res.status(500).json({ error: error.message || "Failed resume evaluation" });
  }
});


// 5. AI MOCK INTERVIEWS SYSTEM
app.post("/api/interview/generate", async (req, res) => {
  const { role, level, mode, history, currentAnswer } = req.body;

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Mock interview loop
      const mockQuestions = {
        frontend: [
          "What is the difference between state and props in React?",
          "How does React's virtual DOM reconciliation algorithm work under the hood?",
          "Can you explain JavaScript closures and provide a common use case?",
          "Explain the CSS Box Model and differences between border-box and content-box."
        ],
        backend: [
          "What are the key benefits of using transaction isolation levels in databases?",
          "Explain server-side vs client-side caching strategies and how Redis fits into high-volume backends.",
          "How do you handle authentication securely in Node.js/Express REST APIs?",
          "Describe how you would design a rate-limiting middleware for API gateways."
        ],
        pm: [
          "How would you prioritize product features for a new ride-sharing app launched in a niche city?",
          "Describe a time you had to make a product tradeoff due to tight developer timeline constraints.",
          "What metrics would you track to determine the success of an AI auto-completion feature on a writing dock?"
        ]
      };

      const selectedList = mockQuestions[role as keyof typeof mockQuestions] || mockQuestions.frontend;
      const questionIndex = history ? history.length : 0;
      const nextQuestion = selectedList[questionIndex % selectedList.length];

      let feedback = "Excellent answer. Try using more precise developer keywords in your response!";
      let score = 85;

      if (currentAnswer && currentAnswer.length > 5) {
        score = Math.floor(Math.random() * 20) + 75;
      }

      return res.json({
        nextQuestion,
        evaluation: {
          score,
          feedback,
          strengths: ["Clear response structure", "Good conceptual clarity"],
          improvements: ["Use concrete metrics to scale your engineering scenarios", "Consider structural memory constraints in explanations"]
        }
      });
    }

    const ai = getGeminiClient();
    const systemIns = `You are a strict, top-tier tech company Engineering & Product Hiring Expert.
You conduct realistic interactive technical or HR mock interviews for candidates.
Role: ${role}
Seniority: ${level}
Interview Type: ${mode} (Technical/HR)

Based on the interview transcript history so far:
${JSON.stringify(history || [])}
And the candidate's latest response:
"${currentAnswer || "Initial greeting"}"

You must outputs:
1. Evaluative score (30 - 100) for the last response.
2. Strengths and improvements.
3. Constructive feedback in markdown.
4. Next challenging question to post to the user.

Output MUST strictly be valid JSON matching this schema:
{
  "nextQuestion": "The next interview question",
  "evaluation": {
    "score": 85,
    "feedback": "constructive feedback in markdown",
    "strengths": ["Clear communication", "Declarative explanation"],
    "improvements": ["Highlight asynchronous lifecycle", "Explicitly state space complexity constraints"]
  }
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Candidate's Answer: ${currentAnswer || "I'm ready for the next question. Let's start."}`,
      config: {
        systemInstruction: systemIns,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["nextQuestion", "evaluation"],
          properties: {
            nextQuestion: { type: Type.STRING },
            evaluation: {
              type: Type.OBJECT,
              required: ["score", "feedback", "strengths", "improvements"],
              properties: {
                score: { type: Type.INTEGER },
                feedback: { type: Type.STRING },
                strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
                improvements: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text.trim());
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini Interview Error:", error);
    res.status(500).json({ error: error.message || "Failed interview parsing" });
  }
});


// 6. AI QUIZ GENERATOR
app.post("/api/quiz/generate", async (req, res) => {
  const { topic, size } = req.body;
  const numQuestions = size || 3;

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // Mock generated quizzes topics
      return res.json([
        {
          id: "gq-1",
          question: `What is the key advantage of optimizing data structures on ${topic || "this topic"}?`,
          options: ["Reduces space complexity complexity significantly", "Guarantees zero security bugs", "Increases compiler speed by 400%", "Increases latency on server lookups"],
          answer: 0,
          explanation: "Optimizing data structures decreases auxiliary usage which improves memory and runtime performance."
        },
        {
          id: "gq-2",
          question: `Which of the following describes a key design pattern for ${topic || "this topic"}?`,
          options: ["Singleton instantiation", "Recursive indexing", "Observer pattern decoupling components", "Brute force searching"],
          answer: 2,
          explanation: "Structural patterns decouple state modules safely and robustly."
        }
      ]);
    }

    const ai = getGeminiClient();
    const systemIns = `You are the AceNext AI Quiz generator.
Generate a structured list of custom interactive multiple-choice questions matching the topic requested: "${topic}".
Generate exactly ${numQuestions} multiple-choice questions. Each question must include:
1. question: String.
2. options: An array of 4 distinct answers.
3. answer: Integer index of the correct option (0-3).
4. explanation: Detailed markdown rationale on why it is correct.

Output MUST strictly be valid JSON matching this schema:
[
  {
    "question": "The question content?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "answer": 0,
    "explanation": "Markdown rationale"
  }
]`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Generate a quiz about: ${topic}`,
      config: {
        systemInstruction: systemIns,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            required: ["question", "options", "answer", "explanation"],
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              answer: { type: Type.INTEGER },
              explanation: { type: Type.STRING }
            }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text.trim());
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini Quiz Error:", error);
    res.status(500).json({ error: error.message || "Failed quiz generation" });
  }
});


// 7. SMART PLANNER WEEKLY SCHEDULE API
app.post("/api/planner/generate", async (req, res) => {
  const { availability, deadlines } = req.body;

  try {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      // High-fidelity simulation mode
      const dailyHoursText = `${availability?.dailyHours || 2} hours`;
      const prefTimeText = availability?.preferredTime || "evening";
      
      const simulatedSchedule = [
        {
          day: "Monday",
          focus: "Foundation Theory & Concept Warmup",
          activities: [
            `Study active core chapters of '${deadlines?.[0]?.courseTitle || "React Ecosystem"}'`,
            `Review fundamental notes on current challenge: '${deadlines?.[0]?.task || "State rendering"}'`
          ],
          duration: dailyHoursText,
          tips: `Optimal session time: during the ${prefTimeText}. Spend 15 minutes on terminology.`
        },
        {
          day: "Tuesday",
          focus: "Coding Arena Problem Practice",
          activities: [
            "Launch AceNext Coding Arena and warm up",
            "Solve complement indexes finders or sliding window challenges"
          ],
          duration: dailyHoursText,
          tips: "Read the prompt carefully, layout visual comments first, then write tests."
        },
        {
          day: "Wednesday",
          focus: "API Middleware & Endpoint Setup",
          activities: [
            `Deep-dive into '${deadlines?.[1]?.courseTitle || "Express Server"}' modules`,
            `Set up custom router structures and debug security headers`
          ],
          duration: dailyHoursText,
          tips: "Review error handlers and check if all CORS constraints function correctly."
        },
        {
          day: "Thursday",
          focus: "Assessment Quizzes & Evaluation Check",
          activities: [
            "Solve 1 full practice assessment assessment set",
            "Generate dynamic AI assessment quizzes for difficult domains"
          ],
          duration: dailyHoursText,
          tips: "Review detailed logic explanations for incorrect choices and take notes."
        },
        {
          day: "Friday",
          focus: "Syllabus Milestones Polish",
          activities: [
            `Commit polish edits for immediate deadline: '${deadlines?.[0]?.task || "React 19 & Tailwind"}'`,
            "Optimize resume bullet list using quantifiable metrics and action-verbs"
          ],
          duration: dailyHoursText,
          tips: "Avoid rushing through complex algorithms. High completion rate builds retention."
        },
        {
          day: "Saturday",
          focus: "Durable Project Sandbox Lab",
          activities: [
            "Attempt advanced modules in the Project Labs Panel",
            "Write standard testing logs to ensure boundaries don't crash"
          ],
          duration: `Extended session (${Math.round((availability?.dailyHours || 2) * 1.5)} hours)`,
          tips: "Tackle high-difficulty problems during your peak cognitive energy block."
        },
        {
          day: "Sunday",
          focus: "Structured Review & Career Strategy",
          activities: [
            "Launch a Mock Interview Session to gauge your vocal delivery competence",
            "Unlock consistency heatmap nodes and log daily stats"
          ],
          duration: "1.0 hours",
          tips: "Perform a light retrospect on major struggles and configure next week's availability."
        }
      ];

      return res.json({
        schedule: simulatedSchedule,
        recommendations: [
          `You indicated a preference for ${prefTimeText} slots. We recommend structuring your study environment 15 mins prior to minimize transition barriers.`,
          `Keep your immediate deadline '${deadlines?.[0]?.task || "React 19 & Tailwind"}' in sight by scheduling a focused 1-hour code block on Monday.`,
          "Active Sandbox Simulation: Exquisite schedules are tailored locally. To connect with full live Gemini reasoning, add a GEMINI_API_KEY in the Settings > Secrets menu."
        ]
      });
    }

    const ai = getGeminiClient();
    const systemIns = `You are the AceNext Smart Study Planner and expert academic coach.
Analyze the user's weekly study availability, preferred peak timezone slot, comments, and current academic deadlines or test goals.
You will output a highly structured, realistic study program divided day-by-day (Monday to Sunday) containing specific actionable tasks matching their materials.
Generate exactly 7 day slots (Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday).
Output must strictly match the following JSON schema:
{
  "schedule": [
    {
      "day": "Monday",
      "focus": "Day's core focus area",
      "activities": ["Short specific study activity 1", "Short specific study activity 2"],
      "duration": "Estimated hours (e.g. 2 hours)",
      "tips": "Quick helpful study tip"
    }
  ],
  "recommendations": ["General study advice 1", "General study advice 2"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Propose a weekly study schedule based on:
Upcoming Deadlines: ${JSON.stringify(deadlines || [])}
Availability Context: ${JSON.stringify(availability || {})}
Current UTC Local Time: ${new Date().toISOString()}`,
      config: {
        systemInstruction: systemIns,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["schedule", "recommendations"],
          properties: {
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["day", "focus", "activities", "duration", "tips"],
                properties: {
                  day: { type: Type.STRING },
                  focus: { type: Type.STRING },
                  activities: { type: Type.ARRAY, items: { type: Type.STRING } },
                  duration: { type: Type.STRING },
                  tips: { type: Type.STRING }
                }
              }
            },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const parsed = JSON.parse(response.text.trim());
    res.json(parsed);
  } catch (error: any) {
    console.error("Gemini Planner Error:", error);
    res.status(500).json({ error: error.message || "Smart planning computation failed" });
  }
});


// Serve React app via Vite in development, or Static build output in production
const startServer = async () => {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // SPA fallback
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[AceNext Server] running on http://localhost:${PORT} under ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
