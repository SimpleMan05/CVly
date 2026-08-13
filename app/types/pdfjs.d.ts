declare module "pdfjs-dist/build/pdf.mjs" {
  const pdfjs: any;
  export default pdfjs;
}

declare module "pdfjs-dist/build/pdf.worker.min.mjs?url" {
  const url: string;
  export default url;
}
