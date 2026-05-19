import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// Particle component for neural mesh
function Particle({ delay, x, y, size, duration, color }) {
  return (
    <motion.div
      className="absolute rounded-full"
      style={{
        width: size,
        height: size,
        left: `${x}%`,
        top: `${y}%`,
        background: color,
        filter: `blur(${size > 3 ? 1 : 0}px)`,
      }}
      animate={{
        y: [0, -30, 10, -20, 0],
        x: [0, 15, -10, 5, 0],
        opacity: [0, 0.8, 0.4, 0.7, 0],
        scale: [0.5, 1, 0.8, 1.1, 0.5],
      }}
      transition={{
        duration: duration,
        delay: delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

// Floating connection line between two points
function ConnectionLine({ x1, y1, x2, y2, delay }) {
  return (
    <motion.line
      x1={`${x1}%`}
      y1={`${y1}%`}
      x2={`${x2}%`}
      y2={`${y2}%`}
      stroke="rgba(0, 245, 212, 0.08)"
      strokeWidth="1"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: [0, 0.15, 0.05, 0.12, 0] }}
      transition={{
        duration: 8,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    />
  );
}

export function NeuralBackground() {
  // Generate particles
  const particles = Array.from({ length: 35 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    delay: Math.random() * 5,
    duration: 8 + Math.random() * 12,
    color: i % 3 === 0
      ? "rgba(0, 245, 212, 0.6)"
      : i % 3 === 1
        ? "rgba(56, 189, 248, 0.5)"
        : "rgba(255, 138, 0, 0.4)",
  }));

  // Generate connection lines between nearby particles
  const connections = [];
  for (let i = 0; i < 12; i++) {
    const p1 = particles[Math.floor(Math.random() * particles.length)];
    const p2 = particles[Math.floor(Math.random() * particles.length)];
    if (p1.id !== p2.id) {
      connections.push({
        id: `conn-${i}`,
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
        delay: Math.random() * 6,
      });
    }
  }

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
      {/* Layer 1: Deep gradient base */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(7, 17, 34, 1) 0%, rgba(5, 8, 22, 1) 100%)",
        }}
      />

      {/* Layer 2: Large teal ambient glow */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "60vw",
          height: "60vw",
          maxWidth: "900px",
          maxHeight: "900px",
          left: "15%",
          top: "-15%",
          background:
            "radial-gradient(circle, rgba(0, 245, 212, 0.07) 0%, transparent 70%)",
          filter: "blur(80px)",
        }}
        animate={{
          x: [0, 40, -20, 0],
          y: [0, 20, -10, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Layer 3: Orange neural flare */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "50vw",
          height: "50vw",
          maxWidth: "700px",
          maxHeight: "700px",
          right: "-5%",
          bottom: "-10%",
          background:
            "radial-gradient(circle, rgba(255, 138, 0, 0.05) 0%, transparent 70%)",
          filter: "blur(100px)",
        }}
        animate={{
          x: [0, -30, 20, 0],
          y: [0, -25, 15, 0],
          opacity: [0.5, 0.8, 0.4, 0.5],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Layer 4: Electric blue accent */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "40vw",
          height: "40vw",
          maxWidth: "600px",
          maxHeight: "600px",
          left: "50%",
          top: "40%",
          transform: "translate(-50%, -50%)",
          background:
            "radial-gradient(circle, rgba(56, 189, 248, 0.04) 0%, transparent 70%)",
          filter: "blur(120px)",
        }}
        animate={{
          scale: [1, 1.2, 0.9, 1],
          opacity: [0.3, 0.6, 0.2, 0.3],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Layer 5: Neural particle mesh */}
      <div className="absolute inset-0">
        {particles.map((p) => (
          <Particle key={p.id} {...p} />
        ))}

        {/* SVG connection lines */}
        <svg className="absolute inset-0 w-full h-full">
          {connections.map((c) => (
            <ConnectionLine key={c.id} {...c} />
          ))}
        </svg>
      </div>

      {/* Layer 6: Cinematic noise texture */}
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "200px 200px",
        }}
      />

      {/* Layer 7: Subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 50%, transparent 0%, rgba(5, 8, 22, 0.4) 100%)",
        }}
      />
    </div>
  );
}
