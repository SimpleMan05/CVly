export interface PdfConversionResult {
    imageUrl: string;
    file: File | null;
    error?: string;
}

let pdfjsLib: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadPdfJs(): Promise<any> {
    if (pdfjsLib) return pdfjsLib;
    if (loadPromise) return loadPromise;

    if (typeof window === "undefined") {
        throw new Error("PDF conversion is only supported in the browser");
    }

    isLoading = true;

    loadPromise = import("pdfjs-dist/build/pdf.mjs").then(async (module) => {
        const lib = module.default;
        const workerModule = await import("pdfjs-dist/build/pdf.worker.min.mjs?url");
        lib.GlobalWorkerOptions.workerSrc = workerModule.default;
        pdfjsLib = lib;
        isLoading = false;
        return lib;
    }).catch((error) => {
        isLoading = false;
        loadPromise = null;
        throw error;
    });

    return loadPromise;
}

export async function convertPdfToImage(
    file: File
): Promise<PdfConversionResult> {
    try {
        if (!file.type.includes("pdf") && !/\.pdf$/i.test(file.name)) {
            throw new Error("Only PDF files are supported");
        }

        const lib = await loadPdfJs();

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await lib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1);

        const baseViewport = page.getViewport({ scale: 1 });
        const targetMaxSide = 1600;
        const scale = Math.min(2, targetMaxSide / Math.max(baseViewport.width, baseViewport.height));
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        if (!context) {
            throw new Error("Unable to create a 2D canvas context");
        }

        canvas.width = Math.floor(viewport.width);
        canvas.height = Math.floor(viewport.height);

        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = "high";

        await page.render({ canvasContext: context, viewport }).promise;

        const originalName = file.name.replace(/\.pdf$/i, "");

        const buildResult = (blob: Blob) => ({
            imageUrl: URL.createObjectURL(blob),
            file: new File([blob], `${originalName}.png`, {
                type: "image/png",
            }),
        });

        const blobResult = await new Promise<Blob | null>((resolve) => {
            try {
                canvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
            } catch {
                resolve(null);
            }
        });

        if (blobResult) {
            return buildResult(blobResult);
        }

        const dataUrl = canvas.toDataURL("image/png", 1.0);
        const base64 = dataUrl.split(",")[1];

        if (!base64) {
            throw new Error("Canvas export returned an empty image data URL");
        }

        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }

        const fallbackBlob = new Blob([bytes], { type: "image/png" });
        return buildResult(fallbackBlob);
    } catch (err) {
        return {
            imageUrl: "",
            file: null,
            error: `Failed to convert PDF: ${err instanceof Error ? err.message : String(err)}`,
        };
    }
}
