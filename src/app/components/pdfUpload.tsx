import { Input } from "@/components/ui/input";
import { useState } from "react";

export function PdfUpload() {
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // extra safety check
      if (file.type !== "application/pdf") {
        setError("Please upload a PDF file only.");
        return;
      }
      setError(null);
      // …process your PDF…
    }
  };

  return (
    <div>
      <Input
        type="file"
        accept=".pdf,application/pdf"
        onChange={handleFileChange}
      />
      {error && <p className="text-red-600 mt-2">{error}</p>}
    </div>
  );
}
