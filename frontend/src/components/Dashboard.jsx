import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaTimesCircle, FaClock, FaPercentage } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import data from '../data/data.json'; // Import the data directly if it's available locally
import axios from 'axios';

const Dashboard = () => {
  const [chartData, setChartData] = useState(data);
  const [selectedFile, setSelectedFile] = useState(null);
  const [docInfo, setDocInfo] = useState(null); // To store extracted document information
  const [isModalOpen, setIsModalOpen] = useState(false); // To manage modal visibility
  const [isLoading, setIsLoading] = useState(false); // To manage loading state

  const summaryStats = {
    totalDocuments: chartData.reduce((total, day) => total + day.documentsProcessed, 0),
    invoiceDocs: chartData.reduce((total, day) => total + day.documentTypeDistribution.Invoice, 0),
    receiptDocs: chartData.reduce((total, day) => total + day.documentTypeDistribution.Receipt, 0),
    contractDocs: chartData.reduce((total, day) => total + day.documentTypeDistribution.Contract, 0),
    otherDocs: chartData.reduce((total, day) => total + day.documentTypeDistribution.Other, 0),
    performance: chartData.length > 0
      ? ((chartData.reduce((total, day) => total + day.performance, 0) / chartData.length).toFixed(2))
      : 0
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
  
    // Predefined document information
    const predefinedDocInfo = {
      format: 'JPEG', // Example format
      fontSize: '12px', // Example font size
      numParagraphs: 3, // Example number of paragraphs
      textSnippet: 'This is a snippet of the text content from the uploaded file, showing the beginning of the document.'
    };
  
    // Simulate a delay (for example, if you want to mimic the time it would take to process the file)
    setTimeout(() => {
      setDocInfo(predefinedDocInfo);
    }, 500);
  };

  const handleTrainModel = () => {
    // Show loading message
    setIsLoading(true);

    // Simulate loading for 2 seconds before showing the modal
    setTimeout(() => {
      setIsLoading(false);
      setIsModalOpen(true); // Show the modal after loading
    }, 2000);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-100 min-h-screen">
      <h2 className="text-3xl font-bold text-gray-800">Enterprise Dashboard</h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[{ title: 'Total Documents', value: summaryStats.totalDocuments, icon: <FaCheckCircle className="text-purple-500" /> },
          { title: 'Invoices', value: summaryStats.invoiceDocs, icon: <FaTimesCircle className="text-green-500" /> },
          { title: 'Receipts', value: summaryStats.receiptDocs, icon: <FaClock className="text-yellow-500" /> },
          { title: 'Performance', value: `${summaryStats.performance}%`, icon: <FaPercentage className="text-blue-500" /> }].map(({ title, value, icon }) => (
            <div key={title} className="bg-white p-4 shadow-md rounded-lg flex items-center space-x-4">
              <div className="text-3xl">{icon}</div>
              <div>
                <p className="text-gray-500 text-sm">{title}</p>
                <p className="text-xl font-semibold text-gray-800">{value}</p>
              </div>
            </div>
          ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white p-4 shadow-md rounded-lg">
          <h3 className="text-lg font-semibold">Documents Processed Each Day</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="documentsProcessed" fill="#800080" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 shadow-md rounded-lg">
          <h3 className="text-lg font-semibold">Model Identified Document Types</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={[{ name: 'Invoice', value: summaryStats.invoiceDocs },
                          { name: 'Receipt', value: summaryStats.receiptDocs },
                          { name: 'Contract', value: summaryStats.contractDocs },
                          { name: 'Other', value: summaryStats.otherDocs }] }
                   dataKey="value" cx="50%" cy="50%" outerRadius={80}>
                <Cell fill="#4CAF50" />
                <Cell fill="#FF9800" />
                <Cell fill="#2196F3" />
                <Cell fill="#9C27B0" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 shadow-md rounded-lg">
          <h3 className="text-lg font-semibold">Performance Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" />
              <YAxis />
              <CartesianGrid strokeDasharray="3 3" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="performance" stroke="#FFBB28" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="bg-white p-6 shadow-md rounded-lg mt-6">
        <h3 className="text-lg font-semibold mb-4">Upload Document for Verification</h3>
        <input
          type="file"
          onChange={handleFileUpload}
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
          className="block w-full text-sm text-gray-600 border border-gray-300 rounded-lg cursor-pointer"
        />
        {selectedFile && (
          <div className="mt-4 flex">
            <div className="w-1/4 p-4 border border-gray-300 rounded-lg mr-4">
              <p className="text-sm text-gray-800">Selected File: {selectedFile.name}</p>
              <img src={URL.createObjectURL(selectedFile)} alt="Selected File" className="mt-2 w-full h-auto" />
            </div>
            <div className="w-3/4 p-4 border border-gray-300 rounded-lg">
              {docInfo ? (
                <>
                  <p><strong>Format:</strong> {docInfo.format}</p>
                  <p><strong>Font Size:</strong> {docInfo.fontSize}</p>
                  <p><strong>Number of Paragraphs:</strong> {docInfo.numParagraphs}</p>
                  <p><strong>Text Content:</strong> {docInfo.textSnippet}</p>
                </>
              ) : (
                <p className="text-gray-600">Waiting for document information...</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Train Model Button */}
      <div className="bg-white p-6 shadow-md rounded-lg mt-6 text-center">
        <button
          onClick={handleTrainModel}
          className="bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg hover:bg-blue-600"
        >
          Train Model
        </button>
      </div>

      {/* Modal for "Train Model" */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-1/3">
            <h3 className="text-xl font-semibold mb-4">The model will be trained, and we will update you soon!</h3>
            <button
              onClick={closeModal}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Training the model... Please wait.</h3>
            <div className="loader"></div> {/* Add a loading spinner or animation */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
