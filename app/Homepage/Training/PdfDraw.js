import { useEffect, useState, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { PencilIcon } from '@heroicons/react/solid'; // Import PencilIcon if not already imported

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

function PdfDraw(props) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [jpgUrl, setJpgUrl] = useState(null);
  const canvasRef = useRef();
  const imageRef = useRef();
  const [scale, setScale] = useState(0.8);
  const [drawing, setDrawing] = useState(false);
  const [drawnLines, setDrawnLines] = useState([]);
  const [objectColorMap, setObjectColorMap] = useState({}); // Add this line to define objectColorMap


  useEffect(() => {
    if (props.boundingData && Object.keys(props.boundingData).length > 0 && jpgUrl) {
      drawBoundingBoxes();
    }
  }, [props.boundingData, currentPage, jpgUrl]);

  useEffect(() => {
    if (drawing) {
      const canvas = canvasRef.current;
      canvas.addEventListener('mousedown', startDrawing);
      canvas.addEventListener('mousemove', draw);
      canvas.addEventListener('mouseup', stopDrawing);
      canvas.addEventListener('mouseout', stopDrawing);
      
      // Cleanup event listeners on unmount
      return () => {
        canvas.removeEventListener('mousedown', startDrawing);
        canvas.removeEventListener('mousemove', draw);
        canvas.removeEventListener('mouseup', stopDrawing);
        canvas.removeEventListener('mouseout', stopDrawing);
      };
    }
  }, [drawing]);

  function startDrawing(e) {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    context.beginPath();
    context.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setDrawnLines(prev => [...prev, { x: e.clientX - rect.left, y: e.clientY - rect.top, isDrawing: true }]);
  }

  function draw(e) {
    if (!drawing) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    context.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    context.stroke();
    setDrawnLines(prev => [...prev, { x: e.clientX - rect.left, y: e.clientY - rect.top, isDrawing: true }]);
  }

  function stopDrawing() {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    context.closePath();
    setDrawing(false);
  }

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    convertPdfToJpg(currentPage + 1);
  }

  const convertPdfToJpg = async (pageNumber) => {
    const loadingTask = pdfjs.getDocument(props.pdfFileUrl);
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale });
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

  const getBoundingBoxStyle = (boundingPolygon) => {
    const scaleFactor = 72 * scale;
    const xValues = boundingPolygon.map(point => point.x);
    const yValues = boundingPolygon.map(point => point.y);
    const minX = Math.min(...xValues);
    const minY = Math.min(...yValues);
    const maxX = Math.max(...xValues);
    const maxY = Math.max(...yValues);
    const width = maxX - minX;
    const height = maxY - minY;
    return {
      left: `${minX * scaleFactor}px`,
      top: `${minY * scaleFactor}px`,
      width: `${width * scaleFactor}px`,
      height: `${height * scaleFactor}px`,
      zIndex: 10,
      position: 'absolute',
      border: '2px solid red',
      pointerEvents: 'none',
    };
  };

  const drawBoundingBoxes = () => {
    if (!props.boundingData || !jpgUrl) return;
    removeExistingBoundingBoxes();
    const newColorMap = { ...objectColorMap }; // Now this will be defined
    Object.entries(props.boundingData).forEach(([key, itemArray]) => {
      const objectName = key.split('_')[0];
      let objectColor;
      if (!newColorMap[objectName]) {
        objectColor = getRandomColor();
        newColorMap[objectName] = objectColor;
      } else {
        objectColor = newColorMap[objectName];
      }
      itemArray.forEach((item) => {
        if (item.pageNumber === currentPage + 1 && item.polygon && item.polygon.length === 4) {
          const boundingBoxStyle = getBoundingBoxStyle(item.polygon);
          boundingBoxStyle.border = `2px solid ${objectColor}`;
          const boundingBox = document.createElement('div');
          boundingBox.className = "bounding-box";
          Object.assign(boundingBox.style, boundingBoxStyle);
          imageRef.current.parentElement.appendChild(boundingBox);
        }
      });
    });
    setObjectColorMap(newColorMap);
  };

  const removeExistingBoundingBoxes = () => {
    const boundingBoxes = document.querySelectorAll('.bounding-box');
    boundingBoxes.forEach(box => box.remove());
  };

  return (
    <div className="flex flex-col justify-center items-center h-full w-full">
      <canvas ref={canvasRef} className="hidden" />
      <div className="relative flex flex-col items-center justify-center w-full h-full overflow-hidden">
        <div className="flex justify-between items-center w-full h-full">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="text-white rounded-md hover:bg-gray-500 transition-colors duration-200 flex items-center justify-center ml-4 h-20 w-20"
          >
            <ChevronLeft />
          </button>
          <div className="relative flex items-center justify-center w-auto h-auto">
            {jpgUrl ? (
              <>
                <img
                  ref={imageRef}
                  src={jpgUrl}
                  alt={`PDF page ${currentPage + 1} as JPG`}
                  className="w-full h-full "
                  style={{ transform: 'scale(1.0)' }}
                  onLoad={drawBoundingBoxes}
                />
              </>
            ) : (
              <Document
                file={props.pdfFileUrl}
                onLoadSuccess={onDocumentLoadSuccess}
                className="flex items-center justify-center h-full w-full"
              >
                <Page
                  pageNumber={currentPage + 1}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  className="w-auto h-auto object-contain"
                />
              </Document>
            )}
          </div>
          <button
            onClick={handleNextPage}
            disabled={currentPage === numPages - 1}
            className="text-white rounded-md hover:bg-gray-500 transition-colors duration-200 flex items-center justify-center mr-4 h-20 w-20">
            <ChevronRight />
          </button>
        </div>
        <div className="m-5 text-white">
          <span>
            Page {currentPage + 1} of {numPages}
          </span>
        </div>
        {/* Draw Button */}
        <button 
          onClick={() => setDrawing(!drawing)} // Toggle drawing mode
          className="flex justify-center items-center w-16 h-16 bg-gray-500 hover:bg-gray-600 rounded-lg m-4"
        >
          <PencilIcon className="h-6 w-6 text-white" />
        </button>
      </div>
    </div>
  );
}

export default PdfDraw;
