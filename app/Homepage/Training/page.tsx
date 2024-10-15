"use client";

import React, { useState } from "react";
import CIcon from "@coreui/icons-react";
import { cilCloudUpload } from "@coreui/icons";
import { PDFDocument } from "pdf-lib";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { BiSolidXCircle } from "react-icons/bi";
import PdfDraw from './PdfDraw';
import { pdfjs } from 'react-pdf';
import { PencilIcon } from '@heroicons/react/outline';
import { ZoomInIcon, ZoomOutIcon, ScanIcon } from "lucide-react";

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
    const [isDrawing, setIsDrawing] = useState(false);

    const toggleDrawingMode = () => {
        console.log('Toggled Drawing Mode');
    };

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

    const handleZoomIn = () => {
        setZoomLevel((prev) => Math.min(prev + 0.1, 3)); // Maximum zoom level 3
    };

    const handleZoomOut = () => {
        setZoomLevel((prev) => Math.max(prev - 0.1, 0.5)); // Minimum zoom level 0.5
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
                const boundingData = data;
                const newBoundingData: Record<string, any> = {};
                Object.keys(data).forEach((key) => {
                    if (key.includes("pageNumber") || key.includes("boundingRegion")) {
                        newBoundingData[key] = data[key];
                    }
                });
                setBoundingData(newBoundingData);

                const filteredData = Object.fromEntries(
                    Object.entries(data)
                        .filter(([key]) => key.endsWith("_value"))
                        .map(([key, value]) => [key.replace(/_value/g, ""), value])
                );
                setExtractedData(filteredData);
            } else {
                setError("Failed to upload file");
                handleModalOpen();
            }
        } catch (error) {
            setError("Error extracting data");
            handleModalOpen();
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
    return (
        <div className="flex flex-row justify-center gap-4 text-white h-[90.2vh] p-4">
            {/* Left Section */}
            <div className="flex flex-col bg-gray-900 border border-gray-700 rounded-lg shadow-xl h-[85vh] w-8%] m-2">
                <div className="p-4 text-center">
                    <h2 className="text-lg font-semibold">Tools</h2>
                    <div className="flex flex-col gap-4 mt-4">
                        <button className="flex justify-center items-center w-16 h-16 bg-gray-500 hover:bg-gray-600 rounded-lg"
                            onClick={handleZoomIn}>
                            <ZoomInIcon className="h-6 w-6 text-white"
                            />
                        </button>
                        <button className="flex justify-center items-center w-16 h-16 bg-gray-500 hover:bg-gray-600 rounded-lg"
                            onClick={handleZoomOut} >
                            <ZoomOutIcon className="h-6 w-6 text-white" />
                        </button>
                        <button className="flex justify-center items-center w-16 h-16 bg-gray-500 hover:bg-gray-600 rounded-lg">
                            <ScanIcon className="h-6 w-6 text-white" /> {/* Read Icon */}
                        </button>
                        <button
                            className="flex justify-center items-center w-16 h-16 bg-gray-500 hover:bg-gray-600 rounded-lg"
                            onClick={toggleDrawingMode}
                        >
                            <PencilIcon className="h-6 w-6 text-white" /> {/* Draw Icon */}
                        </button>
                    </div>
                </div>
            </div>

            {/* Center Section */}
            <div className="flex flex-col bg-gray-900 border border-gray-700 rounded-lg shadow-xl h-[85vh] w-[45%] m-2 relative overflow-hidden">
                <div className="flex flex-col justify-center items-center h-full w-full p-4">
                    {!isFileUploaded ? (
                        <div
                            className="w-full h-full bg-gray-800 text-gray-300 rounded-lg flex flex-col justify-center items-center relative cursor-pointer transition-all duration-300 hover:bg-gray-750"
                            onClick={triggerFileInput}
                            onDrop={handleFileDrop}
                            onDragOver={(event) => event.preventDefault()}
                        >
                            <CIcon icon={cilCloudUpload} size="custom-size" className="w-16 h-16 text-cyan-500 mb-4" />
                            <p className="text-center text-lg font-semibold mb-2">Upload Your File</p>
                            <p className="text-center text-sm text-gray-400">(.PDF only)</p>
                            <input type="file" id="file-upload" onChange={handleFileChange} className="hidden" accept=".pdf" />
                        </div>
                    ) : (
                        <div className="rounded-lg bg-gray-800 h-full w-full">
                            <div className="grid grid-rows-[auto_1fr_auto] grid-cols-[auto_1fr_auto] h-full w-full">
                                <div className="col-span-3 flex justify-end p-2">
                                    {selectedFile && (
                                        <button
                                            className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                                            onClick={handleResetFile}
                                        >
                                            <BiSolidXCircle className="w-8 h-8" />
                                        </button>
                                    )}
                                </div>
                                <div className="col-start-2 row-start-2 flex items-center justify-center">
                                    {selectedFile && (
                                        <div className="flex flex-col items-center justify-center w-full h-full max-w-full max-h-full overflow-hidden">
                                            <PdfDraw
                                                pdfFileUrl={pdfFile}
                                                currentPage={currentPage}
                                                boundingData={boundingData}
                                                zoomLevel={zoomLevel}
                                                isDrawing={isDrawing}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Section */}
            <div className="flex flex-col bg-gray-900 border border-gray-700 rounded-lg shadow-xl h-[85vh] w-[50%] m-2">
                <div className="p-4">
                    <h2 className="text-lg font-semibold mb-2">Data Trained</h2>
                    <div className="flex p-4 border border-gray-600 rounded bg-gray-900 h-[78vh]">
                        {isFileUploaded && fileContent && (
                            <p className="text-sm">{fileContent}</p>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Main;
