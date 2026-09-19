/**
 * Utility to extract text and render canvas previews from PDF files in the browser.
 */

export async function extractPdfContent(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();

    // Dynamically import pdfjs-dist to avoid loading overhead when not needed
    const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.mjs");

    // Set worker source to a reliable CDN matching pdfjs version or fallback
    if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || "3.11.174"}/pdf.worker.min.js`;
    }

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;

    let fullText = "";
    let pageImages = [];

    const numPages = Math.min(pdfDoc.numPages, 3); // Read up to first 3 pages

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);

      // Extract text content
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += `--- Page ${pageNum} ---\n${pageText}\n\n`;

      // Render page to canvas to create an image data URL for vision OCR
      try {
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        await page.render(renderContext).promise;
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        pageImages.push(dataUrl);
      } catch (renderErr) {
        console.warn(`[PDF Extractor] Could not render page ${pageNum} to canvas:`, renderErr);
      }
    }

    return {
      text: fullText.trim(),
      images: pageImages,
      pagesCount: pdfDoc.numPages,
    };
  } catch (error) {
    console.warn("[PDF Extractor] Failed to process PDF via pdfjs-dist:", error);
    // Fallback: read text using FileReader if text-based
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          text: typeof reader.result === "string" ? reader.result.slice(0, 4000) : "",
          images: [],
          pagesCount: 1,
        });
      };
      reader.onerror = () => resolve({ text: "", images: [], pagesCount: 1 });
      reader.readAsText(file);
    });
  }
}
