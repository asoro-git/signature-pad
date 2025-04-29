"use client";

import { useState } from "react";

export default function A4CanvasWithCoords() {
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({
      x: parseFloat(x.toFixed(1)),
      y: parseFloat(y.toFixed(1)),
    });
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <canvas
        width={794}
        height={1123}
        style={{ width: "210mm", height: "297mm" }}
        className="border cursor-crosshair"
        onMouseMove={handleMouseMove}
      />
      <div>
        <strong>Mouse:</strong> X = {coords.x}px, Y = {coords.y}px
      </div>
    </div>
  );
}
