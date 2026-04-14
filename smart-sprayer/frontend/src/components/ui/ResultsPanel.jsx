import React from 'react';
import './ResultsPanel.css';

const ResultsPanel = ({
  pesticides,
  diseaseData,
  selectedPesticideId,
  onPesticideSelect,
  onSpray,
  isSubmittingSpray,
}) => {
  if (!diseaseData) {
    return (
      <div className="results-panel empty">
        <h3>Detection Results</h3>
        <p className="placeholder-text">Upload an image to see disease details and pesticide suggestions.</p>
      </div>
    );
  }

  return (
    <div className="results-panel">
      <h3>Disease Analysis</h3>

      <div className="results-content">
        <section className="disease-summary-card">
          <div className="summary-row">
            <span className="summary-label">Disease</span>
            <strong>{diseaseData.disease_name}</strong>
          </div>
          <div className="summary-row">
            <span className="summary-label">AI Confidence</span>
            <span>{(diseaseData.confidence * 100).toFixed(1)}%</span>
          </div>
          {diseaseData.source && (
            <div className="summary-row">
              <span className="summary-label">Input Source</span>
              <span>{diseaseData.source === 'camera' ? 'ESP32 Camera Auto Upload' : 'Manual Upload'}</span>
            </div>
          )}
          {diseaseData.updated_at && (
            <div className="summary-row">
              <span className="summary-label">Last Update</span>
              <span>{new Date(diseaseData.updated_at).toLocaleString()}</span>
            </div>
          )}

          {/* -------------------------------------------------------------------------------------------------------------------> */}
          {/* <div className="summary-row">
            <span className="summary-label">Description</span>
            <span>{diseaseData.description}</span>
          </div> */}
          {/* {diseaseData.symptoms && (
            <div className="summary-row">
              <span className="summary-label">Symptoms</span>
              <span>{diseaseData.symptoms}</span>
            </div>
          )} */}

          {/* -----------------------------------------------------------------------------------------------------------------------> */}
        </section>

        <section>
          <h4 className="section-title">Suggested pesticides to spray</h4>
          {diseaseData.recommended_pesticides?.length > 0 ? (
            <ul className="pesticide-list">
              {diseaseData.recommended_pesticides.map((pesticide) => (
                <li
                  key={pesticide.id}
                  className={`pesticide-item ${selectedPesticideId === pesticide.id ? 'selected' : ''}`}
                >
                  <div className="pesticide-header">
                    <strong>{pesticide.name}</strong>
                    <span className="pesticide-type">Recommended</span>
                  </div>
                  {pesticide.disease && (
                    <p className="pesticide-description">Suggested for: {pesticide.disease}</p>
                  )}
                  <p className="pesticide-description">{pesticide.description}</p>
                  <div className="pesticide-details">
                    <span className="detail-tag">Active ingredient: {pesticide.active_ingredient}</span>
                    <span className="detail-tag">Application rate: {pesticide.application_rate} ml/L</span>
                  </div>
                  <p className="safety-note">{pesticide.safety_instructions}</p>
                  <div className="pesticide-actions">
                    <button
                      className="action-button primary"
                      onClick={() => onSpray(pesticide.id)}
                      disabled={isSubmittingSpray}
                    >
                      Spray this pesticide
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-pesticides">No direct pesticide recommendation is stored for this disease.</p>
          )}
        </section>

        <section>
          <h4 className="section-title">Spray suggestions</h4>
          <ul className="suggestion-list">
            {diseaseData.spray_suggestions?.map((suggestion) => (
              <li key={suggestion}>{suggestion}</li>
            ))}
          </ul>
        </section>

        <section>
          <h4 className="section-title">All pesticides in database</h4>
          {pesticides.length > 0 ? (
            <ul className="pesticide-list compact">
              {pesticides.map((pesticide) => (
                <li
                  key={pesticide.id}
                  className={`pesticide-item ${selectedPesticideId === pesticide.id ? 'selected' : ''}`}
                >
                  <div className="pesticide-header">
                    <strong>{pesticide.name}</strong>
                    <span className="pesticide-type">Database</span>
                  </div>
                  {pesticide.disease && (
                    <p className="pesticide-description">Tagged disease: {pesticide.disease}</p>
                  )}
                  <p className="pesticide-description">{pesticide.description}</p>
                  <div className="pesticide-details">
                    <span className="detail-tag">Active ingredient: {pesticide.active_ingredient}</span>
                    <span className="detail-tag">Application rate: {pesticide.application_rate} ml/L</span>
                  </div>
                  <div className="pesticide-actions">
                    <button
                      className="action-button secondary"
                      onClick={() => onPesticideSelect(pesticide.id)}
                    >
                      {selectedPesticideId === pesticide.id ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-pesticides">No pesticides found in the database.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default ResultsPanel;
