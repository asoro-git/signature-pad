import React, { useRef, useState } from "react";
import { handleStamp } from "@/app/utils/handleStamp";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SignPdfButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // when the user picks a file…
  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setSelectedFile(file);
  };

  // trigger the hidden input
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // only runs when they click “Stamp PDF”
  const onStampClick = async (): Promise<void> => {
    if (!selectedFile || !sigPadRef.current) return;
    const blob = await handleStamp(selectedFile, sigPadRef.current, name, date);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${date}_${name}_signed service agreement.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {" "}
      <Input
        type="file"
        accept=".pdf"
        name="pdf"
        onChange={onFileSelected}
        className="hidden"
        ref={fileInputRef}
      />
      <br />
      {/* button to open file picker */}
      <div className="flex justify-center space-x-2">
        <Button onClick={openFilePicker}>
          {selectedFile ? selectedFile.name : "Select PDF"}
        </Button>

        {/* only enabled once a file’s picked */}
        <Button onClick={onStampClick} disabled={!selectedFile}>
          Sign PDF
        </Button>
        <br />
      </div>
    </>
  );
}
