import { useEffect, useState } from "react";
import { Document, Page } from "react-pdf";

function PdfComp(props) {
  const [numPages, setNumPages] = useState();

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  useEffect(() => {
    console.log("PDF URL:", props.pdfFileUrl);
  }, [props.pdfFileUrl]);

  return (
    <div className="flex justify-center items-center">
      <Document
        file={props.pdfFileUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        className="flex items-center justify-center h-full w-full "
      >
        <Page
          pageNumber={props.currentpage + 1} // React-PDF uses 1-based page numbers
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="w-auto h-auto max-w-full max-h-full object-contain" // Ensures the page fits within the container
        />
      </Document>
    </div>
  );
}

export default PdfComp;
