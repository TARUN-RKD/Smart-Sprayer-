import React from 'react';
import './ControlPanel.css';

const ControlPanel = ({
  diseaseData,
  pesticides,
  selectedPesticideId,
  onPesticideSelect,
  isSprayingEnabled,
  isSubmittingSpray,
  sprayMessage,
  onSpray,
  onStopSpray,
}) => {
  const selectedPesticide = pesticides.find((pesticide) => pesticide.id === Number(selectedPesticideId));

  return (
    <div className="control-panel">
      <h3>Controls</h3>

      <div className="control-group">
        <label>Select Pesticide</label>
        <select
          className="pesticide-select"
          value={selectedPesticideId || ''}
          onChange={(event) => onPesticideSelect(Number(event.target.value))}
          disabled={!diseaseData || pesticides.length === 0}
        >
          <option value="">Choose pesticide</option>
          {pesticides.map((pesticide) => (
            <option key={pesticide.id} value={pesticide.id}>
              {pesticide.name}
            </option>
          ))}
        </select>
        {selectedPesticide && (
          <p className="selected-pesticide-note">
            Ready to spray <strong>{selectedPesticide.name}</strong> at {selectedPesticide.application_rate} ml/L.
          </p>
        )}
      </div>

      <div className="control-group">
        <label>Spray Pesticide</label>
        <button
          className={`btn btn-spray ${isSprayingEnabled ? 'active' : ''}`}
          onClick={() => (isSprayingEnabled ? onStopSpray() : onSpray(selectedPesticideId))}
          disabled={!diseaseData || !selectedPesticideId || isSubmittingSpray}
        >
          {isSubmittingSpray
            ? 'Sending spray command...'
            : isSprayingEnabled
              ? 'Stop spraying'
              : 'Spray selected pesticide'}
        </button>
      </div>

      {diseaseData && (
        <div className="disease-info">
          <div className="disease-stat">
            <strong>Disease Confidence:</strong>
            <div className="confidence-bar">
              <div
                className="confidence-fill"
                style={{ width: `${diseaseData.confidence * 100}%` }}
              ></div>
            </div>
            <span className="confidence-value">
              {(diseaseData.confidence * 100).toFixed(1)}%
            </span>
          </div>

          <div className="disease-stat">
            <strong>Severity:</strong>
            <span className={`severity-tag severity-${(diseaseData.severity || 'mild').toLowerCase()}`}>
              {diseaseData.severity}
            </span>
          </div>

          {sprayMessage && <p className="spray-message">{sprayMessage}</p>}
        </div>
      )}

      <div className="camera-info">
        <small>Upload a plant image, review the recommendation, then spray a suggested pesticide or choose any pesticide from the database.</small>
      </div>
    </div>
  );
};

export default ControlPanel;
