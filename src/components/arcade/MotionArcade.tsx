import React, { useState, useEffect, useRef } from 'react';
import { MotionState } from '../../types/motion';
import { Gamepad2, Smile, Hand, Trophy, RefreshCw, Zap, Sparkles } from 'lucide-react';

interface MotionArcadeProps {
  motionState: MotionState;
}

interface TargetSphere {
  id: number;
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  color: string;
  points: number;
}

export const MotionArcade: React.FC<MotionArcadeProps> = ({ motionState }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active Arcade Game: Head Pong vs AI OR Hand Ninja Smasher
  const [gameMode, setGameMode] = useState<'head-pong' | 'hand-smasher'>('head-pong');

  const [score, setScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameActive, setGameActive] = useState(false);
  const [statusText, setStatusText] = useState('Select Arcade Game Mode & Press START GAME');

  // Head Pong State
  const pongBallRef = useRef({ x: 300, y: 200, vx: 5, vy: 4, radius: 10 });
  const playerPaddleXRef = useRef(250);
  const aiPaddleXRef = useRef(250);

  // Hand Ninja Smasher State
  const targetsRef = useRef<TargetSphere[]>([]);
  const targetIdRef = useRef(0);

  // Start Game
  const startGame = () => {
    setScore(0);
    setAiScore(0);
    setGameActive(true);
    setStatusText(
      gameMode === 'head-pong'
        ? 'HEAD PONG ACTIVE: Move head Pitch/Yaw left and right to control bottom paddle!'
        : 'HAND SMASHER ACTIVE: Move hand index tip to slice and smash glowing targets!'
    );

    if (gameMode === 'head-pong') {
      pongBallRef.current = { x: 300, y: 200, vx: (Math.random() > 0.5 ? 4 : -4), vy: 4, radius: 10 };
    } else {
      // Spawn initial targets
      targetsRef.current = Array.from({ length: 5 }, (_, i) => ({
        id: ++targetIdRef.current,
        x: Math.random() * 500 + 50,
        y: Math.random() * 250 + 50,
        radius: Math.random() * 15 + 18,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        color: ['#06b6d4', '#ec4899', '#a855f7', '#38bdf8', '#22c55e'][i % 5],
        points: 10,
      }));
    }
  };

  // Main Canvas Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    const width = canvas.width;
    const height = canvas.height;

    const renderLoop = () => {
      ctx.clearRect(0, 0, width, height);

      // Cyber Grid Background
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.4)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 35) {
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 35) {
        ctx.beginPath();
        ctx.moveTo(0, y); ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (gameMode === 'head-pong') {
        // ================= GAME 1: HEAD PONG VS AI =================
        const paddleWidth = 110;
        const paddleHeight = 14;

        // Player paddle driven by Head Yaw (-25° to +25°)
        const yawNorm = (motionState.face.headRotation.yaw + 25) / 50;
        const targetPlayerX = Math.max(
          paddleWidth / 2,
          Math.min(width - paddleWidth / 2, (1 - yawNorm) * width)
        );
        playerPaddleXRef.current += (targetPlayerX - playerPaddleXRef.current) * 0.25;

        // AI paddle tracks ball X
        const targetAiX = pongBallRef.current.x;
        aiPaddleXRef.current += (targetAiX - aiPaddleXRef.current) * 0.08;

        if (gameActive) {
          const ball = pongBallRef.current;
          ball.x += ball.vx;
          ball.y += ball.vy;

          // Wall Collisions
          if (ball.x - ball.radius < 0 || ball.x + ball.radius > width) {
            ball.vx *= -1;
          }

          // Player Bottom Paddle Collision
          const playerY = height - 25;
          if (
            ball.y + ball.radius >= playerY - paddleHeight / 2 &&
            ball.y - ball.radius <= playerY + paddleHeight / 2 &&
            ball.x >= playerPaddleXRef.current - paddleWidth / 2 &&
            ball.x <= playerPaddleXRef.current + paddleWidth / 2
          ) {
            ball.vy = -Math.abs(ball.vy) * 1.05; // Bounce up with speedup
            ball.vx += (Math.random() - 0.5) * 2;
            setScore((s) => s + 1);
          }

          // AI Top Paddle Collision
          const aiY = 25;
          if (
            ball.y - ball.radius <= aiY + paddleHeight / 2 &&
            ball.y + ball.radius >= aiY - paddleHeight / 2 &&
            ball.x >= aiPaddleXRef.current - paddleWidth / 2 &&
            ball.x <= aiPaddleXRef.current + paddleWidth / 2
          ) {
            ball.vy = Math.abs(ball.vy) * 1.05; // Bounce down
          }

          // Score Conditions
          if (ball.y > height + 20) {
            // AI scored
            setAiScore((a) => a + 1);
            ball.x = width / 2;
            ball.y = height / 2;
            ball.vy = -4;
          } else if (ball.y < -20) {
            // Player scored
            setScore((s) => s + 5);
            ball.x = width / 2;
            ball.y = height / 2;
            ball.vy = 4;
          }
        }

        // Render AI Top Paddle
        ctx.fillStyle = '#f43f5e';
        ctx.strokeStyle = '#ec4899';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(aiPaddleXRef.current - paddleWidth / 2, 15, paddleWidth, paddleHeight, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fda4af';
        ctx.font = 'bold 10px "Fira Code", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('AI PADDLE', aiPaddleXRef.current, 26);

        // Render Player Bottom Paddle (Head Controlled)
        ctx.fillStyle = '#06b6d4';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(playerPaddleXRef.current - paddleWidth / 2, height - 30, paddleWidth, paddleHeight, 6);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#93c5fd';
        ctx.fillText('👤 YOUR HEAD PADDLE', playerPaddleXRef.current, height - 19);

        // Render Cyber Bouncing Ball
        const ball = pongBallRef.current;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
        ctx.fillStyle = '#38bdf8';
        ctx.shadowColor = '#06b6d4';
        ctx.shadowBlur = 15;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        // ================= GAME 2: HAND NINJA TARGET SMASHER =================
        const handX = (1 - motionState.pointer.x) * width;
        const handY = motionState.pointer.y * height;

        if (gameActive) {
          // Update & Render Targets
          targetsRef.current.forEach((t) => {
            t.x += t.vx;
            t.y += t.vy;

            if (t.x - t.radius < 0 || t.x + t.radius > width) t.vx *= -1;
            if (t.y - t.radius < 0 || t.y + t.radius > height) t.vy *= -1;

            // Hand Smasher Collision
            const dist = Math.hypot(handX - t.x, handY - t.y);
            if (dist < t.radius + 15) {
              // Smashed target!
              setScore((s) => {
                const ns = s + t.points;
                if (ns > highScore) setHighScore(ns);
                return ns;
              });

              // Respawn smashed target
              t.x = Math.random() * (width - 100) + 50;
              t.y = Math.random() * (height - 100) + 50;
              t.vx = (Math.random() - 0.5) * 6;
              t.vy = (Math.random() - 0.5) * 6;
            }

            // Render Target Sphere
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.radius, 0, 2 * Math.PI);
            ctx.fillStyle = t.color;
            ctx.shadowColor = t.color;
            ctx.shadowBlur = 12;
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1.5;
            ctx.stroke();
          });
        }

        // Render Hand Smasher Cursor Reticle
        if (motionState.pointer.active) {
          ctx.beginPath();
          ctx.arc(handX, handY, 14, 0, 2 * Math.PI);
          ctx.strokeStyle = '#f43f5e';
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(handX, handY, 6, 0, 2 * Math.PI);
          ctx.fillStyle = '#f43f5e';
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);
    return () => cancelAnimationFrame(animId);
  }, [gameMode, gameActive, motionState.pointer, motionState.face.headRotation]);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6 text-slate-100">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-950 border border-amber-700/50 rounded-xl text-amber-400">
            <Gamepad2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              MOTION ARCADE ARENA 🎮
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Dual Motion Minigames: Head Pong vs AI & Hand Ninja Target Smasher
            </p>
          </div>
        </div>

        {/* Game Mode Selector */}
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-xl font-mono text-xs">
          <button
            onClick={() => {
              setGameMode('head-pong');
              setGameActive(false);
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
              gameMode === 'head-pong'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Smile className="w-4 h-4" /> 👤 HEAD PONG VS AI
          </button>
          <button
            onClick={() => {
              setGameMode('hand-smasher');
              setGameActive(false);
            }}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer flex items-center gap-1.5 ${
              gameMode === 'hand-smasher'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Hand className="w-4 h-4" /> 🖐️ HAND NINJA SMASHER
          </button>
        </div>
      </div>

      {/* Arcade Controls & Scoreboard */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-xl font-mono text-xs">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">PLAYER SCORE:</span>
            <span className="text-lg font-extrabold text-cyan-400">{score}</span>
          </div>

          {gameMode === 'head-pong' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">AI SCORE:</span>
              <span className="text-lg font-extrabold text-rose-400">{aiScore}</span>
            </div>
          )}
        </div>

        <button
          onClick={startGame}
          className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold transition shadow-lg shadow-amber-950/60 cursor-pointer flex items-center gap-2"
        >
          <Zap className="w-4 h-4" /> {gameActive ? 'RESTART GAME' : 'START GAME'}
        </button>
      </div>

      {/* Main Game Viewport Canvas */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center shadow-2xl">
        <canvas ref={canvasRef} width={640} height={360} className="w-full h-full object-contain" />
      </div>
    </div>
  );
};
