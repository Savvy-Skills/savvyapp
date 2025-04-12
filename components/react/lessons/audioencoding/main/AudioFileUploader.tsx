'use dom'

import React from "react";

interface AudioFileUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
}

export default function AudioFileUploader({ onFileSelect, selectedFile }: AudioFileUploaderProps) {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="audio-uploader">
      <input 
        type="file" 
        accept="audio/*" 
        onChange={handleFileChange} 
        className="file-input"
      />
      {selectedFile && (
        <div className="file-info">
          <p>Selected: {selectedFile.name}</p>
        </div>
      )}
    </div>
  );
} 