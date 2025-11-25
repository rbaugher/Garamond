import React from 'react';
import './AsteroidsSettings.css';

export default function AsteroidsSettings({ settings, onSettingsChange, onClose }) {
  const handleShipColorChange = (e) => {
    onSettingsChange({ ...settings, shipColor: e.target.value });
  };

  const handleBackgroundColorChange = (e) => {
    onSettingsChange({ ...settings, backgroundColor: e.target.value });
  };

  const handleShipShapeChange = (shape) => {
    onSettingsChange({ ...settings, shipShape: shape });
  };

  return (
    <div className="asteroids-settings-overlay" onClick={onClose}>
      <div className="asteroids-settings-panel" onClick={(e) => e.stopPropagation()}>
        <div className="asteroids-settings-header">
          <h2>Game Settings</h2>
          <button className="asteroids-settings-close" onClick={onClose}>×</button>
        </div>
        
        <div className="asteroids-settings-content">
          {/* Ship Shape Selection */}
          <div className="asteroids-setting-group">
            <label className="asteroids-setting-label">Ship Shape</label>
            <div className="asteroids-shape-options">
              <button
                className={`asteroids-shape-button ${settings.shipShape === 'triangle' ? 'active' : ''}`}
                onClick={() => handleShipShapeChange('triangle')}
              >
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <polygon points="30,20 15,30 15,10" fill="currentColor" />
                </svg>
                <span>Triangle</span>
              </button>
              <button
                className={`asteroids-shape-button ${settings.shipShape === 'circle' ? 'active' : ''}`}
                onClick={() => handleShipShapeChange('circle')}
              >
                <svg width="40" height="40" viewBox="0 0 40 40">
                  <circle cx="20" cy="20" r="10" fill="currentColor" />
                </svg>
                <span>Circle</span>
              </button>
            </div>
          </div>

          {/* Ship Color Selection */}
          <div className="asteroids-setting-group">
            <label className="asteroids-setting-label" htmlFor="ship-color">
              Ship Color
            </label>
            <div className="asteroids-color-picker-wrapper">
              <input
                id="ship-color"
                type="color"
                value={settings.shipColor}
                onChange={handleShipColorChange}
                className="asteroids-color-picker"
              />
              <span className="asteroids-color-value">{settings.shipColor}</span>
            </div>
            <div className="asteroids-color-presets">
              {['#F6D55C', '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA'].map(color => (
                <button
                  key={color}
                  className="asteroids-color-preset"
                  style={{ backgroundColor: color }}
                  onClick={() => onSettingsChange({ ...settings, shipColor: color })}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Background Color Selection */}
          <div className="asteroids-setting-group">
            <label className="asteroids-setting-label" htmlFor="bg-color">
              Background Color
            </label>
            <div className="asteroids-color-picker-wrapper">
              <input
                id="bg-color"
                type="color"
                value={settings.backgroundColor}
                onChange={handleBackgroundColorChange}
                className="asteroids-color-picker"
              />
              <span className="asteroids-color-value">{settings.backgroundColor}</span>
            </div>
            <div className="asteroids-color-presets">
              {['#071019', '#1a1a2e', '#16213e', '#0f3460', '#2d4059', '#1f1f1f'].map(color => (
                <button
                  key={color}
                  className="asteroids-color-preset"
                  style={{ backgroundColor: color }}
                  onClick={() => onSettingsChange({ ...settings, backgroundColor: color })}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="asteroids-setting-group">
            <label className="asteroids-setting-label">Preview</label>
            <div 
              className="asteroids-preview-box" 
              style={{ backgroundColor: settings.backgroundColor }}
            >
              {settings.shipShape === 'triangle' ? (
                <svg width="60" height="60" viewBox="0 0 60 60">
                  <polygon 
                    points="45,30 25,45 25,15" 
                    fill={settings.shipColor}
                    stroke="#2b2b2b"
                    strokeWidth="2"
                  />
                </svg>
              ) : (
                <svg width="60" height="60" viewBox="0 0 60 60">
                  <circle 
                    cx="30" 
                    cy="30" 
                    r="15" 
                    fill={settings.shipColor}
                    stroke="#2b2b2b"
                    strokeWidth="2"
                  />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
