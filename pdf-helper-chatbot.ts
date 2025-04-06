import React, { useState } from "react";

interface PDFExtractResponse {
  text: string;
  error?: string;
}

export default function PDFHelperChatbot() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Reset UI
    setText("");
    setError("");
    setCopied(false);
    setFileName(file.name);

    // Validate type & size
    if (file.type !== "application/pdf") {
      setError("Only PDF files are supported.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Server error");

      const data: PDFExtractResponse = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setText(data.text);
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Something went wrong while processing the file.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setText("");
    setFileName("");
    setError("");
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100 p-6">
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-400">PDF Helper Chatbot</h1>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded text-sm"
            >
              {darkMode ? "Light Mode" : "Dark Mode"}
            </button>
          </div>

          <div className="mb-4">
            <label className="block mb-2 font-semibold">Upload a PDF file</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              className="w-full border p-2 rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
            {fileName && <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">File: {fileName}</p>}
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <svg className="animate-spin h-6 w-6 mr-2 text-blue-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              <span>Processing PDF...</span>
            </div>
          ) : (
            text && (
              <div className="mt-6 space-y-4">
                <h2 className="text-xl font-bold mb-2">Chat Response</h2>
                <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-xl text-sm whitespace-pre-wrap font-medium">
                  {text}
                </div>
                <div className="flex justify-end space-x-3 mt-4">
                  <button
                    onClick={reset}
                    className="bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white px-4 py-2 rounded"
                  >
                    Clear
                  </button>
                  <button
                    onClick={handleCopy}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
                  >
                    {copied ? "Copied!" : "Copy Text"}
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
