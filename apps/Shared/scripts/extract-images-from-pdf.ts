// import { PDFDocument } from "pdf-lib";
// import fs from "fs";

// // Extraer imágenes de un PDF
// async function extractImagesFromPDF(pdfPath: string) {
//     const pdfBytes = fs.readFileSync(pdfPath);
//     const pdfDoc = await PDFDocument.load(pdfBytes);

//     const images = [];
//     for (const page of pdfDoc.getPages()) {
//         for (const { object } of page.node.entries()) {
//             if (object instanceof PDFDocument) {
//                 images.push(object);
//             }
//         }
//     }

//     console.log(`Encontradas ${images.length} imágenes.`);
//     return images;
// }
