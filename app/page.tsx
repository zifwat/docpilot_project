"use client";

import React, { useState } from "react";
import { Menu } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { CButton } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilCloudUpload, cilXCircle } from "@coreui/icons";
import { PDFDocument } from "pdf-lib";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
// import axios from "axios";

const Main: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePages, setFilePages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFileType, setSelectedFileType] = useState<string>("Select File Type");
  const [fileContent, setFileContent] = useState<string>("");
  const [isFileUploaded, setIsFileUploaded] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<string[]>([]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      await processPDF(file);
      setIsFileUploaded(true);
    }
  };

  const processPDF = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const totalPages = pdfDoc.getPageCount();
    setFilePages(totalPages);
    setCurrentPage(0);
    showPage(0);
  };

  const showPage = async (pageIndex: number) => {
    if (selectedFile) {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const page = pdfDoc.getPage(pageIndex);
      setFileContent(`Page ${pageIndex + 1} - ${page.getWidth()}x${page.getHeight()}`);
    }
  };

  const handleNextPage = () => {
    if (currentPage < filePages - 1) {
      setCurrentPage(currentPage + 1);
      showPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      showPage(currentPage - 1);
    }
  };

  const handleFileTypeChange = (fileType: string) => {
    setSelectedFileType(fileType);
    localStorage.setItem("selectedFileType", fileType);
  };

  const triggerFileInput = () => {
    document.getElementById("file-upload")?.click();
  };

  const handleExtract = async () => {
    if (selectedFile) {
      try {
        const response = await axios.post("/api/extract", {
          file: selectedFile,
          fileType: selectedFileType,
        });

        setExtractedData(response.data.extractedContent);
      } catch (error) {
        console.error("Error extracting data:", error);
      }
    }
  };

  const handleResetFile = () => {
    setSelectedFile(null);
    setFileContent("");
    setCurrentPage(0);
    setIsFileUploaded(false);
  };

  const MyPDFViewer: React.FC<{ fileUrl: string }> = ({ fileUrl }) => {
    const defaultLayoutPluginInstance = defaultLayoutPlugin();

    return (
      <div className="h-full">
        <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.6.210/build/pdf.worker.min.js`}>
          <Viewer fileUrl={fileUrl} plugins={[defaultLayoutPluginInstance]} />
        </Worker>
      </div>
    );
  };

  return (
    <div className="flex w-full bg-gray-900 text-white" style={{ height: "88.99vh" }}>
      {/* Left Column: 25% */}
      <div className="bg-gray-800 p-4 h-full flex flex-col justify-between" style={{ width: "25%" }}>
        {!isFileUploaded ? (
          <div
            className="w-full h-full shadow-lg bg-gray-900 text-white rounded flex flex-col justify-center items-center relative cursor-pointer"
            onClick={triggerFileInput}
          >
            <CIcon icon={cilCloudUpload} size="custom-size" className="w-20 h-20 text-white mb-2" />
            <p className="text-center font-bold text-xl">Upload Your File Here (.pdf) </p>
            <input type="file" id="file-upload" onChange={handleFileChange} className="hidden" />
          </div>

        ) : (
          <div className="relative p-2 rounded bg-gray-800 w-full h-full flex flex-col justify-between">
            <CIcon
              icon={cilXCircle}
              size="3xl"
              className="absolute top-2 right-2 text-red-400 h-8 cursor-pointer"
              onClick={handleResetFile}
            />
            <div className="p-4 border border-gray-600 rounded bg-gray-900 flex-grow">
              {selectedFile && <MyPDFViewer fileUrl={URL.createObjectURL(selectedFile)} />}
            </div>
            <div className="flex justify-between items-center mt-4">
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0}
                className="bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-400"
              >
                Prev
              </button>
              <span>
                Page {currentPage + 1} of {filePages}
              </span>
              <button
                onClick={handleNextPage}
                disabled={currentPage === filePages - 1}
                className="bg-cyan-500 text-white px-4 py-2 rounded hover:bg-cyan-400"
              >
                Next
              </button>
            </div>
          </div>
        )}
        <div className="flex flex-col mt-4">
          <Menu as="div" className="relative w-full">
            <Menu.Button className="bg-cyan-600 shadow-lg text-white px-4 py-2 rounded flex items-center justify-between hover:bg-cyan-500 w-full cursor-pointer">
              <span className="flex-1 text-center">{selectedFileType}</span>
              <ChevronDownIcon className="w-5 h-5 ml-2" />
            </Menu.Button>

            <Menu.Items className="absolute right-0 mt-2 origin-top-right w-full bg-gray-800 border border-gray-600 rounded shadow-lg">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handleFileTypeChange("Business Card")}
                    className={`block px-4 py-2 text-white w-full text-left ${active ? "bg-cyan-700" : ""} cursor-pointer`}
                  >
                    Business Card
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handleFileTypeChange("Resume")}
                    className={`block px-4 py-2 text-white w-full text-left ${active ? "bg-cyan-700" : ""} cursor-pointer`}
                  >
                    Resume
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handleFileTypeChange("Receipt")}
                    className={`block px-4 py-2 text-white w-full text-left ${active ? "bg-cyan-700" : ""} cursor-pointer`}
                  >
                    Receipt
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handleFileTypeChange("Certificate")}
                    className={`block px-4 py-2 text-white w-full text-left ${active ? "bg-cyan-700" : ""} cursor-pointer`}
                  >
                    Certificate
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>

          <CButton
            className="bg-cyan-600 text-white w-full py-2 mt-4 rounded hover:bg-cyan-500 shadow-lg"
            onClick={handleExtract}
            disabled={!selectedFile || selectedFileType === "Select File Type"}
          >
            Extract
          </CButton>
        </div>
      </div>

      {/* Right Column: 75% */}
      <div className="bg-gray-900 text-white p-4 overflow-auto h-full" style={{ width: "75%" }}>
        <div className="p-4 border border-gray-600 rounded bg-gray-900 h-full overflow-auto">
          {!isFileUploaded ? (
            <p>No file has been uploaded.</p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {extractedData.length > 0 ? (
                extractedData.map((content, index) => (
                  <div key={index} className="bg-gray-800 p-4 rounded shadow">
                    {content}
                  </div>
                ))
              ) : (
                <p>No extracted content available.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Main;
