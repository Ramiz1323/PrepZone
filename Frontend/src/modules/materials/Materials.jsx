import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiFileText,
  FiUploadCloud,
  FiDownload,
  FiEye,
  FiTrash2,
  FiSearch,
  FiHardDrive,
  FiLayers,
  FiClock,
  FiX,
  FiBook,
  FiChevronLeft,
  FiChevronRight,
} from 'react-icons/fi';
import {
  fetchMaterials,
  deleteMaterial,
  setSelectedSubject,
  setSearchQuery,
} from '../../store/slices/materialSlice';
import GlassCard from '../../components/GlassCard';
import { SkeletonCard } from '../../components/Skeleton';
import Button from '../../components/Button';
import Input from '../../components/Input';
import UploadMaterialModal from './UploadMaterialModal';
import PdfViewerModal from './PdfViewerModal';
import '../../styles/pages/_materials.scss';

const SUBJECTS = [
  'All',
  'C Programming',
  'OOP',
  'Unix',
  'Data Structures',
  'Computer Intro',
  'Operating System',
  'Computer Network',
  'DBMS',
  'Software Engineering',
  'Machine Learning',
  'Others',
];

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const d = new Date(dateString);
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const Materials = () => {
  const dispatch = useDispatch();
  const { items, stats, loading, selectedSubject, searchQuery } = useSelector(
    (state) => state.material
  );

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [viewingMaterial, setViewingMaterial] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);

  const pillsRef = React.useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkPillsScroll = () => {
    if (pillsRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = pillsRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
    }
  };

  useEffect(() => {
    checkPillsScroll();
    window.addEventListener('resize', checkPillsScroll);
    return () => window.removeEventListener('resize', checkPillsScroll);
  }, []);

  const handlePillsScroll = (direction) => {
    if (pillsRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      pillsRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    dispatch(
      fetchMaterials({
        subject: selectedSubject,
        search: searchQuery,
      })
    );
  }, [dispatch, selectedSubject, searchQuery]);

  const handleDownload = async (material, e) => {
    e.stopPropagation();
    try {
      setDownloadingId(material._id);
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
      setDownloadingId(null);
    }
  };

  const handleDelete = (material, e) => {
    e.stopPropagation();
    if (
      window.confirm(
        `Are you sure you want to delete "${material.title}"? This cannot be undone.`
      )
    ) {
      dispatch(deleteMaterial(material._id));
    }
  };

  // Distinct subjects present among saved items
  const coveredSubjectsCount = useMemo(() => {
    const set = new Set(items.map((i) => i.subject));
    return set.size;
  }, [items]);

  return (
    <div className="materials-page">
      {/* Top Banner / Header */}
      <div className="materials-header">
        <div className="header-info">
          <h1>Study Materials & PDF Vault</h1>
          <p>
            Upload your JECA notes, syllabus PDFs, and reference books. Only you have
            access to your uploaded materials.
          </p>
        </div>
        <div className="header-action">
          <Button
            variant="primary"
            onClick={() => setIsUploadOpen(true)}
            className="upload-trigger-btn"
          >
            <FiUploadCloud />
            <span>Upload PDF</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="materials-stats-grid">
        <GlassCard className="stat-card">
          <div className="stat-icon-wrapper red">
            <FiFileText />
          </div>
          <div className="stat-content">
            <span className="stat-label">Saved Documents</span>
            <span className="stat-value">{stats.totalFiles || items.length}</span>
          </div>
        </GlassCard>

        <GlassCard className="stat-card">
          <div className="stat-icon-wrapper orange">
            <FiHardDrive />
          </div>
          <div className="stat-content">
            <span className="stat-label">Storage Used</span>
            <span className="stat-value">{formatFileSize(stats.totalStorage)}</span>
          </div>
        </GlassCard>

        <GlassCard className="stat-card">
          <div className="stat-icon-wrapper blue">
            <FiLayers />
          </div>
          <div className="stat-content">
            <span className="stat-label">Subjects Covered</span>
            <span className="stat-value">{coveredSubjectsCount}</span>
          </div>
        </GlassCard>
      </div>

      {/* Search and Filters */}
      <GlassCard className="filter-controls-card">
        <div className="search-row">
          <div className="search-input-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by title, description, or tags..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
            />
            {searchQuery && (
              <button
                type="button"
                className="clear-search-btn"
                onClick={() => dispatch(setSearchQuery(''))}
                aria-label="Clear search"
              >
                <FiX />
              </button>
            )}
          </div>
        </div>

        {/* Subject Pills with Desktop Scroll Arrows & Mobile Touch Scroll */}
        <div className="subject-pills-container">
          {canScrollLeft && (
            <button
              type="button"
              className="pills-scroll-arrow left"
              onClick={() => handlePillsScroll('left')}
              aria-label="Scroll subjects left"
              title="Scroll left"
            >
              <FiChevronLeft />
            </button>
          )}

          <div
            className="subject-pills-row"
            ref={pillsRef}
            onScroll={checkPillsScroll}
          >
            {SUBJECTS.map((sub) => (
              <button
                key={sub}
                type="button"
                className={`subject-pill-btn ${selectedSubject === sub ? 'active' : ''}`}
                onClick={() => dispatch(setSelectedSubject(sub))}
              >
                {sub}
              </button>
            ))}
          </div>

          {canScrollRight && (
            <button
              type="button"
              className="pills-scroll-arrow right"
              onClick={() => handlePillsScroll('right')}
              aria-label="Scroll subjects right"
              title="Scroll right"
            >
              <FiChevronRight />
            </button>
          )}
        </div>
      </GlassCard>

      {/* Materials Grid */}
      <div className="materials-container">
        {loading ? (
          <div className="materials-grid">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : items.length > 0 ? (
          <div className="materials-grid">
            {items.map((mat) => (
              <GlassCard
                key={mat._id}
                className="material-card"
                onClick={() => setViewingMaterial(mat)}
              >
                {/* Card Top */}
                <div className="card-top">
                  <span className="subject-badge">{mat.subject}</span>
                  <span className="file-size-badge">{formatFileSize(mat.fileSize)}</span>
                </div>

                {/* Card Middle Icon & Title */}
                <div className="card-main">
                  <div className="pdf-art-box">
                    <FiFileText className="pdf-art-icon" />
                    <span className="pdf-label">PDF</span>
                  </div>
                  <div className="card-text">
                    <h3 className="material-title" title={mat.title}>
                      {mat.title}
                    </h3>
                    {mat.description && (
                      <p className="material-desc" title={mat.description}>
                        {mat.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Tags if present */}
                {mat.tags && mat.tags.length > 0 && (
                  <div className="card-tags">
                    {mat.tags.slice(0, 3).map((t) => (
                      <span key={t} className="tag-pill">
                        #{t}
                      </span>
                    ))}
                    {mat.tags.length > 3 && (
                      <span className="tag-more">+{mat.tags.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Card Bottom Meta & Actions */}
                <div className="card-footer">
                  <div className="upload-date">
                    <FiClock className="clock-icon" />
                    <span>{formatDate(mat.createdAt)}</span>
                  </div>

                  <div className="card-actions">
                    <button
                      type="button"
                      className="icon-action-btn view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingMaterial(mat);
                      }}
                      title="View PDF"
                      aria-label="View PDF"
                    >
                      <FiEye />
                    </button>

                    <button
                      type="button"
                      className="icon-action-btn download-btn"
                      onClick={(e) => handleDownload(mat, e)}
                      disabled={downloadingId === mat._id}
                      title="Download PDF"
                      aria-label="Download PDF"
                    >
                      <FiDownload />
                    </button>

                    <button
                      type="button"
                      className="icon-action-btn delete-btn"
                      onClick={(e) => handleDelete(mat, e)}
                      title="Delete PDF"
                      aria-label="Delete PDF"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <GlassCard className="empty-materials-card">
            <div className="empty-icon-box">
              <FiBook className="empty-icon" />
            </div>
            <h3>
              {searchQuery || selectedSubject !== 'All'
                ? 'No matching materials found'
                : 'Your PDF Vault is empty'}
            </h3>
            <p>
              {searchQuery || selectedSubject !== 'All'
                ? 'Try adjusting your subject filter or search terms.'
                : 'Upload your learning materials, syllabus, handwritten notes, or JECA question papers for easy reference anywhere.'}
            </p>
            <Button
              variant="primary"
              onClick={() => setIsUploadOpen(true)}
              className="empty-cta-btn"
            >
              <FiUploadCloud />
              <span>Upload Document</span>
            </Button>
          </GlassCard>
        )}
      </div>

      {/* Upload Modal */}
      <UploadMaterialModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />

      {/* PDF Viewer Modal */}
      <PdfViewerModal
        material={viewingMaterial}
        isOpen={Boolean(viewingMaterial)}
        onClose={() => setViewingMaterial(null)}
      />
    </div>
  );
};

export default Materials;
