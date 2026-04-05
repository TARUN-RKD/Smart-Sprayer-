import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import PlantScene from './components/3d/PlantScene';
import ControlPanel from './components/ui/ControlPanel';
import ImageUpload from './components/ui/ImageUpload';
import ResultsPanel from './components/ui/ResultsPanel';
import './App.css';

function App() {
  const [diseaseData, setDiseaseData] = useState(null);
  const [pesticides, setPesticides] = useState([]);
  const [isSprayingEnabled, setIsSprayingEnabled] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState(null);

  const containerStyle = {
    backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${process.env.PUBLIC_URL}/background-image.webp)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  };

  return (
    <div className="app-container" style={containerStyle}>
      <Toaster position="top-right" />
      
      {/* Full-screen 3D Scene - HIDDEN */}
      {/* <div className="scene-container">
        <PlantScene 
          diseaseData={diseaseData}
          isSprayingEnabled={isSprayingEnabled}
          selectedDisease={selectedDisease}
        />
      </div> */}

      {/* Floating Header */}
      <header className="app-header">
        <div className="header-content">
          <h1>Smart Sprayer</h1>
          <p>Interactive AI-Powered Plant Disease Detection</p>
        </div>
      </header>

      {/* Floating Control Panels */}
      <div className="floating-panels">
        <div className="panel upload-panel">
          <ImageUpload 
            onDiseaseDetected={setDiseaseData}
            onPesticidesReceived={setPesticides}
          />
        </div>

        <div className="panel control-panel">
          <ControlPanel 
            diseaseData={diseaseData}
            onSprayToggle={setIsSprayingEnabled}
            onDiseaseSelect={setSelectedDisease}
          />
        </div>

        <div className="panel results-panel">
          <ResultsPanel 
            pesticides={pesticides}
            diseaseData={diseaseData}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
