import React, { useState } from 'react';
import {
  FiX,
  FiDownload,
  FiExternalLink,
  FiMaximize2,
  FiMinimize2,
  FiFileText,
  FiRefreshCw,
} from 'react-icons/fi';
import Button from '../../components/Button';
import '../../styles/pages/_materials.scss';

const PdfViewerModal = ({ material, isOpen, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewerMode, setViewerMode] = useState('native'); // 'native' | 'google'
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen || !material) return null;

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleDownload = async () => {
    try {
      setIsDownloading(true);
      const response = await fetch(material.fileUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = material.fileName || `${material.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(blobUrl);
      document.body.removeChild(link);
    } catch {
      // Fallback: direct download with ImageKit parameter
      const downloadUrl = material.fileUrl.includes('?')
        ? `${material.fileUrl}&ik-attachment=true`
        : `${material.fileUrl}?ik-attachment=true`;
      window.open(downloadUrl, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  const openInNewTab = () => {
    window.open(material.fileUrl, '_blank', 'noopener,noreferrer');
  };

  const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
    material.fileUrl
  )}&embedded=true`;

  return (
    <div className={`pdf-modal-overlay ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="pdf-modal-backdrop" onClick={onClose} />
      <div className={`pdf-modal-container ${isFullscreen ? 'is-fullscreen' : ''}`}>
        {/* Modal Header */}
        <div className="pdf-modal-header">
          <div className="pdf-info">
            <div className="pdf-title-row">
              <span className="pdf-icon-badge">
                <FiFileText />
              </span>
              <h2 className="pdf-title" title={material.title}>
                {material.title}
              </h2>
            </div>
            <div className="pdf-meta-row">
              <span className="subject-pill">{material.subject}</span>
              <span className="meta-dot">•</span>
              <span className="file-name">{material.fileName}</span>
            </div>
          </div>

          <div className="pdf-actions">
            {/* Viewer Mode Switcher */}
            <button
              type="button"
              className="action-icon-btn mode-switch-btn"
              title={`Switch to ${viewerMode === 'native' ? 'Google Docs Viewer' : 'Direct Viewer'}`}
              onClick={() => setViewerMode(viewerMode === 'native' ? 'google' : 'native')}
            >
              <FiRefreshCw />
              <span className="btn-label">{viewerMode === 'native' ? 'Alternate View' : 'Direct View'}</span>
            </button>

            {/* Download Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              isLoading={isDownloading}
              className="download-btn"
              title="Download PDF"
            >
              <FiDownload />
              <span className="btn-text">Download</span>
            </Button>

            {/* Open in New Window */}
            <button
              type="button"
              className="action-icon-btn"
              onClick={openInNewTab}
              title="Open in new window"
              aria-label="Open in new window"
            >
              <FiExternalLink />
            </button>

            {/* Toggle Fullscreen */}
            <button
              type="button"
              className="action-icon-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              className="action-icon-btn close-modal-btn"
              onClick={onClose}
              title="Close Viewer"
              aria-label="Close Viewer"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* Modal PDF Viewer Body */}
        <div className="pdf-modal-body">
          <iframe
            src={viewerMode === 'native' ? material.fileUrl : googleViewerUrl}
            title={material.title}
            className="pdf-iframe-frame"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

export default PdfViewerModal;
