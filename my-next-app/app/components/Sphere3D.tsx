"use client";

import { useEffect, useRef } from "react";

export default function Sphere3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let rotationX = 0;
    let rotationY = 0;

    const resize = () => {
      const size = Math.min(400, window.innerWidth * 0.4);
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = size + "px";
      canvas.style.height = size + "px";
      ctx.scale(dpr, dpr);
    };

    // Generate sphere points using Fibonacci sphere algorithm
    const points: { x: number; y: number; z: number }[] = [];
    const numPoints = 100;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = goldenAngle * i;
      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);
      points.push({ x, y, z });
    }

    const radius = 150;

    function project(x: number, y: number, z: number, centerX: number, centerY: number) {
      // Rotate around X axis
      const cosX = Math.cos(rotationX);
      const sinX = Math.sin(rotationX);
      const y1 = y * cosX - z * sinX;
      const z1 = y * sinX + z * cosX;
      
      // Rotate around Y axis
      const cosY = Math.cos(rotationY);
      const sinY = Math.sin(rotationY);
      const x1 = x * cosY - z1 * sinY;
      const z2 = x * sinY + z1 * cosY;

      // Perspective projection
      const perspective = 400;
      const scale = perspective / (perspective + z2 * radius + 200);
      
      return {
        x: centerX + x1 * radius * scale,
        y: centerY + y1 * radius * scale,
        z: z2,
        scale
      };
    }

    const draw = () => {
      const width = canvas.width / Math.min(window.devicePixelRatio, 2);
      const height = canvas.height / Math.min(window.devicePixelRatio, 2);
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      rotationX += 0.003;
      rotationY += 0.005;

      // Project all points
      const projected = points.map(p => project(p.x, p.y, p.z, centerX, centerY));

      // Sort by z for depth (back to front)
      const sortedIndices = projected
        .map((p, i) => ({ z: p.z, i }))
        .sort((a, b) => a.z - b.z)
        .map(item => item.i);

      // Draw connections between nearby points (network lines)
      ctx.save();
      for (let i = 0; i < sortedIndices.length; i++) {
        const idx1 = sortedIndices[i];
        const p1 = projected[idx1];
        
        // Connect to nearby points
        for (let j = i + 1; j < sortedIndices.length; j++) {
          const idx2 = sortedIndices[j];
          const p2 = projected[idx2];
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.4 * p1.scale;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            ctx.lineWidth = 0.8 * p1.scale;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      ctx.restore();

      // Draw points (nodes) with glow
      for (const idx of sortedIndices) {
        const p = projected[idx];
        const depth = (p.z + 1) / 2; // Normalize z from [-1, 1] to [0, 1]
        const alpha = 0.4 + depth * 0.6;
        const size = (1.5 + depth * 2.5) * p.scale;

        ctx.save();
        ctx.globalAlpha = alpha;
        
        // Outer glow
        ctx.shadowBlur = 15 * p.scale;
        ctx.shadowColor = `rgba(139, 92, 246, 0.6)`;
        
        // Inner bright point
        ctx.fillStyle = `rgba(167, 139, 250, ${alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Bright center
        ctx.shadowBlur = 0;
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 0.4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }

      // Draw outer sphere glow (ambient light)
      ctx.save();
      const glowGradient = ctx.createRadialGradient(centerX, centerY, radius * 0.5, centerX, centerY, radius * 1.8);
      glowGradient.addColorStop(0, 'rgba(139, 92, 246, 0.08)');
      glowGradient.addColorStop(0.5, 'rgba(99, 102, 241, 0.05)');
      glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      animationId = requestAnimationFrame(draw);
    };

    resize();
    draw();

    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="animate-float"
      style={{ maxWidth: "100%", height: "auto" }}
    />
  );
}