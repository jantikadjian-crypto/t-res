"use client";

import { useEffect, useRef } from "react";
import { Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";

// Draw-to-sign canvas: mouse, finger or stylus. Reports a PNG data URL, or null when empty.
export function SignaturePad({ label, onChange }: { label: string; onChange: (dataUrl: string | null) => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasInk = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const setup = (clearParent: boolean) => {
      const ratio = window.devicePixelRatio || 1;
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.scale(ratio, ratio);
      ctx.lineWidth = 2.4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = "#0f172a";
      if (clearParent && hasInk.current) {
        hasInk.current = false;
        onChange(null);
      }
    };
    setup(false);
    const onResize = () => setup(true); // resizing wipes the canvas, so the signature must be redrawn
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [onChange]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const stroke = (to: { x: number; y: number }) => {
    const ctx = canvasRef.current?.getContext("2d");
    const from = last.current ?? to;
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x + 0.01, to.y + 0.01);
    ctx.stroke();
    last.current = to;
    hasInk.current = true;
  };

  const finish = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    if (hasInk.current && canvasRef.current) onChange(canvasRef.current.toDataURL("image/png"));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    hasInk.current = false;
    onChange(null);
  };

  return (
    <div className="space-y-2">
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        className="h-40 w-full cursor-crosshair touch-none rounded-lg border-2 border-dashed bg-background"
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          drawing.current = true;
          last.current = point(e);
          stroke(point(e));
        }}
        onPointerMove={(e) => {
          if (drawing.current) stroke(point(e));
        }}
        onPointerUp={finish}
        onPointerCancel={finish}
        onPointerLeave={finish}
      />
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">Sign with your mouse, finger or stylus. Using a keyboard? Choose Type.</p>
        <Button variant="ghost" size="sm" onClick={clear}>
          <Eraser aria-hidden />
          Clear
        </Button>
      </div>
    </div>
  );
}
