'use client';

import { useState, useRef } from 'react';
import type { FrameworkResponse } from '@/types/grc';

interface UploadedFramework extends FrameworkResponse {
  controlsImported?: number;
  categoriesDetected?: number;
}

export default function FrameworkUploadPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    framework: UploadedFramework;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [frameworkName, setFrameworkName] = useState('');
  const [frameworkVersion, setFrameworkVersion] = useState('');

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        handleFileUpload(file);
      } else {
        setError('Only PDF files are supported. Please drag and drop a .pdf file.');
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        handleFileUpload(file);
      } else {
        setError('Only PDF files are supported.');
      }
    }
  };

  const handleFileUpload = async (file: File) => {
    setError(null);
    setSuccessData(null);
    setIsLoading(true);
    setUploadProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Read file as text (simulating PDF extraction)
      const fileText = await file.text();

      const formData = new FormData();
      formData.append('content', fileText);
      if (frameworkName) formData.append('frameworkName', frameworkName);
      if (frameworkVersion) formData.append('version', frameworkVersion);
      formData.append('publish', 'false');

      const response = await fetch('/api/frameworks/upload', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      setSuccessData(data.data);
      setFrameworkName('');
      setFrameworkVersion('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload framework';
      setError(errorMessage);
      console.error('Upload error:', err);
    } finally {
      setIsLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-violet-950">Import Framework</h1>
        <p className="text-violet-600 mt-2">
          Upload a PDF containing GRC framework controls and automatically parse the structure
        </p>
      </div>

      {/* Upload Zone */}
      <div
        className={`border-2 border-dashed rounded-lg p-12 text-center transition-all ${
          isDragging
            ? 'border-violet-500 bg-violet-50'
            : 'border-violet-300 bg-violet-50/30 hover:border-violet-400'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
          disabled={isLoading}
        />

        <div className="mb-4">
          <svg
            className={`mx-auto h-12 w-12 transition-colors ${
              isDragging ? 'text-violet-600' : 'text-violet-400'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10"
            />
          </svg>
        </div>

        <p className="text-lg font-medium text-violet-950 mb-2">
          {isLoading ? 'Uploading...' : 'Drag and drop your PDF here'}
        </p>
        <p className="text-violet-600 mb-4">or</p>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
          className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? 'Processing...' : 'Select PDF'}
        </button>

        <p className="text-sm text-violet-500 mt-4">
          PDF files only • Supports ISO 27001, NIST, SOC 2, and other frameworks
        </p>

        {/* Progress Bar */}
        {isLoading && uploadProgress > 0 && (
          <div className="mt-6">
            <div className="w-full bg-violet-200 rounded-full h-2">
              <div
                className="bg-violet-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-sm text-violet-600 mt-2">{uploadProgress}% complete</p>
          </div>
        )}
      </div>

      {/* Framework Metadata Override */}
      {!successData && (
        <div className="bg-white rounded-lg shadow p-6 space-y-4">
          <h2 className="text-lg font-bold text-violet-950">Optional Metadata Override</h2>
          <p className="text-sm text-violet-600">
            The framework will be automatically parsed from the PDF. Override these fields if needed:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-violet-700 mb-2">
                Framework Name
              </label>
              <input
                type="text"
                value={frameworkName}
                onChange={(e) => setFrameworkName(e.target.value)}
                placeholder="e.g., ISO 27001:2022"
                disabled={isLoading}
                className="w-full px-4 py-2 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:bg-violet-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-violet-700 mb-2">Version</label>
              <input
                type="text"
                value={frameworkVersion}
                onChange={(e) => setFrameworkVersion(e.target.value)}
                placeholder="e.g., 1.0"
                disabled={isLoading}
                className="w-full px-4 py-2 border border-violet-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:bg-violet-100 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-red-900">Upload Failed</h3>
              <p className="text-red-700 mt-2">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Success Summary */}
      {successData && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-8">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-6 w-6 text-emerald-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-xl font-bold text-emerald-900 mb-4">Framework Imported Successfully</h3>

              <div className="space-y-4">
                {/* Framework Details */}
                <div className="bg-white rounded-lg p-6 space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-violet-600">Framework Name</p>
                      <p className="text-lg font-semibold text-violet-950">
                        {successData.framework.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-violet-600">Version</p>
                      <p className="text-lg font-semibold text-violet-950">
                        {successData.framework.version}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-violet-200">
                    <p className="text-sm font-medium text-violet-600 mb-2">Import Summary</p>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-violet-600">
                          {successData.framework.controlCount}
                        </p>
                        <p className="text-sm text-violet-600">Controls Imported</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-emerald-600">
                          {successData.framework.categories.length}
                        </p>
                        <p className="text-sm text-violet-600">Categories Detected</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-blue-600">Draft</p>
                        <p className="text-sm text-violet-600">Status</p>
                      </div>
                    </div>
                  </div>

                  {/* Categories */}
                  {successData.framework.categories.length > 0 && (
                    <div className="pt-4 border-t border-violet-200">
                      <p className="text-sm font-medium text-violet-600 mb-3">Framework Categories</p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {successData.framework.categories.map((cat) => (
                          <div key={cat.id} className="flex items-center justify-between bg-violet-50/30 px-3 py-2 rounded">
                            <span className="text-sm font-medium text-violet-950">{cat.name}</span>
                            <span className="text-xs px-2 py-1 bg-violet-100 text-violet-700 rounded-full">
                              {cat.controlCount}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Next Steps */}
                <div className="bg-white rounded-lg p-6">
                  <p className="text-sm font-medium text-violet-600 mb-3">Next Steps</p>
                  <ul className="space-y-2 text-sm text-violet-600">
                    <li className="flex items-start">
                      <span className="text-violet-600 font-bold mr-3">1.</span>
                      <span>Review the imported controls and categories</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-violet-600 font-bold mr-3">2.</span>
                      <span>Publish the framework when ready to use it for assessments</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-violet-600 font-bold mr-3">3.</span>
                      <span>Create assessments based on this framework</span>
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <a
                    href="/dashboard/frameworks"
                    className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 text-center font-medium transition-colors"
                  >
                    View All Frameworks
                  </a>
                  <button
                    onClick={() => {
                      setSuccessData(null);
                      setError(null);
                    }}
                    className="flex-1 px-4 py-2 bg-white border border-violet-300 text-violet-950 rounded-lg hover:bg-violet-50/30 font-medium transition-colors"
                  >
                    Import Another
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supported Formats Info */}
      {!successData && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-bold text-blue-900 mb-4">Supported Frameworks</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <p className="font-semibold mb-2">ISO 27001:2022</p>
              <p>Information Security Management System controls and requirements</p>
            </div>
            <div>
              <p className="font-semibold mb-2">NIST Cybersecurity Framework</p>
              <p>Core functions: Identify, Protect, Detect, Respond, Recover</p>
            </div>
            <div>
              <p className="font-semibold mb-2">SOC 2 Type II</p>
              <p>Service Organization Control auditing framework</p>
            </div>
            <div>
              <p className="font-semibold mb-2">CIS Controls</p>
              <p>Critical security controls and best practices</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
