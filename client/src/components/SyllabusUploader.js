import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

const SyllabusUploader = ({ onFileParse }) => {
  const [fileName, setFileName] = useState('');
  const [fileText, setFileText] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileName(file.name);

    if (file.type === 'application/pdf') {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const typedArray = new Uint8Array(event.target.result);
        try {
          const pdf = await pdfjsLib.getDocument(typedArray).promise;
          let extractedText = '';

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item) => item.str).join(' ');
            extractedText += `\n${pageText}`;
          }

          setFileText(extractedText);
          onFileParse(extractedText);
        } catch (error) {
          console.error('Error parsing PDF:', error);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target.result;
        setFileText(text);
        onFileParse(text);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div style={{ padding: '20px', border: '2px dashed #ccc', textAlign: 'center' }}>
      <input
        type="file"
        accept=".txt,.pdf"
        onChange={handleFileUpload}
        style={{ marginBottom: '10px' }}
      />
      <p>{fileName ? `Uploaded: ${fileName}` : 'No file uploaded yet'}</p>
      {fileText && (
        <div style={{ marginTop: '20px', textAlign: 'left' }}>
          <h4>Extracted Syllabus Text:</h4>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{fileText}</pre>
        </div>
      )}
    </div>
  );
};

export default SyllabusUploader;
