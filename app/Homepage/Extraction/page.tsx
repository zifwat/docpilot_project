"use client";

import React, { useState } from "react";
import { Menu } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/solid"; // Make sure this is uncommented
import { CButton } from "@coreui/react";
import CIcon from "@coreui/icons-react";
import { cilCloudUpload } from "@coreui/icons";
import { PDFDocument } from "pdf-lib";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { BiSolidXCircle } from "react-icons/bi";
import { TailSpin } from 'react-loader-spinner';
import PdfComp from './PdfComp';
import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Main: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePages, setFilePages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFileType, setSelectedFileType] = useState<string>("Select File Type");
  const [fileContent, setFileContent] = useState<string>("");
  const [isFileUploaded, setIsFileUploaded] = useState<boolean>(false);
  const [extractedData, setExtractedData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState("");
  const [pdfFile, setPdfFile] = useState<string | null>(null);
  const [boundingData, setBoundingData] = useState<Record<string, any>>({});
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const getBoundingBoxStyle = ("");

  const handleModalOpen = () => {
    setIsModalOpen(true);
  }

  const handleModalClose = () => {
    setIsModalOpen(false);
  };
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      await processPDF(file);
      setIsFileUploaded(true);
      setPdfFile(URL.createObjectURL(file));
    }
  };
  const groupDataByKey = (data: Record<string, string | string[]>) => {
    const groupedData: Record<string, string[]> = {};
    Object.entries(data).forEach(([key, value]) => {
      const parts = key.split("_");
      const firstPart = parts[0];
      const lastPart = parts[parts.length - 1];
      if (!groupedData[firstPart]) {
        groupedData[firstPart] = [];
      }
      if (Array.isArray(value)) {
        value.forEach((v) => groupedData[firstPart].push(`${lastPart}: ${v}`));
      } else {
        groupedData[firstPart].push(`${lastPart}: ${value}`);
      }
    });
    return groupedData;
  };
  const processPDF = async (file: File) => {
    console.log('Processing PDF...');
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const totalPages = pdfDoc.getPageCount();
    setFilePages(totalPages);
    setCurrentPage(0);
    showPage(0);
    console.log('PDF processed successfully!');
  };
  const showPage = async (pageIndex: number) => {
    if (selectedFile) {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const page = pdfDoc.getPage(pageIndex);
      setFileContent(`Page ${pageIndex + 1} - ${page.getWidth()}x${page.getHeight()}`);
    }
  };
  const handleFileTypeChange = (fileType: string) => {
    setSelectedFileType(fileType);
    localStorage.setItem("selectedFileType", fileType);
  };
  const triggerFileInput = () => {
    document.getElementById("file-upload")?.click();
  };

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev + 0.1, 3)); // Maximum zoom level 3
  };
  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev - 0.1, 0.5)); // Minimum zoom level 0.5
  };
  const handleExtract = async () => {
    if (!selectedFile) {
      setError("Please select a file");
      handleModalOpen();
      return;
    }
    if (!selectedFileType) {
      setError("Please select a file type");
      handleModalOpen();
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("input", selectedFile);
      formData.append("fileType", selectedFileType);
      const response = await fetch("http://localhost:3002/api/send-document", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        console.log("data :", data);
        const boundingData = data;
        const newBoundingData: Record<string, any> = {};
        Object.keys(data).forEach((key) => {
          if (key.includes("pageNumber") || key.includes("boundingRegion")) {
            newBoundingData[key] = data[key];
          }
        });
        setBoundingData(newBoundingData);
        console.log("boundingbox :", newBoundingData);

        const filteredData = Object.fromEntries(
          Object.entries(data)
            .filter(([key]) => key.endsWith("_value"))
            .map(([key, value]) => [key.replace(/_value/g, ""), value])
        );
        setExtractedData(filteredData);
        console.log("Filtered Extracted Data:", filteredData);
      } else {
        setError("Failed to upload file");
        handleModalOpen();
        console.error("Failed to upload file:", response.statusText);
      }
    } catch (error) {
      setError("Error extracting data");
      handleModalOpen();
      console.error("Error extracting data:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleFileDrop = async (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    if (files && files[0]) {
      const file = files[0];
      setSelectedFile(file);
      await processPDF(file);
      setIsFileUploaded(true);
    }
  };
  const handleResetFile = () => {
    setSelectedFile(null);
    setFileContent("");
    setCurrentPage(0);
    setIsFileUploaded(false);
    setExtractedData({});
    setBoundingData({});
    setZoomLevel(1);
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
  const flattenAndJoinArray = (value: any[]): string => {
    const MAX_DISPLAY_ITEMS = 4;
    const flattened = value.flat(Infinity);
    const displayItems = flattened.slice(0, MAX_DISPLAY_ITEMS);
    const additionalCount = flattened.length - MAX_DISPLAY_ITEMS;
    return displayItems.join(", ") + (additionalCount > 0 ? `, and ${additionalCount} more` : "");
  };
  return (
    <div className="flex flex-row gap-4 m-2">
      <div className="flex flex-col gap-4 h-[84vh] w-[40%] m-2">
        <span className="flex pl-2 justiy-start items-start font-bold text-lg mt-2 text-black">File Extracted</span>
        <div className="w-full h-full border-4 border-teal-700 border-dotted text-gray-300 rounded-lg flex flex-col justify-center items-center relative cursor-pointer transition-all duration-300 hover:bg-gray-750 ">
          {!isFileUploaded ? (
            <div
              className="w-full h-full text-gray-300 rounded-lg flex flex-col justify-center items-center relative cursor-pointer transition-all duration-300 hover:bg-gray-750"
              onClick={triggerFileInput}
              onDrop={handleFileDrop}
              onDragOver={(event) => event.preventDefault()}>
              <CIcon icon={cilCloudUpload} size="custom-size" className="w-16 h-16 items-center text-[#4eadaf] mb-4" />
              <p className="text-center text-lg font-semibold mb-2 text-[#4eadaf]">Upload Your File</p>
              <p className="text-center text-sm text-[#4eadaf]">(.PDF only)</p>
              <input type="file" id="file-upload" onChange={handleFileChange} className="hidden" accept=".pdf" />
            </div>
          ) : (
            <div className="rounded-lg bg-transparent h-full w-full ">
              <div className="grid grid-rows-[auto_1fr_auto] grid-cols-[auto_1fr_auto] h-full w-full">
                <div className="col-span-3 flex justify-end p-2">
                  {selectedFile && (
                    <button
                      className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                      onClick={handleResetFile}>
                      <BiSolidXCircle className="w-8 h-8" />
                    </button>
                  )}
                </div>
                <div className="col-start-2 row-start-2 flex items-center justify-center">
                  {selectedFile && (
                    <div className="flex flex-col items-center justify-center w-full h-full max-w-full max-h-full overflow-hidden">
                      <PdfComp
                        pdfFileUrl={pdfFile}
                        currentPage={currentPage}
                        boundingData={boundingData}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-4 text-white h-[84vh] w-[60%] m-2">
        <span className="flex pl-2 justiy-start items-start font-bold text-lg mt-2 text-black">File Extracted</span>
        <div className="flex flex-rol gap-4 w-full">
          <Menu as="div" className="relative w-full">
            <Menu.Button className="bg-[#4eadaf] shadow-lg text-white px-4 py-2 rounded flex items-center justify-between hover:bg-teal-700 w-full cursor-pointer">
              <span className="flex-1 pl-[29px] text-center">{selectedFileType}</span>
              <ChevronDownIcon className="w-5 h-5 ml-2" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 top-full mb-2 w-48 origin-top-right shadow-lg bg-[#4eadaf] rounded">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handleFileTypeChange("Business Card")}
                    className={`block px-4 py-2  bg-white border w-full text-black text-left ${active ? "bg-[#d2e0e2]" : ""} cursor-pointer`}>
                    Business Card
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handleFileTypeChange("Resume")}
                    className={`block px-4 py-2 bg-white border w-full text-black text-left ${active ? "bg-[#d2e0e2]" : ""} cursor-pointer`}>
                    Resume
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={() => handleFileTypeChange("Invoice")}
                    className={`block px-4 py-2 bg-white border w-full text-black text-left ${active ? "bg-[#d2e0e2]" : ""} cursor-pointer`}>
                    Invoice
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
          <CButton
            className="bg-[#4eadaf] text-white w-full py-2 rounded hover:bg-teal-700 shadow-lg"
            onClick={handleExtract}>
            Extract
          </CButton>
          {isModalOpen && (
            <div className="fixed top-0 left-0 w-full h-full bg-[#d2e0e2] bg-opacity-50 flex justify-center items-center">
              <div className="bg-white rounded p-6 w-60">
                <h2 className="text-lg text-black font-bold mb-2">{error ? "Error" : "Please select a file to extract"}</h2>
                {error ? (
                  <p className='pb-3' style={{ color: "black" }}>
                    {error === "Please select a file" ? error : error === "Please select a file type" ? error : "Please select a file type"}
                  </p>
                ) : (
                  <p className='text-black'>Please select a file to extract</p>
                )}
                <button
                  className="bg-red-600 text-white px-5 py-2 rounded hover:bg-red-900"
                  onClick={handleModalClose}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col bg-[#d2e0e2] rounded-lg shadow-xl h-[85vh] w-full overflow-hidden">

          {loading ? (
            <div className="flex justify-center items-center h-full">
              <TailSpin height="50" width="50" color="#4eadaf" ariaLabel="loading" />
            </div>
          ) : Object.keys(extractedData).length === 0 ? (
            <p className="flex justify-center items-center text-teal-700 p-4 h-full">No file uploaded.</p>
          ) : (
            <div className="p-4 border border-gray-600 bg-white h-full overflow-y-scroll">
              <div className="space-y-6">
                {Object.entries(groupDataByKey(extractedData)).map(([key, values]) => (
                  <div key={key} className="flex items-center p-2 border text-black border-gray-600 rounded bg-[#d2e0e2]">
                    <div className="flex-shrink-0 w-1/3">
                      <h3 className="flex font-bold text-lg whitespace-normal break-words overflow-hidden">
                        {key}
                      </h3>
                    </div>
                    <div className="flex-1 ml-4">
                      {values.length > 1 ? (
                        <table className="w-full">
                          <tbody>
                            {values.map((value, index) => {
                              const [lastPart, ...rest] = value.split(": ");
                              const actualValue = rest.join(": ");
                              return (
                                <tr key={index}>
                                  <td className="border border-gray-600 p-2">{lastPart}</td>
                                  <td className="border border-gray-600 p-2">{actualValue}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      ) : (
                        <p>{values[0].split(": ").slice(1).join(": ")}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
export default Main;