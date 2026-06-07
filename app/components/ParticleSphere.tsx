import { useEffect, useRef } from "react";

export type ParticleShapeKind = "sphere" | "cube" | "dna" | "diamond";

function generatePoints(shape: ParticleShapeKind, n: number): { x: number; y: number; z: number }[] {
  const pts: { x: number; y: number; z: number }[] = [];
  if (shape === "sphere") {
    const phi = Math.PI * (Math.sqrt(5) - 1);
    for (let i = 0; i < n; i++) {
      const y = 1 - (i / (n - 1)) * 2;
      const r = Math.sqrt(1 - y * y);
      const theta = phi * i;
      pts.push({ x: Math.cos(theta) * r, y, z: Math.sin(theta) * r });
    }
  } else if (shape === "cube") {
    for (let i = 0; i < n; i++) {
      const edge = i % 12;
      const t = (Math.floor(i / 12) / Math.ceil(n / 12)) * 2 - 1;
      const corners: [number, number, number][] = [
        [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
        [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
      ];
      const edges: [number, number][] = [
        [0, 1], [1, 2], [2, 3], [3, 0],
        [4, 5], [5, 6], [6, 7], [7, 4],
        [0, 4], [1, 5], [2, 6], [3, 7],
      ];
      const [a, b] = edges[edge];
      const u = (t + 1) / 2;
      const ca = corners[a];
      const cb = corners[b];
      pts.push({
        x: ca[0] * (1 - u) + cb[0] * u,
        y: ca[1] * (1 - u) + cb[1] * u,
        z: ca[2] * (1 - u) + cb[2] * u,
      });
    }
  } else if (shape === "dna") {
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 6;
      const strand = i % 2 === 0 ? 1 : -1;
      pts.push({
        x: Math.cos(t) * 0.6 * strand,
        y: (i / n) * 2 - 1,
        z: Math.sin(t) * 0.6 * strand,
      });
    }
  } else {
    for (let i = 0; i < n; i++) {
      const t = Math.random();
      const face = i % 8;
      const dirs: [number, number, number][] = [
        [1, 1, 1], [-1, 1, 1], [1, -1, 1], [-1, -1, 1],
        [1, 1, -1], [-1, 1, -1], [1, -1, -1], [-1, -1, -1],
      ];
      const d = dirs[face];
      const r = 0.6 + Math.random() * 0.4;
      const a = Math.random();
      const b = Math.random() * (1 - a);
      pts.push({
        x: d[0] * a * r,
        y: d[1] * b * r,
        z: d[2] * (1 - a - b) * r,
      });
    }
  }
  return pts;
}

export function ParticleSphere({
  className = "",
  shape = "sphere",
  count = 900,
  scale = 0.38,
}: {
  className?: string;
  shape?: ParticleShapeKind;
  count?: number;
  scale?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const N = count;
    const points = generatePoints(shape, N);

    const mouse = { x: 0, y: 0, active: false };
    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouse.y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      mouse.active = true;
    };
    const onLeave = () => (mouse.active = false);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("mouseleave", onLeave);

    let t = 0;
    let rotY = 0;
    let rotX = 0;

    const render = () => {
      t += 0.006;
      const targetY = mouse.active ? mouse.x * 0.6 : 0;
      const targetX = mouse.active ? mouse.y * 0.4 : 0;
      rotY += (targetY - rotY) * 0.05 + 0.004;
      rotX += (targetX - rotX) * 0.05;

      ctx.clearRect(0, 0, w, h);
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * scale;

      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);

      for (let i = 0; i < N; i++) {
        const p = points[i];
        let x = p.x * cosY - p.z * sinY;
        let z = p.x * sinY + p.z * cosY;
        let y = p.y * cosX - z * sinX;
        z = p.y * sinX + z * cosX;

        const pulse = 1 + Math.sin(t * 2 + i * 0.05) * 0.02;
        const sx = cx + x * radius * pulse;
        const sy = cy + y * radius * pulse;
        const depth = (z + 1) / 2;
        const size = 0.6 + depth * 1.8;
        const alpha = 0.15 + depth * 0.75;
        const r = Math.round(140 + depth * 60);
        const g = Math.round(140 + depth * 40);
        const b = Math.round(240);
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("mouseleave", onLeave);
    };
  }, [shape, count, scale]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
