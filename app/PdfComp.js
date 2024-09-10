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
    <div className="h-full overflow-auto">
      <Document file={props.pdfFileUrl} onLoadSuccess={onDocumentLoadSuccess}>
        <Page
          pageNumber={props.currentpage + 1} // React-PDF uses 1-based page numbers
          renderTextLayer={false}
          renderAnnotationLayer={false}
        />
      </Document>
    </div>
  );
}

export default PdfComp;
