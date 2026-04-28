import React, { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import apiService from '../../services/apiService';
import './ImageUpload.css';

const ImageUpload = ({ onAnalysisComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => setPreview(event.target.result);
    reader.readAsDataURL(file);

    setIsLoading(true);
    try {
      const result = await apiService.detectDisease(file);
      onAnalysisComplete(result);
      toast.success('Disease detected. Review the pesticide suggestions.');
    } catch (error) {
      const message = error.response?.data?.detail || error.message;
      toast.error(`Error detecting disease: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  return (
    <div className="image-upload">
      <h3>Upload Plant Image</h3>
      <p className="upload-helper-text">
      Upload image to detect disease and its cure
      </p>

      <div
        className="upload-area"
        onDrop={handleDragDrop}
        onDragOver={(event) => event.preventDefault()}
      >
        {preview ? (
          <img src={preview} alt="Preview" className="preview-image" />
        ) : (
          <div className="upload-placeholder">
            <p>Upload a crop photo</p>
            <p>Drag and drop an image here or click to browse</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(event) => handleFileSelect(event.target.files[0])}
          style={{ display: 'none' }}
        />
        <button
          className="btn-upload"
          onClick={() => fileInputRef.current?.click()}
          disabled={isLoading}
        >
          {isLoading ? 'Analyzing...' : 'Select Image'}
        </button>
      </div>
    </div>
  );
};

export default ImageUpload;
