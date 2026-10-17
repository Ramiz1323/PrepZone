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
import '../../styles/pages/_materials.scss';

const isMobileScreen = () => {
  if (typeof window === 'undefined') return false;
  return (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || window.innerWidth < 768
  );
};

const PdfViewerModal = ({ material, isOpen, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  // Default to Google Docs viewer on mobile because mobile Chrome can't embed direct PDFs in iframes
  const [viewerMode, setViewerMode] = useState(() =>
    isMobileScreen() ? 'google' : 'native'
  );
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
            {/* Viewer Mode Switcher Button */}
            <button
              type="button"
              className="action-btn mode-switch-btn"
              title={`Switch to ${viewerMode === 'native' ? 'Google Docs Viewer' : 'Direct Viewer'}`}
              onClick={() => setViewerMode(viewerMode === 'native' ? 'google' : 'native')}
            >
              <FiRefreshCw className="btn-icon" />
              <span className="btn-text">
                {viewerMode === 'native' ? 'Google View' : 'Direct View'}
              </span>
            </button>

            {/* Download Button */}
            <button
              type="button"
              className="action-btn download-action-btn"
              onClick={handleDownload}
              disabled={isDownloading}
              title="Download PDF"
            >
              <FiDownload className="btn-icon" />
              <span className="btn-text">{isDownloading ? 'Downloading...' : 'Download'}</span>
            </button>

            {/* Open in New Tab / Window */}
            <button
              type="button"
              className="action-btn icon-btn"
              onClick={openInNewTab}
              title="Open full document in new tab"
              aria-label="Open in new tab"
            >
              <FiExternalLink />
            </button>

            {/* Toggle Fullscreen (PC/laptop only) */}
            <button
              type="button"
              className="action-btn icon-btn fullscreen-btn"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? <FiMinimize2 /> : <FiMaximize2 />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              className="action-btn icon-btn close-btn"
              onClick={onClose}
              title="Close Viewer"
              aria-label="Close Viewer"
            >
              <FiX />
            </button>
          </div>
        </div>

        {/* Viewer Mode Helper Strip */}
        <div className="pdf-viewer-bar">
          <span className="bar-label">
            Viewing via {viewerMode === 'google' ? 'Google Docs Viewer' : 'Direct PDF Reader'}
          </span>
          <button
            type="button"
            className="bar-toggle-btn"
            onClick={() => setViewerMode(viewerMode === 'native' ? 'google' : 'native')}
          >
            {viewerMode === 'native' ? 'Switch to Google Viewer' : 'Switch to Direct PDF'}
          </button>
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
