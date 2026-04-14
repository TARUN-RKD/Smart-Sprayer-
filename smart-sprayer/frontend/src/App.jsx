import React, { useEffect, useRef, useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import ControlPanel from './components/ui/ControlPanel';
import ImageUpload from './components/ui/ImageUpload';
import ResultsPanel from './components/ui/ResultsPanel';
import apiService from './services/apiService';
import './App.css';

function App() {
  const [diseaseData, setDiseaseData] = useState(null);
  const [pesticides, setPesticides] = useState([]);
  const [isSprayingEnabled, setIsSprayingEnabled] = useState(false);
  const [selectedPesticideId, setSelectedPesticideId] = useState(null);
  const [isSubmittingSpray, setIsSubmittingSpray] = useState(false);
  const [sprayMessage, setSprayMessage] = useState('');
  const lastDetectionTimestampRef = useRef(null);

  const handleDetectionComplete = (result) => {
    setDiseaseData(result);
    setPesticides(result.available_pesticides || []);
    lastDetectionTimestampRef.current = result.updated_at || null;

    const defaultPesticideId = result.recommended_pesticides?.[0]?.id
      || result.available_pesticides?.[0]?.id
      || null;

    setSelectedPesticideId(defaultPesticideId);
    setIsSprayingEnabled(false);
    setSprayMessage('');
  };

  useEffect(() => {
    let isMounted = true;

    const pollLatestDetection = async () => {
      try {
        const latestResult = await apiService.getLatestDetection();
        if (!isMounted) {
          return;
        }

        if (!latestResult?.updated_at || latestResult.updated_at === lastDetectionTimestampRef.current) {
          return;
        }

        handleDetectionComplete(latestResult);
        toast.success('New camera image analyzed. Results panel updated.');
      } catch (error) {
        if (error.response?.status !== 404) {
          console.error('Unable to fetch latest camera detection:', error);
        }
      }
    };

    pollLatestDetection();
    const intervalId = window.setInterval(pollLatestDetection, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const handleSpray = async (pesticideId = selectedPesticideId) => {
    if (!diseaseData || !pesticideId) {
      toast.error('Run detection and select a pesticide before spraying.');
      return;
    }

    setIsSubmittingSpray(true);
    try {
      const response = await apiService.sprayPesticide(pesticideId, diseaseData.disease_id);
      setSelectedPesticideId(pesticideId);
      setIsSprayingEnabled(true);
      setSprayMessage(response.message);
      toast.success(response.message);
    } catch (error) {
      const message = error.response?.data?.detail || error.message;
      setIsSprayingEnabled(false);
      toast.error(`Unable to start spray: ${message}`);
    } finally {
      setIsSubmittingSpray(false);
    }
  };

  const handleStopSpray = () => {
    setIsSprayingEnabled(false);
    setSprayMessage('Spray action stopped.');
    toast.success('Spray stopped.');
  };

  const containerStyle = {
    backgroundImage: `linear-gradient(135deg, rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${process.env.PUBLIC_URL}/background-image.webp)`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed',
  };

  return (
    <div className="app-container" style={containerStyle}>
      <Toaster position="top-right" />

      <header className="app-header">
        <div className="header-content">
          <h1>Smart Sprayer</h1>
          <p>Interactive AI-Powered Plant Disease Detection</p>
        </div>
      </header>

      <div className="floating-panels">
        <div className="panel upload-panel">
          <ImageUpload onAnalysisComplete={handleDetectionComplete} />
        </div>

        <div className="panel control-panel">
          <ControlPanel
            diseaseData={diseaseData}
            pesticides={pesticides}
            selectedPesticideId={selectedPesticideId}
            onPesticideSelect={setSelectedPesticideId}
            isSprayingEnabled={isSprayingEnabled}
            isSubmittingSpray={isSubmittingSpray}
            sprayMessage={sprayMessage}
            onSpray={handleSpray}
            onStopSpray={handleStopSpray}
          />
        </div>

        <div className="panel results-panel">
          <ResultsPanel
            pesticides={pesticides}
            diseaseData={diseaseData}
            selectedPesticideId={selectedPesticideId}
            onPesticideSelect={setSelectedPesticideId}
            onSpray={handleSpray}
            isSubmittingSpray={isSubmittingSpray}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
