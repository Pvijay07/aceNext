import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Trophy, Award, X } from "lucide-react";

interface ConfettiEvent {
  title: string;
  subtitle: string;
  type: "badge" | "score";
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  shape: "circle" | "square" | "triangle";
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export default function ConfettiCelebration() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeCelebration, setActiveCelebration] = useState<ConfettiEvent | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameId = useRef<number | null>(null);

  const colors = [
    "#4f46e5", // indigo-600
    "#06b6d4", // cyan-500
    "#10b981", // emerald-500
    "#f59e0b", // amber-500
    "#ec4899", // pink-500
    "#8b5cf6", // violet-500
    "#ef4444"  // red-500
  ];

  const shapes: ("circle" | "square" | "triangle")[] = ["circle", "square", "triangle"];

  const buildParticles = (width: number, height: number, type: "badge" | "score") => {
    const list: Particle[] = [];
    const count = type === "badge" ? 150 : 80;

    for (let i = 0; i < count; i++) {
      // For badge, launch from bottom-left & bottom-right corners. For score, burst from center
      const fromCenter = type === "score";
      const side = Math.random() > 0.5 ? "left" : "right";

      const x = fromCenter 
        ? width / 2 
        : side === "left" 
          ? 0 
          : width;
          
      const y = fromCenter 
        ? height / 2 - 50 
        : height - 100;

      const angle = fromCenter
        ? Math.random() * Math.PI * 2 // 360 degrees
        : side === "left"
          ? -Math.random() * (Math.PI / 3) - (Math.PI / 12) // angle upwards to the right
          : -Math.random() * (Math.PI / 3) - (Math.PI * 7 / 12); // angle upwards to the left

      const speed = 7 + Math.random() * 12;

      list.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (fromCenter ? 3 : 5), // extra upward boost
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 5 + Math.random() * 8,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        rotation: Math.random() * 360,
        rotationSpeed: -5 + Math.random() * 10,
        opacity: 1
      });
    }
    return list;
  };

  const triggerCelebration = (event: ConfettiEvent) => {
    setActiveCelebration(event);

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Build the set of particles
    const list = buildParticles(canvas.width, canvas.height, event.type);
    particlesRef.current = [...particlesRef.current, ...list];

    // Close floating banner automatically after 4.5 seconds
    setTimeout(() => {
      setActiveCelebration(null);
    }, 4500);
  };

  // Manage resize actions safely using a ResizeObserver to protect aspect ratios
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Listen for global custom event trigger
    const handleGlobalCelebration = (e: Event) => {
      const customEvent = e as CustomEvent<ConfettiEvent>;
      if (customEvent.detail) {
        triggerCelebration(customEvent.detail);
      }
    };

    window.addEventListener("celebrate_achievement", handleGlobalCelebration);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("celebrate_achievement", handleGlobalCelebration);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  // Frame tick renderer loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const list = particlesRef.current;
      for (let i = list.length - 1; i >= 0; i--) {
        const p = list[i];

        // Apply physics
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22; // gravity pull
        p.vx *= 0.98;  // wind resistance
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.008; // gradual fadeout

        // Remove offscreen or fully faded particles
        if (p.opacity <= 0 || p.y > canvas.height + 20) {
          list.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        ctx.beginPath();
        if (p.shape === "circle") {
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.shape === "triangle") {
          ctx.moveTo(0, -p.size / 2);
          ctx.lineTo(p.size / 2, p.size / 2);
          ctx.lineTo(-p.size / 2, p.size / 2);
          ctx.closePath();
          ctx.fill();
        } else {
          // square
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }
        ctx.restore();
      }

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  if (!activeCelebration) {
    return (
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />
    );
  }

  const isBadge = activeCelebration.type === "badge";

  return (
    <>
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-50 w-full h-full"
      />

      {/* Floating Animated Celebratory Toast */}
      <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl shadow-2xl border border-slate-800 p-4 animate-[slide-in_0.4s_cubic-bezier(0.16,1,0.3,1)_forwards] pointer-events-auto">
        <style>{`
          @keyframes slide-in {
            0% { transform: translateY(1.5rem) scale(0.95); opacity: 0; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
          }
        `}</style>
        
        <div className="flex gap-4">
          <div className={`p-3 rounded-xl shrink-0 ${isBadge ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"} flex items-center justify-center h-12 w-12 border border-white/5`}>
            {isBadge ? <Award className="h-6 w-6 stroke-[2]" /> : <Trophy className="h-6 w-6 stroke-[2]" />}
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-1.5">
              <span className={`text-[10px] font-black uppercase font-mono tracking-widest ${isBadge ? "text-amber-400" : "text-emerald-400"}`}>
                {isBadge ? "Achievement Earned" : "Top Assessment Score"}
              </span>
              <Sparkles className="h-3 w-3 text-indigo-400 animate-pulse" />
            </div>
            <h4 className="font-extrabold text-sm text-white mt-1 leading-tight truncate">
              {activeCelebration.title}
            </h4>
            <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
              {activeCelebration.subtitle}
            </p>
          </div>

          <button
            onClick={() => setActiveCelebration(null)}
            className="absolute top-3 right-3 text-slate-500 hover:text-slate-300 p-1 hover:bg-slate-800/80 rounded-lg transition"
            title="Dismiss notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}
