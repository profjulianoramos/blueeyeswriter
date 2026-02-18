
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { marked } from "marked";

/**
 * Downloads the content as a plain text file.
 */
export const downloadFile = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Renders Markdown to HTML for export.
 */
const renderMarkdownToHtml = (markdown: string): string | Promise<string> => {
  return marked.parse(markdown);
};

/**
 * Professional PDF export that renders the Markdown view.
 */
export const exportToPdf = async (content: string, filename: string) => {
  // Create a hidden container for rendering
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '800px'; 
  container.style.padding = '50px';
  container.style.backgroundColor = 'white';
  container.className = 'prose prose-slate max-w-none';
  
  const htmlResult = await renderMarkdownToHtml(content);

  // Styling for the PDF output
  container.innerHTML = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
      body { font-family: 'Inter', sans-serif; color: #334155; }
      h1 { font-weight: bold; font-size: 2.5em; margin-bottom: 0.5em; color: #1e293b; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.2em; }
      h2 { font-weight: bold; font-size: 1.8em; margin-top: 1.5em; margin-bottom: 0.5em; color: #334155; }
      h3 { font-weight: bold; font-size: 1.4em; margin-top: 1.2em; margin-bottom: 0.4em; color: #475569; }
      p { margin-bottom: 1.2em; line-height: 1.7; font-size: 16px; }
      code { background-color: #f1f5f9; padding: 0.2em 0.4em; border-radius: 4px; font-family: monospace; color: #ef4444; font-size: 0.9em; }
      pre { background-color: #1e293b; color: #f8fafc; padding: 20px; border-radius: 8px; overflow: auto; margin-bottom: 1.5em; font-size: 14px; }
      table { border-collapse: collapse; width: 100%; margin-bottom: 1.5em; border: 1px solid #e2e8f0; }
      th { background-color: #f8fafc; font-weight: bold; text-align: left; }
      th, td { border: 1px solid #e2e8f0; padding: 10px 15px; }
      tr:nth-child(even) { background-color: #fcfcfc; }
      blockquote { border-left: 5px solid #2b579a; color: #64748b; padding-left: 1.5em; margin: 1.5em 0; font-style: italic; }
      ul, ol { margin-bottom: 1.2em; padding-left: 1.5em; }
      li { margin-bottom: 0.5em; }
      img { max-width: 100%; height: auto; border-radius: 4px; margin: 1em 0; }
    </style>
    <div class="pdf-content">
      ${htmlResult}
    </div>
  `;
  
  document.body.appendChild(container);

  // Wait for images
  const images = container.getElementsByTagName('img');
  await Promise.all(Array.from(images).map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise(resolve => {
      img.onload = resolve;
      img.onerror = resolve;
    });
  }));

  try {
    const canvas = await html2canvas(container, {
      scale: 2, 
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const pdfWidth = 210; 
    const pdfHeight = 297; 
    const imgHeightInPdf = (canvas.height * pdfWidth) / canvas.width;
    
    let heightLeft = imgHeightInPdf;
    let position = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightInPdf);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeightInPdf;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeightInPdf);
      heightLeft -= pdfHeight;
    }

    pdf.save(`${filename}.pdf`);
  } catch (error) {
    console.error("Erro ao exportar PDF:", error);
    alert("Erro ao exportar PDF. Verifique se todas as dependências foram instaladas.");
  } finally {
    document.body.removeChild(container);
  }
};

/**
 * ODT Export using HTML-to-ODT compatibility mode.
 */
export const exportToOdt = async (content: string, filename: string) => {
  const htmlContent = await renderMarkdownToHtml(content);
  
  const fullHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Arial', sans-serif; line-height: 1.6; padding: 20px; }
        h1 { color: #2b579a; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #999; padding: 10px; }
        pre { background: #f4f4f4; padding: 15px; border: 1px solid #ddd; }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', fullHtml], { type: 'application/vnd.oasis.opendocument.text' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename}.odt`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
