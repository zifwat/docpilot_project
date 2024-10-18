import { useEffect, useState, useRef, useCallback } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronRight, ChevronLeft } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function PdfDraw({ pdfFileUrl, currentPage, setCurrentPage, boundingData, setZoomLevel, isDrawing, setIsDrawing, setPdfDrawFunctions }) {
  const [numPages, setNumPages] = useState(0);
  const [jpgUrl, setJpgUrl] = useState(null);
  const [zoomLevel, setZoomLevelState] = useState(0.9); // Set initial zoom level to 0.9
  const [zoomPercentage, setZoomPercentage] = useState(90); // Set initial zoom percentage to 90%
  const [showZoomPopup, setShowZoomPopup] = useState(false);
  const pdfCanvasRef = useRef();
  const drawingCanvasRef = useRef();
  const imageRef = useRef();
  const boundingBoxesRef = useRef([]);
  const startCoords = useRef(null);
  const redoStackRef = useRef([]);

  useEffect(() => {
    if (jpgUrl) {
      drawBoundingBoxes();
    }
  }, [jpgUrl]);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    convertPdfToJpg(currentPage + 1);
  }

  const convertPdfToJpg = useCallback(async (pageNumber) => {
    const loadingTask = pdfjs.getDocument(pdfFileUrl);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: zoomLevel });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext).promise;
    const jpgDataUrl = canvas.toDataURL("image/jpeg");
    setJpgUrl(jpgDataUrl);
  }, [pdfFileUrl, zoomLevel]);

  useEffect(() => {
    convertPdfToJpg(currentPage + 1);
  }, [currentPage, zoomLevel, convertPdfToJpg]);

  const handleNextPage = () => {
    if (currentPage < numPages - 1) {
      setCurrentPage(prevPage => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prevPage => prevPage - 1);
    }
  };

  const handleZoomIn = useCallback(() => {
    setZoomLevelState(prevZoom => {
      const newZoom = Math.min(prevZoom + 0.1, 3);
      setZoomPercentage(Math.round(newZoom * 100)); // Update zoom percentage
      setShowZoomPopup(true);
      setTimeout(() => setShowZoomPopup(false), 2000); // Hide popup after 2 seconds
      return newZoom;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevelState(prevZoom => {
      const newZoom = Math.max(prevZoom - 0.1, 0.5);
      setZoomPercentage(Math.round(newZoom * 100)); // Update zoom percentage
      setShowZoomPopup(true);
      setTimeout(() => setShowZoomPopup(false), 2000); // Hide popup after 2 seconds
      return newZoom;
    });
  }, []);

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
    setZoomLevelState(prevZoom => {
      const newZoom = Math.min(Math.max(prevZoom + delta, 0.5), 3);
      setZoomPercentage(Math.round(newZoom * 100)); // Update zoom percentage
      setShowZoomPopup(true);
      setTimeout(() => setShowZoomPopup(false), 2000); // Hide popup after 2 seconds
      return newZoom;
    });
  };

  const drawBoundingBoxes = useCallback(() => {
    const drawingCanvas = drawingCanvasRef.current;
    if (!drawingCanvas) return;

    const context = drawingCanvas.getContext("2d");
    context.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

    boundingBoxesRef.current.forEach((box) => {
      context.strokeStyle = 'red';
      context.lineWidth = 2;
      context.strokeRect(box.left * zoomLevel, box.top * zoomLevel, box.width * zoomLevel, box.height * zoomLevel);
    });
  }, [zoomLevel]);

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

  const draw = useCallback((event) => {
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
  }, [zoomLevel, drawBoundingBoxes]);

  const stopDrawing = useCallback((event) => {
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
  
    // Log the coordinates and dimensions of the bounding box
    console.log("Added bounding box:", { left, top, width, height });  
    boundingBoxesRef.current.push({ left, top, width, height });
  
    drawBoundingBoxes();
    startCoords.current = null;
  }, [zoomLevel, draw, drawBoundingBoxes]);

  const undoLastBox = () => {
    const lastBox = boundingBoxesRef.current.pop();
    if (lastBox) {
      redoStackRef.current.push(lastBox);
    }
    drawBoundingBoxes();
  };

  const redoLastBox = () => {
    const lastRedoBox = redoStackRef.current.pop();
    if (lastRedoBox) {
      boundingBoxesRef.current.push(lastRedoBox);
      drawBoundingBoxes();
    }
  };

  const resetBoundingBoxes = () => {
    boundingBoxesRef.current = [];
    drawBoundingBoxes();
  };

  return (
    <div className="flex flex-col justify-center items-center h-full w-full">
      {showZoomPopup && (
        <div className="absolute top-2 items-center bg-gray-300 text-white p-2 rounded-md shadow-lg">
          Zoom: {zoomPercentage}%
        </div>
      )}
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
            className="relative flex items-center justify-center w-full h-full overflow-hidden"
            onWheel={handleMouseZoom}
            onMouseDown={startDrawing}
            style={{ cursor: isDrawing ? 'crosshair' : 'default' }}
          >
            {jpgUrl && (
              <>
                <img
                  src={jpgUrl}
                  alt={`Page ${currentPage + 1}`}
                  ref={imageRef}
                  style={{ transform: `scale(${zoomLevel})` }}
                  className="absolute"
                />
                <canvas
                  ref={drawingCanvasRef}
                  className="absolute"
                  width={imageRef.current?.naturalWidth * zoomLevel}
                  height={imageRef.current?.naturalHeight * zoomLevel}
                />
              </>
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
