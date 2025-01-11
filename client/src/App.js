import React, { useState } from 'react';

function App() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysis, setAnalysis] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle file selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
    setAnalysis("");
    setError("");
  };

  // Send the file to Flask endpoint for analysis
  const handleAnalyze = async () => {
    if (!selectedFile) {
      setError("Please select a file first!");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis("");

    try {
      // Build form data
      const formData = new FormData();
      formData.append("file", selectedFile);

      // Fetch from your Flask backend
      // Adjust the port (5000 / 5001) to match your Flask app
      // e.g., "http://127.0.0.1:5001/api/analyze"
      const response = await fetch("http://127.0.0.1:5001/api/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || "Error analyzing file");
      }

      const data = await response.json();
      setAnalysis(data.analysis || "");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
      <h1>Assignment Analyzer</h1>
      <p>Upload a document (PDF or DOCX) and get AI-powered analysis of assignments!</p>

      {/* File Input */}
      <input
        type="file"
        onChange={handleFileChange}
        accept=".pdf,.doc,.docx"
      />

      {/* Analyze Button */}
      <div style={{ marginTop: '1rem' }}>
        <button onClick={handleAnalyze} disabled={!selectedFile || loading}>
          {loading ? "Analyzing..." : "Generate Assignment List"}
        </button>
      </div>

      {/* Error Message */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Analysis Result */}
      {analysis && (
        <div style={{ marginTop: '1rem' }}>
          <h2>Analysis</h2>
          <pre>{analysis}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
