"use client";

import React, { useEffect, useRef, useState } from "react";
import SignaturePad from "signature_pad";
import { Poppins } from "next/font/google";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/app/components/mode_toggle";
import { handleStamp } from "@/app/utils/handleStamp";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// Load modern font
const poppins = Poppins({
    subsets: ["latin"],
    weight: ["400", "600"],
    variable: "--font-poppins",
});

export default function SignaturePadComponent() {
    const [step, setStep] = useState(1);
    const [name, setName] = useState("");
    const [clientName, setClientName] = useState("");
    const [date, setDate] = useState(
        new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 10),
    );
    const [representingOpt, setRepresentingOpt] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [signedPdfUrl, setSignedPdfUrl] = useState<string | null>(null);
    const [highest, setHighest] = useState(1);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sigPadRef = useRef<SignaturePad | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // responsive canvas sizing
    const [canvasSize, setCanvasSize] = useState({ width: 200, height: 200 });

    useEffect(() => {
        const calcWidth = () => Math.min(window.innerWidth * 0.8, 800);
        const onResize = () => setCanvasSize({ width: calcWidth(), height: 200 });
        setCanvasSize({ width: calcWidth(), height: 200 });
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    useEffect(() => {
        if (step === 3 && canvasRef.current) {
            sigPadRef.current = new SignaturePad(canvasRef.current, {
                penColor: "#111827",
                backgroundColor: "rgba(255,255,255,0)",
            });
        }
    }, [step]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        if (file) {
            setSelectedFile(file);
            setStep(2);
            setHighest((prev) => Math.max(prev, 2));
        }
    };

    const openFilePicker = () => fileInputRef.current?.click();

    const onStampClick = async () => {
        if (!selectedFile || !sigPadRef.current || sigPadRef.current.isEmpty()) {
            return alert("Load the service agreement PDF and sign it before continuing.");
        }
        const blob = await handleStamp(
            selectedFile,
            sigPadRef.current,
            name.trim(),
            clientName.trim(),
            date,
        );
        setSignedPdfUrl(URL.createObjectURL(blob));
        setStep(4);
        setHighest((prev) => Math.max(prev, 4));
    };

    const handleShare = async () => {
        if (!signedPdfUrl) return;
        try {
            const blob = await fetch(signedPdfUrl).then((r) => r.blob());
            const file = new File([blob], `${date}_${clientName || name}_signed.pdf`, {
                type: "application/pdf",
            });
            const data: object = { files: [file], title: "Signed PDF" };
            if (navigator.canShare?.(data)) {
                await navigator.share(data);
            } else {
                const a = document.createElement("a");
                a.href = signedPdfUrl;
                a.download = file.name;
                a.click();
            }
        } catch {
            alert("Could not share the PDF.");
        }
    };

    // validation schema
    const FormSchema = z.object({
        type: z.enum(["myself", "someone-else"], {
            required_error: "Select an option.",
        }),
    });

    const form = useForm<z.infer<typeof FormSchema>>({
        resolver: zodResolver(FormSchema),
    });

    function onSubmit(data: z.infer<typeof FormSchema>) {
        setRepresentingOpt(data.type);
    }

    return (
        <div className={`${poppins.className}  p-6 font-sans`}>
            <Card className="w-auto h-auto shadow-lg" style={{ minHeight: "80vh" }}>
                <div>
                    <CardHeader className="flex justify-between items-center">
                        <CardTitle className="text-2xl font-semibold">
                            Sign Service Agreement
                        </CardTitle>
                        <ModeToggle />
                    </CardHeader>
                    {/* Steps Nav */}
                    <div className="flex space-x-4 mb-6 p-6">
                        {["Load", "Info", "Sign", "Share"].map((label, idx) => (
                            <button
                                key={label}
                                className={`flex-1 py-2 text-center border-b-2 font-medium text-gray-600
                   ${step > idx + 1 && highest > idx ? "border-gray-300" : ""} ${step === idx + 1 ? "border-blue-500 text-blue-600" : "border-transparent hover:border-gray-300"}`}
                                onClick={() =>
                                    setStep((prev) => (highest >= idx + 1 ? idx + 1 : prev))
                                }
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex flex-col w-full h-full justify-center items-center">
                    <CardContent className="w-auto">
                        {/* Step 1: Load PDF */}
                        {step === 1 && (
                            <div className="text-center py-8">
                                <p className="mb-4 text-gray-700">
                                    Load your agreement to sign locally in browser.
                                </p>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".pdf  "
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <Button onClick={openFilePicker} className="px-6">
                                    Load PDF
                                </Button>
                            </div>
                        )}

                        {/* Step 2: Info */}
                        {step === 2 && (
                            <div className="flex flex-col justify-center space-y-6">
                                <div className={`${representingOpt ? "text-gray-500" : ""}`}>
                                    <Form {...form}>
                                        <form onSubmit={form.handleSubmit(onSubmit)}>
                                            <FormField
                                                control={form.control}
                                                name="type"
                                                render={({ field }) => (
                                                    <FormItem className="justify-center items-center flex flex-wrap space-x-6">
                                                        <FormLabel className="p-4 space-x-6">
                                                            Who are you signing the form for?
                                                        </FormLabel>
                                                        <RadioGroup
                                                            onValueChange={field.onChange}
                                                            value={field.value}
                                                        >
                                                            <FormItem className="space-x-2">
                                                                <FormControl>
                                                                    <RadioGroupItem value="myself" />
                                                                </FormControl>
                                                                <FormLabel>
                                                                    I am signing for myself
                                                                </FormLabel>
                                                            </FormItem>
                                                            <FormItem className="space-x-2">
                                                                <FormControl>
                                                                    <RadioGroupItem value="someone-else" />
                                                                </FormControl>
                                                                <FormLabel>
                                                                    {`I am representing someone else`}
                                                                </FormLabel>
                                                            </FormItem>
                                                        </RadioGroup>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <div className="flex justify-center">
                                                <Button
                                                    type="submit"
                                                    variant={`${representingOpt ? "outline" : "default"}`}
                                                    className="mt-4"
                                                >
                                                    Continue
                                                </Button>
                                            </div>
                                        </form>
                                    </Form>
                                </div>

                                {representingOpt && (
                                    <div className="flex flex-col justify-center items-center">
                                        <div
                                            className={`h-full max-w-3xl min-w-sm flex flex-col justify-center items-center gap-4`}
                                        >
                                            <div>
                                                <Label htmlFor="name">
                                                    Tell me about your name?
                                                </Label>
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
                                                                                ? part
                                                                                      .slice(0, 1)
                                                                                      .toUpperCase() +
                                                                                  part
                                                                                      .slice(1)
                                                                                      .toLowerCase()
                                                                                : part,
                                                                        )
                                                                        .join(""),
                                                                )
                                                                .join(" "),
                                                        )
                                                    }
                                                    placeholder="Enter your name"
                                                />
                                            </div>
                                            {representingOpt === "someone-else" && name && (
                                                <div>
                                                    <Label htmlFor="clientName">
                                                        Who are you signing for?
                                                    </Label>
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
                                                                                /^[a-zA-Z]/.test(
                                                                                    part,
                                                                                )
                                                                                    ? part
                                                                                          .slice(
                                                                                              0,
                                                                                              1,
                                                                                          )
                                                                                          .toUpperCase() +
                                                                                      part
                                                                                          .slice(1)
                                                                                          .toLowerCase()
                                                                                    : part,
                                                                            )
                                                                            .join(""),
                                                                    )
                                                                    .join(" "),
                                                            )
                                                        }
                                                        placeholder="Enter the client name"
                                                    />
                                                </div>
                                            )}
                                            {name && clientName && (
                                                <div>
                                                    <Label htmlFor="date">Sign Date</Label>
                                                    <Input
                                                        id="date"
                                                        type="date"
                                                        value={date}
                                                        onChange={(e) => setDate(e.target.value)}
                                                    />
                                                </div>
                                            )}
                                            <div className="text-center">
                                                <Button
                                                    onClick={() => setStep(3)}
                                                    disabled={
                                                        representingOpt === "someone-else"
                                                            ? !clientName ||
                                                              !name ||
                                                              !selectedFile ||
                                                              !date
                                                            : !name || !selectedFile || !date
                                                    }
                                                    className={`px-6 ${
                                                        representingOpt === "someone-else"
                                                            ? clientName !== "" &&
                                                              name !== "" &&
                                                              !selectedFile &&
                                                              !date &&
                                                              "hidden"
                                                            : !name && !selectedFile
                                                    }`}
                                                >
                                                    Go to Sign
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Step 3: Sign */}
                        {step === 3 && (
                            <div className="space-y-4 text-center">
                                <p className="text-center text-lg font-medium text-gray-700">
                                    Please sign below:
                                </p>
                                <canvas
                                    ref={canvasRef}
                                    width={canvasSize.width}
                                    height={canvasSize.height}
                                    className="m-auto border rounded"
                                />
                                <div className="flex justify-center space-x-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => sigPadRef.current?.clear()}
                                    >
                                        Clear
                                    </Button>
                                    <Button onClick={onStampClick} className="px-6">
                                        Sign the document
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Share */}
                        {step === 4 && (
                            <div className="space-y-4 text-center">
                                <p className="text-center text-lg font-medium text-gray-700 text-wrap">
                                    Press{" "}
                                    <span className="border border-slate-500 rounded-sm bg-yellow-400">
                                        button
                                    </span>{" "}
                                    below to{" "}
                                    <span className="underline underline-offset-2">
                                        download/ share
                                    </span>{" "}
                                    your signed document:
                                </p>
                                <Button onClick={handleShare} className="px-6 text-wrap h-auto">
                                    Share or Download Your Signed PDF Form Below
                                </Button>
                                <iframe
                                    title="Signed PDF"
                                    src={signedPdfUrl || ""}
                                    className="rounded shadow max-w-full m-auto"
                                    style={{ minWidth: "50vw", minHeight: "60vh" }}
                                    loading="lazy"
                                    allowFullScreen
                                />
                            </div>
                        )}
                    </CardContent>
                </div>
            </Card>
            <div className="items-center justify-center flex flex-col">
                <button
                    onClick={() => window.location.reload()}
                    className="underline text-sm text-gray-400 px-4 py-2 rounded"
                >
                    {`Didn't quite work out? Click/tap here to try again.`}
                </button>
            </div>
        </div>
    );
}
