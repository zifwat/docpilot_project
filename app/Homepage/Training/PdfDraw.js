import { useEffect, useState, useRef, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronRight, ChevronLeft } from 'lucide-react';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function PdfDraw({
  pdfFileUrl,
  currentPage,
  setCurrentPage,
  boundingData,
  setZoomLevel,
  isDrawing,
  setIsDrawing,
  setPdfDrawFunctions,
}) {
  const [numPages, setNumPages] = useState(0);
  const [zoomLevel, setZoomLevelState] = useState(0.8); // Start at 80%
  const [zoomPercentage, setZoomPercentage] = useState(80);
  const [showZoomPopup, setShowZoomPopup] = useState(false);
  const [containerDimensions, setContainerDimensions] = useState({
    width: 1,
    height: 1,
  });
  const [naturalPageSize, setNaturalPageSize] = useState({
    width: 1,
    height: 1,
  });

  const containerRef = useRef(null);
  const drawingCanvasRef = useRef(null);
  const startCoords = useRef(null);
  const pageCanvasesRef = useRef({});

  // Store bounding boxes per page
  const [pageBoxes, setPageBoxes] = useState({});
  // Store redo stack per page
  const [redoStacks, setRedoStacks] = useState({});

  // Container size observer
  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setContainerDimensions({ width, height });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  // Initialize page boxes and canvas when new page is loaded or zoom level changes
  useEffect(() => {
    if (!pageBoxes[currentPage]) {
      setPageBoxes((prev) => ({
        ...prev,
        [currentPage]: [],
      }));
    }
    if (!redoStacks[currentPage]) {
      setRedoStacks((prev) => ({
        ...prev,
        [currentPage]: [],
      }));
    }

    if (naturalPageSize.width && naturalPageSize.height) {
      let canvas = pageCanvasesRef.current[currentPage];

      if (!canvas) {
        canvas = document.createElement('canvas');
        pageCanvasesRef.current[currentPage] = canvas;
      }

      const scaledWidth = naturalPageSize.width * zoomLevel;
      const scaledHeight = naturalPageSize.height * zoomLevel;

      canvas.width = naturalPageSize.width; // Use natural dimensions
      canvas.height = naturalPageSize.height;
      canvas.style.width = `${scaledWidth}px`; // Scale via CSS
      canvas.style.height = `${scaledHeight}px`;

      drawingCanvasRef.current = canvas;
      drawBoundingBoxes();
    }
  }, [currentPage, naturalPageSize, zoomLevel]);

  const handlePageLoadSuccess = useCallback(
    (page) => {
      const viewport = page.getViewport({ scale: 1 });
      const { width, height } = viewport;
      setNaturalPageSize({ width, height });

      const canvas = pageCanvasesRef.current[currentPage];
      if (canvas) {
        const scaledWidth = width * zoomLevel;
        const scaledHeight = height * zoomLevel;

        canvas.width = naturalPageSize.width; // Use natural dimensions
        canvas.height = naturalPageSize.height;
        canvas.style.width = `${scaledWidth}px`; // Scale via CSS
        canvas.style.height = `${scaledHeight}px`;
        drawBoundingBoxes();
      }
    },
    [currentPage, zoomLevel, naturalPageSize.width],
  );

  // Drawing functions
  const drawBoundingBoxes = useCallback(() => {
    const drawingCanvas = pageCanvasesRef.current[currentPage];
    if (!drawingCanvas || !pageBoxes[currentPage]) return;

    const context = drawingCanvas.getContext('2d');
    context.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);

    // Scale factor for redrawing boxes
    const scaleX = drawingCanvas.width / naturalPageSize.width;
    const scaleY = drawingCanvas.height / naturalPageSize.height;

    pageBoxes[currentPage].forEach((box) => {
      const { polygon } = box;
      context.strokeStyle = 'red';
      context.lineWidth = 2;
      context.beginPath();

      // Scale the coordinates
      const scaledPolygon = polygon.map((point) => ({
        x: point.x * scaleX,
        y: point.y * scaleY,
      }));

      context.moveTo(scaledPolygon[0].x, scaledPolygon[0].y);
      scaledPolygon.forEach((point, index) => {
        const nextPoint = scaledPolygon[(index + 1) % scaledPolygon.length];
        context.lineTo(nextPoint.x, nextPoint.y);
      });
      context.closePath();
      context.stroke();
    });
  }, [currentPage, pageBoxes, naturalPageSize]);

  const startDrawing = useCallback(
    (event) => {
      if (!isDrawing) return;

      const drawingCanvas = pageCanvasesRef.current[currentPage];
      const canvasRect = drawingCanvas.getBoundingClientRect();

      // Calculate scale relative to natural page size
      const scaleX = naturalPageSize.width / canvasRect.width;
      const scaleY = naturalPageSize.height / canvasRect.height;

      startCoords.current = {
        x: (event.clientX - canvasRect.left) * scaleX,
        y: (event.clientY - canvasRect.top) * scaleY,
      };

      document.addEventListener('mousemove', draw);
      document.addEventListener('mouseup', stopDrawing);
    },
    [isDrawing, currentPage, naturalPageSize],
  );

  const draw = useCallback(
    (event) => {
      if (!startCoords.current) return;

      const drawingCanvas = pageCanvasesRef.current[currentPage];
      const context = drawingCanvas.getContext('2d');
      const canvasRect = drawingCanvas.getBoundingClientRect();

      // Calculate scale relative to natural page size
      const scaleX = naturalPageSize.width / canvasRect.width;
      const scaleY = naturalPageSize.height / canvasRect.height;

      const currentX = (event.clientX - canvasRect.left) * scaleX;
      const currentY = (event.clientY - canvasRect.top) * scaleY;

      context.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
      drawBoundingBoxes();

      // Scale the drawing coordinates
      const scaledStartX =
        startCoords.current.x * (drawingCanvas.width / naturalPageSize.width);
      const scaledStartY =
        startCoords.current.y * (drawingCanvas.height / naturalPageSize.height);
      const scaledCurrentX =
        currentX * (drawingCanvas.width / naturalPageSize.width);
      const scaledCurrentY =
        currentY * (drawingCanvas.height / naturalPageSize.height);

      const left = Math.min(scaledStartX, scaledCurrentX);
      const top = Math.min(scaledStartY, scaledCurrentY);
      const width = Math.abs(scaledStartX - scaledCurrentX);
      const height = Math.abs(scaledStartY - scaledCurrentY);

      context.strokeStyle = 'red';
      context.lineWidth = 2;
      context.strokeRect(left, top, width, height);
    },
    [currentPage, drawBoundingBoxes, naturalPageSize],
  );

  const stopDrawing = useCallback(
    (event) => {
      document.removeEventListener('mousemove', draw);
      document.removeEventListener('mouseup', stopDrawing);

      if (!startCoords.current) return;

      const drawingCanvas = pageCanvasesRef.current[currentPage];
      const canvasRect = drawingCanvas.getBoundingClientRect();

      // Calculate scale relative to natural page size
      const scaleX = naturalPageSize.width / canvasRect.width;
      const scaleY = naturalPageSize.height / canvasRect.height;

      const endX = (event.clientX - canvasRect.left) * scaleX;
      const endY = (event.clientY - canvasRect.top) * scaleY;

      const x_min = Math.min(startCoords.current.x, endX);
      const x_max = Math.max(startCoords.current.x, endX);
      const y_min = Math.min(startCoords.current.y, endY);
      const y_max = Math.max(startCoords.current.y, endY);

      const newBox = {
        content: '',
        polygon: [
          { x: x_min, y: y_min },
          { x: x_max, y: y_min },
          { x: x_max, y: y_max },
          { x: x_min, y: y_max },
        ],
        spans: [],
        pageNumber: currentPage,
      };

      // Log coordinates and page number
      console.log(`Bounding Box created on Page ${currentPage + 1}:`, {
        pageWidth: containerDimensions.width,
        pageHeight: containerDimensions.height,
        coordinates: {
          1: { x: x_min.toFixed(2), y: y_min.toFixed(2) },
          2: { x: x_max.toFixed(2), y: y_min.toFixed(2) },
          3: { x: x_max.toFixed(2), y: y_max.toFixed(2) },
          4: { x: x_min.toFixed(2), y: y_max.toFixed(2) }
        }
      });

      setPageBoxes((prev) => ({
        ...prev,
        [currentPage]: [...(prev[currentPage] || []), newBox],
      }));

      setRedoStacks((prev) => ({
        ...prev,
        [currentPage]: [],
      }));

      drawBoundingBoxes();
      startCoords.current = null;
    },
    [currentPage, naturalPageSize],
  );

  // Navigation functions
  const handleNextPage = () => {
    if (currentPage < numPages - 1) {
      setCurrentPage((prevPage) => prevPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  // Zoom functions
  const handleZoomIn = useCallback(() => {
    setZoomLevelState((prevZoom) => {
      const newZoom = prevZoom + 0.1;
      const cappedZoom = Math.min(newZoom, 3); // Upper limit at 300%
      setZoomPercentage(Math.round(cappedZoom * 100));
      setShowZoomPopup(true);
      setTimeout(() => setShowZoomPopup(false), 2000);
      return cappedZoom;
    });
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomLevelState((prevZoom) => {
      const newZoom = prevZoom - 0.1;
      const cappedZoom = Math.max(newZoom, 0.7); // Lower limit at 70%
      setZoomPercentage(Math.round(cappedZoom * 100));
      setShowZoomPopup(true);
      setTimeout(() => setShowZoomPopup(false), 2000);
      return cappedZoom;
    });
  }, []);

  const handleMouseZoom = useCallback((event) => {
    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.1 : -0.1;
    setZoomLevelState((prevZoom) => {
      const newZoom = prevZoom + delta;
      const cappedZoom = Math.min(Math.max(newZoom, 0.7), 3); // Limits between 70% and 300%
      setZoomPercentage(Math.round(cappedZoom * 100));
      setShowZoomPopup(true);
      setTimeout(() => setShowZoomPopup(false), 2000);
      return cappedZoom;
    });
  }, []);


  // Update canvas dimensions on zoom level change
  useEffect(() => {
    const canvas = pageCanvasesRef.current[currentPage];
    if (canvas && naturalPageSize.width && naturalPageSize.height) {
      const scaledWidth = naturalPageSize.width * zoomLevel;
      const scaledHeight = naturalPageSize.height * zoomLevel;

      canvas.style.width = `${scaledWidth}px`;
      canvas.style.height = `${scaledHeight}px`;
      drawBoundingBoxes();
    }
  }, [zoomLevel, currentPage, naturalPageSize, drawBoundingBoxes]);

  // Set up PDF draw functions
  useEffect(() => {
    setPdfDrawFunctions({
      handleZoomIn,
      handleZoomOut,
      handleMouseZoom,
      undoLastBox: () => {
        setPageBoxes((prev) => {
          const currentBoxes = prev[currentPage] || [];
          if (currentBoxes.length === 0) return prev;

          const lastBox = currentBoxes[currentBoxes.length - 1];
          setRedoStacks((redoPrev) => ({
            ...redoPrev,
            [currentPage]: [...(redoPrev[currentPage] || []), lastBox],
          }));

          return {
            ...prev,
            [currentPage]: currentBoxes.slice(0, -1),
          };
        });
        drawBoundingBoxes();
      },
      redoLastBox: () => {
        const currentRedoStack = redoStacks[currentPage] || [];
        if (currentRedoStack.length === 0) return;

        setRedoStacks((prev) => ({
          ...prev,
          [currentPage]: prev[currentPage].slice(0, -1),
        }));

        setPageBoxes((prev) => ({
          ...prev,
          [currentPage]: [
            ...(prev[currentPage] || []),
            currentRedoStack[currentRedoStack.length - 1],
          ],
        }));

        drawBoundingBoxes();
      },
      resetBoundingBoxes: () => {
        setPageBoxes((prev) => ({
          ...prev,
          [currentPage]: [],
        }));
        setRedoStacks((prev) => ({
          ...prev,
          [currentPage]: [],
        }));
        drawBoundingBoxes();
      },
      toggleDrawingMode: () => setIsDrawing((prev) => !prev),
      getCurrentPageBoxes: () => pageBoxes[currentPage] || [],
      getAllBoxes: () => pageBoxes,
    });
  }, [
    handleZoomIn,
    handleZoomOut,
    handleMouseZoom,
    setIsDrawing,
    pageBoxes,
    currentPage,
    redoStacks,
    drawBoundingBoxes,
  ]);

  return (
    <div className="flex justify-center items-center w-full h-full">
      {/* 3-Column Layout */}
      <div className="flex flex-row justify-center items-center w-full h-full">

        {/* Left Column */}
        <div className="bg-gray-800 flex flex-col justify-center items-center h-full p-4 z-10">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className={`text-white rounded-md hover:bg-gray-500 transition-colors duration-200 flex items-center justify-center h-20 w-12 ${currentPage === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ChevronLeft size={24} />
          </button>
        </div>

        {/* Center Column (PDF Viewer and Canvas) */}
        <div className="flex flex-col justify-center items-center h-full w-full relative overflow-hidden">
          {/* PDF and Canvas Viewer */}
          <div className="relative w-full h-full overflow-hidden">
            {showZoomPopup && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black text-white p-2 rounded z-30">
                Zoom Level: {zoomPercentage}%
              </div>
            )}

            <div
              className="zoomable-content w-full h-full"  // Ensure it takes full width and height
              onWheel={handleMouseZoom}
              style={{
                transform: `scale(${zoomLevel})`,  // Apply scaling to the content
                transformOrigin: 'center', // Center the zoom
                position: 'relative', // Position relatively to allow scaling
                top: '50%',
                left: '50%',
                width: `${naturalPageSize.width}px`,  // Set width based on natural size
                height: `${naturalPageSize.height}px`,  // Set height based on natural size
                marginTop: `-${(naturalPageSize.height * zoomLevel) / 2}px`, // Center vertically
                marginLeft: `-${(naturalPageSize.width * zoomLevel) / 2}px`, // Center horizontally
              }}
            >
              <Document
                className="zoomable-content h-full w-96"
                file={pdfFileUrl}
                onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              >
                <Page
                  pageNumber={currentPage + 1}
                  scale={zoomLevel}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  onLoadSuccess={handlePageLoadSuccess}
                />
              </Document>

              {/* Canvas overlay for drawing */}
              <canvas
                ref={(canvas) => {
                  if (canvas) {
                    pageCanvasesRef.current[currentPage] = canvas;
                    drawingCanvasRef.current = canvas;
                    canvas.width = naturalPageSize.width; // Use natural dimensions
                    canvas.height = naturalPageSize.height;
                    drawBoundingBoxes();
                  }
                }}
                onMouseDown={startDrawing}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  cursor: isDrawing ? 'crosshair' : 'default',
                  pointerEvents: isDrawing ? 'auto' : 'none',
                  zIndex: 1,
                }}
              />
            </div>
          </div>

          {/* Page Number Indicator */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded">
            Page {currentPage + 1} of {numPages}
          </div>
        </div>


        {/* Right Column */}
        <div className="bg-gray-800 flex flex-col h-full justify-center items-center p-4 z-10">
          <button
            onClick={handleNextPage}
            disabled={currentPage === numPages - 1}
            className={`text-white rounded-md hover:bg-gray-500 transition-colors duration-200 flex items-center justify-center h-20 w-12 ${currentPage === numPages - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default PdfDraw;