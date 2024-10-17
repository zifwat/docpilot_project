import { useEffect, useState, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronRight, ChevronLeft } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;
function PdfDraw({ pdfFileUrl, currentPage, setCurrentPage, boundingData, zoomLevel, isDrawing, setZoomLevel, setIsDrawing, setPdfDrawFunctions }) {
  const [numPages, setNumPages] = useState(0);
  const [jpgUrl, setJpgUrl] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pdfCanvasRef = useRef();  // Canvas for PDF rendering
  const drawingCanvasRef = useRef();  // Canvas for drawing bounding boxes
  const imageRef = useRef();
  const boundingBoxesRef = useRef([]);
  const startCoords = useRef(null);
  const redoStackRef = useRef([]);

  useEffect(() => {
    if (jpgUrl) {
      drawBoundingBoxes(); // Draw bounding boxes whenever jpgUrl changes
    }
  }, [jpgUrl]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    convertPdfToJpg(currentPage + 1);
  }

  const convertPdfToJpg = async (pageNumber) => {
    const loadingTask = pdfjs.getDocument(pdfFileUrl);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: zoomLevel });  // Use zoomLevel as the scale
    const canvas = pdfCanvasRef.current;  // Use the hidden canvas for PDF rendering
    const context = canvas.getContext("2d");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext).promise;
    const jpgDataUrl = canvas.toDataURL("image/jpeg");
    setJpgUrl(jpgDataUrl);
  };

  const handleNextPage = () => {
    if (currentPage < numPages - 1) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      convertPdfToJpg(nextPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      convertPdfToJpg(prevPage + 1);
    }
  };
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prevZoom => Math.min(prevZoom + 0.1, 3));
    convertPdfToJpg(currentPage + 1);  // Update PDF view when zooming
  }, [setZoomLevel, currentPage]);

  const handleZoomOut = useCallback(() => {
    setZoomLevel(prevZoom => Math.max(prevZoom - 0.1, 0.5));
    convertPdfToJpg(currentPage + 1);  // Update PDF view when zooming out
  }, [setZoomLevel, currentPage]);

  const toggleDrawingMode = useCallback(() => {
    setIsDrawing(prev => !prev);
  }, [setIsDrawing]);

  useEffect(() => {
    setPdfDrawFunctions({
      handleZoomIn,
      handleZoomOut,
      toggleDrawingMode,
      handleMouseZoom,
      undoLastBox,
      redoLastBox,
      resetBoundingBoxes,
    });
  }, [handleZoomIn, handleZoomOut, toggleDrawingMode, setPdfDrawFunctions]);

  const handleMouseZoom = (event) => {
    const delta = event.deltaY < 0 ? 0.1 : -0.1;
    setZoomLevel(prevZoom => Math.min(Math.max(prevZoom + delta, 0.5), 3));
    convertPdfToJpg(currentPage + 1);
  };

  const drawBoundingBoxes = () => {
    const drawingCanvas = drawingCanvasRef.current;
    const context = drawingCanvas.getContext("2d");
    context.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);  // Clear previous drawings

    boundingBoxesRef.current.forEach((box) => {
      context.strokeStyle = 'red';
      context.lineWidth = 2;
      context.strokeRect(box.left, box.top, box.width, box.height);
    });
  };

  const startDrawing = (event) => {
    if (!isDrawing) return;

    const drawingCanvas = drawingCanvasRef.current;
    const canvasRect = drawingCanvas.getBoundingClientRect();
    startCoords.current = {
      x: (event.clientX - canvasRect.left) / zoomLevel,
      y: (event.clientY - canvasRect.top) / zoomLevel,
    };

    document.addEventListener('mousemove', draw);
    document.addEventListener('mouseup', stopDrawing);
  };

  const draw = (event) => {
    if (!startCoords.current) return;

    const drawingCanvas = drawingCanvasRef.current;
    const context = drawingCanvas.getContext("2d");
    const canvasRect = drawingCanvas.getBoundingClientRect();

    const currentX = (event.clientX - canvasRect.left) / zoomLevel;
    const currentY = (event.clientY - canvasRect.top) / zoomLevel;

    const left = Math.min(startCoords.current.x, currentX);
    const top = Math.min(startCoords.current.y, currentY);
    const width = Math.abs(startCoords.current.x - currentX);
    const height = Math.abs(startCoords.current.y - currentY);

    context.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    drawBoundingBoxes();

    context.strokeStyle = 'red';
    context.lineWidth = 2;
    context.strokeRect(left * zoomLevel, top * zoomLevel, width * zoomLevel, height * zoomLevel);
  };

  const stopDrawing = (event) => {
    document.removeEventListener('mousemove', draw);
    document.removeEventListener('mouseup', stopDrawing);

    const drawingCanvas = drawingCanvasRef.current;
    const canvasRect = drawingCanvas.getBoundingClientRect();

    const endX = (event.clientX - canvasRect.left) / zoomLevel;
    const endY = (event.clientY - canvasRect.top) / zoomLevel;

    const left = Math.min(startCoords.current.x, endX);
    const top = Math.min(startCoords.current.y, endY);
    const width = Math.abs(startCoords.current.x - endX);
    const height = Math.abs(startCoords.current.y - endY);

    boundingBoxesRef.current.push({ left, top, width, height });

    drawBoundingBoxes();
    startCoords.current = null;
  };

  const undoLastBox = () => {
    const lastBox = boundingBoxesRef.current.pop();  // Remove the last bounding box
    if (lastBox) {
      redoStackRef.current.push(lastBox); // Add the undone box to the redo stack
    }
    drawBoundingBoxes();  // Redraw remaining bounding boxes
  };

  const redoLastBox = () => {
    const lastRedoBox = redoStackRef.current.pop(); // Remove the last box from redo stack
    if (lastRedoBox) {
      boundingBoxesRef.current.push(lastRedoBox); // Restore it to the bounding boxes
      drawBoundingBoxes(); // Redraw all bounding boxes
    }
  };
  const resetBoundingBoxes = () => {
    boundingBoxesRef.current = [];  // Clear all bounding boxes
    drawBoundingBoxes();  // Clear the canvas
  };

  return (
    <div className="flex flex-col justify-center items-center h-full w-full">
      <canvas ref={pdfCanvasRef} className="hidden" />
      <div className="relative flex flex-col items-center justify-center w-full h-full overflow-hidden">
        <div className="flex justify-between items-center w-full h-full">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="text-white rounded-md hover:bg-gray-500 transition-colors duration-200 flex items-center justify-center ml-4 h-20 w-20"
          >
            <ChevronLeft />
          </button>
          <div
            className="relative flex items-center justify-center w-auto h-auto"
            onWheel={handleMouseZoom}
            onMouseDown={startDrawing}
            style={{ cursor: isDrawing ? 'crosshair' : 'default' }}
          >
            {jpgUrl ? (
              <>
                <img
                  ref={imageRef}
                  src={jpgUrl}
                  alt={`PDF page ${currentPage + 1} as JPG`}
                  className="w-full h-full"
                  style={{ transform: `scale(${zoomLevel})` }}
                />
                <canvas
                  ref={drawingCanvasRef}
                  className="absolute top-0 left-0"
                  width={imageRef.current ? imageRef.current.width * zoomLevel : 0}
                  height={imageRef.current ? imageRef.current.height * zoomLevel : 0}
                />
              </>
            ) : (
              <Document
                file={pdfFileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex items-center justify-center h-full w-full"
              >
                <Page
                  pageNumber={currentPage + 1}
                  renderMode="svg"
                  width={600}
                  renderTextLayer={false}
                />
              </Document>
            )}
          </div>
          <button
            onClick={handleNextPage}
            disabled={currentPage === numPages - 1}
            className="text-white rounded-md hover:bg-gray-500 transition-colors duration-200 flex items-center justify-center mr-4 h-20 w-20"
          >
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PdfDraw;