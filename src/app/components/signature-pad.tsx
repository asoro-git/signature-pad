"use client";
import React, { useEffect, useRef, useState } from "react";
import SignaturePad from "signature_pad";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/app/components/mode_toggle";
import { handleStamp } from "@/app/utils/handleStamp";

export default function SignaturePadComponent() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sigPadRef = useRef<SignaturePad>(null);
    const [name, setName] = useState("");
    // const [purpose, setPurpose] = useState("");
    const [clientName, setClientName] = useState("");
    const [date, setDate] = useState(
        new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10),
    );
    const [leftMostX, setLeftMostX] = useState<number | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const [canvasSize, setCanvasSize] = useState({
        width: 600,
        height: 200,
    });

    useEffect(() => {
        const handleResize = () => {
            const sigPad = sigPadRef.current!;
            const w = window.innerWidth * 0.6;
            const h = 200;

            // 2) Grab the old signature data
            if (sigPad) {
                const oldDatas = sigPad.toData();
                // 3) Scale it
                for (const oldData of oldDatas) {
                    oldData.points = oldData.points.map((point) => ({
                        x: (point.x =
                            canvasSize.width > w
                                ? point.x - Math.abs((canvasSize.width - w) * 0.25)
                                : point.x + Math.abs((canvasSize.width - w) * 0.25)),
                        y: point.y,
                        time: point.time,
                        pressure: point.pressure,
                    }));
                }
                // 4) Replay the scaled strokes
                sigPadRef.current!.fromData(oldDatas);
            }
            // 5) Resize the actual <canvas>
            setCanvasSize({ width: w, height: h });
            requestAnimationFrame(() => {
                /* no-op: just forces a paint */
            });
        };

        window.addEventListener("resize", handleResize);
        handleResize();
        return () => window.removeEventListener("resize", handleResize);
    }, [canvasSize.width]);

    useEffect(() => {
        if (canvasRef.current) {
            sigPadRef.current = new SignaturePad(canvasRef.current, {
                penColor: "#000",
                backgroundColor: "rgba(0,0,0,0)",
                onBegin: () => {},
                onEnd: () => {},
            });
            const json = localStorage.getItem("savedSignature");
            if (json) {
                try {
                    const data = JSON.parse(json);
                    sigPadRef.current.fromData(data);
                    console.log("read saved data");
                } catch {
                    console.warn("Invalid signature data in localStorage");
                }
            }
        }
    }, []); // Reinit on dimension changes

    // mount stored file
    useEffect(() => {
        const json = localStorage.getItem("savedFile");
        if (!json) return;

        const { name, type, lastModified, dataUrl } = JSON.parse(json);

        // Convert DataURL → Blob
        fetch(dataUrl)
            .then((res) => res.blob())
            .then((blob) => {
                //pass the original filename into File()
                const restored = new File([blob], name, { type, lastModified });
                setSelectedFile(restored);
            });
    }, []);
    // track pointer positions
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const updateLeft = (e: PointerEvent) => {
            if ((e.buttons & 1) !== 1) return;
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            setLeftMostX((prev) => (prev !== null ? Math.min(prev, x) : x));
            localStorage.setItem("leftMostX", JSON.stringify({ leftMostX }));
        };
        const localSave = () => {
            localStorage.setItem("savedSignature", JSON.stringify(sigPadRef.current!.toData()));
        };
        canvas.addEventListener("pointerdown", updateLeft);
        canvas.addEventListener("pointermove", updateLeft);
        canvas.addEventListener("pointerup", localSave);
        canvas.addEventListener("pointermove", localSave);
        return () => {
            canvas.removeEventListener("pointerdown", updateLeft);
            canvas.removeEventListener("pointermove", updateLeft);
            canvas.removeEventListener("pointerup", localSave);
            canvas.removeEventListener("pointermove", localSave);
        };
    }, [leftMostX]);

    const clear = () => {
        sigPadRef.current?.clear();
        localStorage.removeItem("savedSignature");
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
        const leftMostXJSON = localStorage.getItem("leftMostX");
        const leftMostX = JSON.parse(leftMostXJSON!).leftMostX;
        const textX = leftMostX !== null ? (leftMostX > 400 ? 300 : leftMostX) : 10;
        const startY = signatureCanvas.height + 10;
        ctx.fillText(`Signer Name: ${name}`, textX, startY);
        ctx.fillText(`Date signed: ${date}`, textX, startY + 20);
        ctx.fillText(
            `Purpose: ${`Service Agreement Signature`}`, //purpose var is not used here
            textX,
            startY + 40,
        );
        // download
        const dataUrl = fullCanvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = name + "_" + date + "_" + "signature.png";
        link.click();
    };

    // when the user picks a file…
    const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        setSelectedFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                localStorage.setItem(
                    "savedFile",
                    JSON.stringify({
                        name: file.name,
                        type: file.type,
                        lastModified: file.lastModified,
                        dataUrl: reader.result, // this is the Base64 string
                    }),
                );
            };
            reader.readAsDataURL(file);
        }
    };

    // trigger the hidden input
    const openFilePicker = () => {
        fileInputRef.current?.click();
    };

    // only runs when they click “Stamp PDF”
    const onStampClick = async (): Promise<void> => {
        if (!selectedFile || !sigPadRef.current) return;
        const nameTrimmed = name.trim();
        const clientNameTrimmed = clientName.trim();
        setName(nameTrimmed);
        setClientName(clientNameTrimmed);
        const blob = await handleStamp(
            selectedFile,
            sigPadRef.current,
            nameTrimmed,
            clientNameTrimmed,
            date,
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${date}_${name === clientName ? name : clientName === "" ? name : clientName}_signed service agreement.pdf`;
        a.click();
        URL.revokeObjectURL(url);
        localStorage.removeItem("savedFile");
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
                                  ? Math.min(canvasSize.width - 50, 200)
                                  : canvasSize.width
                        }
                        height={canvasSize.height}
                        style={{ margin: "auto" }}
                        className="border rounded"
                    />
                    <Input
                        type="file"
                        accept=".pdf"
                        name="pdf"
                        onChange={onFileSelected}
                        className="hidden"
                        ref={fileInputRef}
                    />
                    <br />
                    <div className="flex space-x-2 justify-center">
                        <Button variant="outline" onClick={clear} className="rounded">
                            Clear
                        </Button>
                    </div>
                    <br />
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div className="flex flex-col">
                            <Label htmlFor="name">Signer Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) =>
                                    setName(
                                        e.target.value
                                            .split(/\s+/)
                                            .map((word) =>
                                                word
                                                    .split(/([-'])/)
                                                    .map((part) =>
                                                        /^[a-zA-Z]/.test(part)
                                                            ? part.slice(0, 1).toUpperCase() +
                                                              part.slice(1).toLowerCase()
                                                            : part,
                                                    )
                                                    .join(""),
                                            )
                                            .join(" "),
                                    )
                                }
                                placeholder="Representative name"
                                className="my-2"
                            />
                        </div>
                        <div className="flex flex-col">
                            <Label htmlFor="clientName">Client Name</Label>
                            <Input
                                id="clientName"
                                value={clientName}
                                onChange={(e) =>
                                    setClientName(
                                        e.target.value
                                            .split(/\s+/)
                                            .map((word) =>
                                                word
                                                    .split(/([-'])/)
                                                    .map((part) =>
                                                        /^[a-zA-Z]/.test(part)
                                                            ? part.slice(0, 1).toUpperCase() +
                                                              part.slice(1).toLowerCase()
                                                            : part,
                                                    )
                                                    .join(""),
                                            )
                                            .join(" "),
                                    )
                                }
                                placeholder="Client Name (Empty if same)"
                                className="my-2"
                            />
                        </div>
                        <div className="flex flex-col">
                            <Label htmlFor="date">Sign Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="my-2"
                            />
                        </div>
                    </div>
                    <br />
                    {/* button to open file picker */}
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                        <div className="flex flex-col col-span-3">
                            <Button
                                variant="default"
                                style={{ overflow: "hidden" }}
                                onClick={openFilePicker}
                            >
                                {selectedFile ? selectedFile.name : "Select Service Agreement (SA)"}
                            </Button>
                        </div>
                        {/* only enabled once a file’s picked */}
                        <div className="flex flex-col">
                            <Button
                                onClick={onStampClick}
                                variant="default"
                                disabled={!selectedFile}
                            >
                                Sign SA
                            </Button>
                        </div>
                        <div className="flex flex-col col-span-4">
                            <Button onClick={save} variant="outline">
                                Save Signature Only
                            </Button>
                        </div>
                        <br />
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-center item-end h-full text-xs text-slate-400">
                <div>
                    {" "}
                    © Copyright{" "}
                    {new Date().toLocaleString("en-AU", {
                        year: "numeric",
                    })}{" "}
                    Stanley
                </div>
            </div>
        </div>
    );
}
