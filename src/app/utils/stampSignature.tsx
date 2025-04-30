import { StandardFonts, rgb, PDFDocument } from "pdf-lib";

export async function stampSignature(
  pdfBytes: ArrayBuffer,
  signatureDataUrl: string,
  signName: string,
  clientName: string,
  signDate: string,
): Promise<Uint8Array> {
  // Load the existing PDF
  const pdfDoc = await PDFDocument.load(pdfBytes);

  // Embed the signature image (PNG)
  const pngBytes = await fetch(signatureDataUrl).then((r) => r.arrayBuffer());
  const sigImg = await pdfDoc.embedPng(pngBytes);

  // Grab all pages
  const pages = pdfDoc.getPages();
  const lastPageIndex = pages.length - 1;

  // Zero-based page indexes: 10 = page 11
  const targetPageIndexes = [10, lastPageIndex].filter((i) => i < pages.length);

  // Stamp each target page
  for (const idx of targetPageIndexes) {
    const page = pages[idx];
    const { height } = page.getSize();

    const sigHeight = 26;
    const sigWidth = (sigImg.width / sigImg.height) * sigHeight;
    // Scale to, say, 150px wide
    const timesRoman = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    console.log(sigWidth, sigHeight);
    if (idx === 10) {
      if (clientName !== signName && clientName !== "") {
        page.drawImage(sigImg, {
          x: 96,
          y: height - 452,
          width: sigWidth,
          height: sigHeight,
        });
        page.drawText(`${signName}`, {
          x: 96,
          y: height - 392,
          size: 12,
          font: timesRoman,
          color: rgb(0, 0, 0),
        });
        page.drawText(`${signDate} (YYYY-MM-DD)`, {
          x: 96,
          y: height - 417,
          size: 11,
          font: timesRoman,
          color: rgb(0, 0, 0),
        });
        // for (let i = 50; i < 1000; i += 20) {
        //   page.drawText(i.toString(), {
        //     x: 420,
        //     y: height - i,
        //     size: 11,
        //     font: timesRoman,
        //     color: rgb(0, 0, 0),
        //   });
        //   page.drawText(i.toString(), {
        //     x: i,
        //     y: height - 265,
        //     size: 11,
        //     font: timesRoman,
        //     color: rgb(0, 0, 0),
        //   });
        // }
      } else if (signName === clientName || clientName === "") {
        page.drawText(`${signDate} (YYYY-MM-DD)`, {
          x: 85,
          y: height - 270,
          size: 11,
          font: timesRoman,
          color: rgb(0, 0, 0),
        });
        page.drawImage(sigImg, {
          x: 96,
          y: height - 331,
          width: sigWidth,
          height: sigHeight,
        });
      }
    }
    if (idx === 13) {
      page.drawImage(sigImg, {
        x: 416,
        y: height - 660,
        width: sigWidth,
        height: sigHeight,
      });
      page.drawText(`${signDate} (YYYY-MM-DD)`, {
        x: 100,
        y: height - 700,
        size: 12,
        font: timesRoman,
        color: rgb(0, 0, 0),
      });
    }
  }
  pdfDoc.setTitle(
    `${signDate}_${
      clientName === signName
        ? clientName
        : clientName === ""
          ? signName
          : clientName
    }_Service Agreement_Signed`,
    {
      showInWindowTitleBar: true,
    },
  );
  // Serialize to bytes
  return await pdfDoc.save();
}
