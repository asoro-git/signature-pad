"use client";
import A4CanvasWithCoords from "@/app/components/pdfCanvas";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Link from "next/link";
export default function Home() {
  return (
    <main className="min-h-screen p-8">
      <div
        className="flex flex-col justify-center items-center space-y-4 p-9"
        style={{ fontFamily: "'Playfair Display', monospace" }}
      >
        <Card className="w-full max-w-3xl min-w-60 p-6">
          <CardHeader>
            <Link href="/">Home</Link>
          </CardHeader>
          <CardContent>
            <A4CanvasWithCoords />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
