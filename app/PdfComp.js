import { useEffect, useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function PdfComp(props) {
  const [numPages, setNumPages] = useState();
  const [currentPage, setCurrentPage] = useState(0); // Current page state
  const [jpgUrl, setJpgUrl] = useState(null); // State for the current page's JPG URL
  const canvasRef = useRef();

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    convertPdfToJpg(currentPage + 1); // Convert the first page (index +1 because PDF pages are 1-based)
  }

  // Function to convert a specific PDF page to a JPG
  const convertPdfToJpg = async (pageNumber) => {
    const loadingTask = pdfjs.getDocument(props.pdfFileUrl);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(pageNumber);

    const viewport = page.getViewport({ scale: 0.75 }); // Adjust the scale as needed
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = viewport.width;
    canvas.height = viewport.height; 

    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };

    await page.render(renderContext).promise;
    const jpgDataUrl = canvas.toDataURL("image/jpeg");
    setJpgUrl(jpgDataUrl); // Set the current page's JPG URL
  };

  // Navigate to the next page
  const handleNextPage = () => {
    if (currentPage < numPages - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      convertPdfToJpg(nextPage + 1); // Convert the next page (page number is 1-based)
    }
  };

  // Navigate to the previous page
  const handlePrevPage = () => {
    if (currentPage > 0) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      convertPdfToJpg(prevPage + 1); // Convert the previous page (page number is 1-based)
    }
  };

  useEffect(() => {
    console.log("PDF URL:", props.pdfFileUrl);
  }, [props.pdfFileUrl]);

  return (
    <div className="flex flex-col justify-center items-center">
      <canvas ref={canvasRef} style={{ display: "none" }} /> {/* Hidden canvas */}

      {jpgUrl ? (
        <img
          src={jpgUrl}
          alt={`PDF page ${currentPage + 1} as JPG`}
          className="w-auto h-auto max-w-full max-h-full object-contain mb-4"
        />
      ) : (
        <Document
          file={props.pdfFileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          className="flex items-center justify-center h-full w-full"
        >
          <Page
            pageNumber={props.currentpage + 1}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="w-auto h-auto max-w-full max-h-full object-contain"
          />
        </Document>
      )}

      {/* Pagination controls */}
      <div className="flex items-center justify-between w-full px-4 py-3 bg-gray-750 mt-4">
        <button
          onClick={handlePrevPage}
          disabled={currentPage === 0}
          className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-500 transition-colors duration-200"
        >
          Previous
        </button>
        <span className="text-gray-300 font-medium">
          Page {currentPage + 1} of {numPages}
        </span>
        <button
          onClick={handleNextPage}
          disabled={currentPage === numPages - 1}
          className="bg-cyan-600 text-white px-4 py-2 rounded-md hover:bg-cyan-500 transition-colors duration-200"
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default PdfComp;
