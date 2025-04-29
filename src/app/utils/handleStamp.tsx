import SignaturePad from "signature_pad";
import { stampSignature } from "./stampSignature";

export async function handleStamp(
  file: File,
  canvas: SignaturePad,
  signName: string,
  signDate: string,
): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const sigDataUrl = canvas.toDataURL("image/png");
  const stamped = await stampSignature(
    arrayBuffer,
    sigDataUrl,
    signName,
    signDate,
  );

  //create the blob object to return to main file and prepare for download
  return new Blob([stamped], { type: "application/pdf" });
}
