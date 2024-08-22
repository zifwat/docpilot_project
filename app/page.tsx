"use client";

import React, { useState } from 'react';
import { Menu } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { CButton } from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilCloudUpload } from '@coreui/icons';
import { PDFDocument } from 'pdf-lib';

const Main: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePages, setFilePages] = useState<number>(0); // Total number of pages
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedFileType, setSelectedFileType] = useState<string>('Select File Type');
  const [fileContent, setFileContent] = useState<string>(''); // Current page content
  const [isFileUploaded, setIsFileUploaded] = useState<boolean>(false);

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
    localStorage.setItem('selectedFileType', fileType); // Save to local storage
  };

  const triggerFileInput = () => {
    document.getElementById('file-upload')?.click();
  };

  const handleExtract = () => {
    if (selectedFile) {
      alert('Extract button clicked');
    }
  };

  return (
    <div className="flex w-full h-[calc(100vh-4.9rem)] bg-sky-200 text-black">
      {/* Left Column: 25% */}
      <div className="bg-gray-200 p-4" style={{ width: '25%' }}>
        <div className="md:container md:mx-auto h-[calc(100vh-15rem)]">
          <h1 className="text-xl font-semibold mb-4">Upload Your File Here</h1>
          <div className="flex flex-col gap-4 justify-between border border-gray-400 p-4 h-full">
            {/* Conditionally render file upload component */}
            {!isFileUploaded ? (
              <div className="flex flex-col items-center justify-center p-4 h-4/5 text-white bg-cyan-950 rounded shadow">
                <CButton
                  onClick={triggerFileInput}
                  className="p-2 mb-4 w-20 text-white"
                >
                  <CIcon className="ml-2" icon={cilCloudUpload} />
                </CButton>
                <input
                  type="file"
                  id="file-upload"
                  onChange={handleFileChange}
                  className="hidden"
                />
                Select File
              </div>
            ) : (
              <div className="mt-4 p-4 border border-gray-400 rounded bg-white">
                <h2 className="text-lg font-semibold mb-2">File Preview</h2>
                <div className="p-4 border border-gray-400 rounded bg-gray-100 h-40 overflow-auto">
                  {selectedFile ? (
                    <div>
                      <p>{fileContent}</p>
                      <div className="flex justify-between mt-4">
                        <button
                          onClick={handlePrevPage}
                          disabled={currentPage === 0}
                          className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                          Prev
                        </button>
                        <span>Page {currentPage + 1} of {filePages}</span>
                        <button
                          onClick={handleNextPage}
                          disabled={currentPage === filePages - 1}
                          className="bg-blue-800 text-white px-4 py-2 rounded hover:bg-blue-600"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p>No file content available</p>
                  )}
                </div>
              </div>
            )}
            {/* File Type Dropdown */}
            <div className="flex flex-col h-1/5 justify-center gap-4">
              <Menu as="div" className="flex relative z-40 w-full">
                <Menu.Button className="bg-cyan-950 text-white px-4 py-2 rounded flex w-full items-center justify-between hover:bg-blue-600">
                  <span className="flex-1 text-center">{selectedFileType}</span>
                  <ChevronDownIcon className="w-5 h-5 ml-2" />
                </Menu.Button>
                <Menu.Items className="absolute right-0 mt-10 w-48 bg-white border border-gray-400 rounded shadow-lg">
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => handleFileTypeChange('Resume')}
                        className={`block px-4 py-2 text-gray-700 w-full text-left ${active ? 'bg-blue-100' : ''}`}
                      >
                        Resume
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => handleFileTypeChange('Business Card')}
                        className={`block px-4 py-2 text-gray-700  w-full text-left ${active ? 'bg-blue-100' : ''}`}
                      >
                        Business Card
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => handleFileTypeChange('Receipt')}
                        className={`block px-4 py-2 text-gray-700 w-full text-left ${active ? 'bg-blue-100' : ''}`}
                      >
                        Receipt
                      </button>
                    )}
                  </Menu.Item>
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => handleFileTypeChange('Certificate')}
                        className={`block px-4 py-2 text-gray-700 w-full text-left ${active ? 'bg-blue-100' : ''}`}
                      >
                        Certificate
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Menu>

              <button
                onClick={handleExtract}
                className="bg-cyan-950 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Extract
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: 75% */}
      <div className="bg-gray-200 p-4" style={{ width: '75%' }}>
        <div className="md:container md:mx-auto h-[calc(100vh-15rem)]">
          <h1 className="text-xl font-semibold mb-4">Details Information</h1>
          <div className="grid grid-cols-4 gap-4 border border-gray-400 p-4 h-full overflow-y-auto">
            {/* Content for the right side */}
            <div className="p-4 bg-red-300 text-black rounded">
              Example data here
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
