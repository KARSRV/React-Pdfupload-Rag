import React, { useState } from "react";
import axios from "axios";

const App = () => {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError("");
  };

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !question) {
      setError("Please upload a PDF and enter a question.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("question", question);

    try {
      const response = await axios.post("http://localhost:8000/ask", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAnswer(response.data.answer);
    } catch (err) {
      setError("Error processing request. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">
          PDF Question Answering
        </h1>
        <div className="space-y-4">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <input
            type="text"
            value={question}
            onChange={handleQuestionChange}
            placeholder="Ask a question about the PDF"
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-blue-500 text-white p-3 rounded-md hover:bg-blue-600 disabled:bg-blue-300 transition"
          >
            {loading ? "Processing..." : "Get Answer"}
          </button>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {answer && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h2 className="text-lg font-semibold text-gray-700">Answer:</h2>
              <p className="text-gray-600">{answer}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;
