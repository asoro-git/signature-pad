"use client";
import React, { useEffect, useRef, useState } from "react";
import SignaturePad from "signature_pad";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "./mode_toggle";

export default function SignaturePadComponent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sigPadRef = useRef<SignaturePad>(null);
  const [name, setName] = useState("");
  const [purpose, setPurpose] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [leftMostX, setLeftMostX] = useState<number | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const [canvasSize, setCanvasSize] = useState({
    width: 600,
    height: 300,
  });
  useEffect(() => {
    // handler for window resize
    const handleResize = () => {
      const w = window.innerWidth * 0.6; // viewport width in px :contentReference[oaicite:0]{index=0}
      const h = window.innerHeight / 3; // viewport height in px :contentReference[oaicite:1]{index=1}

      setCanvasSize((prev) =>
        prev.width === w && prev.height === h ? prev : { width: w, height: h },
      );
    };

    // listen for resize
    window.addEventListener("resize", handleResize); // :contentReference[oaicite:2]{index=2}

    // call once to initialise
    handleResize();

    // cleanup on unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []); // initialise signature pad
  useEffect(() => {
    if (canvasRef.current) {
      sigPadRef.current = new SignaturePad(canvasRef.current, {
        penColor: "#000",
        backgroundColor: "rgba(0,0,0,0)",
        onBegin: () => {
          setLeftMostX(null);
        },
        onEnd: () => {
          //stroke finished
        },
      });
    }
  }, []); // Reinit on dimension changes

  // track pointer positions
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const updateLeft = (e: PointerEvent) => {
      if ((e.buttons & 1) !== 1) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      setLeftMostX((prev) => (prev !== null ? Math.min(prev, x) : x));
    };
    canvas.addEventListener("pointerdown", updateLeft);
    canvas.addEventListener("pointermove", updateLeft);
    return () => {
      canvas.removeEventListener("pointerdown", updateLeft);
      canvas.removeEventListener("pointermove", updateLeft);
    };
  }, []);

  const clear = () => {
    sigPadRef.current?.clear();
    setLeftMostX(null);
  };

  const save = () => {
    if (!canvasRef.current) return;
    const signatureCanvas = canvasRef.current;
    const fullCanvas = document.createElement("canvas");
    fullCanvas.width = 600;
    fullCanvas.height = signatureCanvas.height + 80;
    const ctx = fullCanvas.getContext("2d");
    if (!ctx) return;
    // draw signature
    ctx.fillStyle = "#fff";
    ctx.drawImage(signatureCanvas, 0, 0);
    // draw text
    ctx.fillStyle = "#000";
    ctx.font = "16px 'Playfair Display', monospace";
    ctx.textBaseline = "top";
    const textX = leftMostX !== null ? leftMostX : 10;
    const startY = signatureCanvas.height + 10;
    ctx.fillText(`Name: ${name}`, textX, startY);
    ctx.fillText(`Date signed: ${date}`, textX, startY + 20);
    ctx.fillText(
      `Purpose: ${purpose || `Service Agreement Signature`}`,
      textX,
      startY + 40,
    );
    // download
    const dataUrl = fullCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "signature.png";
    link.click();
  };

  return (
    <div
      className="flex flex-col justify-center items-center space-y-4 p-9"
      style={{ fontFamily: "'Playfair Display', monospace" }}
    >
      <Card ref={cardRef} className="w-full max-w-3xl min-w-60 p-6">
        <CardHeader className="flex flex-col justify-center items-center">
          <CardTitle
            className="text-2xl"
            style={{
              margin: "auto",
            }}
          >
            Signature Pad
          </CardTitle>
          <ModeToggle />
        </CardHeader>
        <CardContent>
          <canvas
            ref={canvasRef}
            width={
              canvasSize.width > 600
                ? 600
                : canvasSize.width < 400
                  ? 170
                  : canvasSize.width
            }
            height={canvasSize.height}
            style={{ margin: "auto" }}
            className="border rounded"
          />
          <br />
          <div className="flex space-x-2 justify-center">
            <Button variant="outline" onClick={clear} className="rounded">
              Clear
            </Button>
            <Button onClick={save}>Save</Button>
          </div>
          <br />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex flex-col">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name (relationship/self)"
                className="my-2"
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="purpose">Purpose</Label>

              <Input
                id="purpose"
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Signature purpose"
                className="my-2"
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="my-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
