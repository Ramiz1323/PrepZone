import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiUploadCloud,
  FiFile,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiTag,
} from 'react-icons/fi';
import { uploadMaterial, clearMaterialError } from '../../store/slices/materialSlice';
import Button from '../../components/Button';
import Input from '../../components/Input';
import '../../styles/pages/_materials.scss';

const SUBJECTS = [
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

const MAX_FILE_SIZE_MB = 25;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};

const UploadMaterialModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { uploading, uploadProgress, error } = useSelector((state) => state.material);

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [validationError, setValidationError] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileSelection = (selectedFile) => {
    setValidationError('');
    dispatch(clearMaterialError());

    if (!selectedFile) return;

    if (
      selectedFile.type !== 'application/pdf' &&
      !selectedFile.name.toLowerCase().endsWith('.pdf')
    ) {
      setValidationError('Please select a valid PDF file (.pdf).');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE_BYTES) {
      setValidationError(`File size exceeds maximum limit of ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }

    setFile(selectedFile);

    // Auto-fill title if empty
    if (!title) {
      const cleanTitle = selectedFile.name
        .replace(/\.pdf$/i, '')
        .replace(/[_-]/g, ' ')
        .trim();
      setTitle(cleanTitle);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newTag = tagInput.trim().replace(/^#/, '');
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!file) {
      setValidationError('Please select a PDF document to upload.');
      return;
    }

    if (!title.trim()) {
      setValidationError('Please enter a document title.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title.trim());
    formData.append('subject', subject);
    formData.append('description', description.trim());
    formData.append('tags', JSON.stringify(tags));

    const result = await dispatch(uploadMaterial({ formData }));

    if (!result.error) {
      // Reset form and close
      setFile(null);
      setTitle('');
      setSubject(SUBJECTS[0]);
      setDescription('');
      setTags([]);
      onClose();
    }
  };

  const handleClose = () => {
    if (uploading) return;
    setValidationError('');
    dispatch(clearMaterialError());
    onClose();
  };

  return (
    <div className="upload-modal-overlay">
      <div className="upload-modal-backdrop" onClick={handleClose} />
      <div className="upload-modal-container">
        {/* Header */}
        <div className="upload-modal-header">
          <div className="title-area">
            <h3>Upload Study Material</h3>
            <p>Save notes, syllabus, or reference books to your private vault.</p>
          </div>
          <button
            type="button"
            className="close-btn"
            onClick={handleClose}
            disabled={uploading}
            aria-label="Close"
          >
            <FiX />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="upload-form">
          {/* File Dropzone */}
          {!file ? (
            <div
              className={`dropzone ${isDragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf,application/pdf"
                className="hidden-file-input"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileSelection(e.target.files[0]);
                }}
              />
              <div className="dropzone-icon">
                <FiUploadCloud />
              </div>
              <h4>Click or drag & drop PDF here</h4>
              <p className="dropzone-hint">
                Supports PDF documents up to {MAX_FILE_SIZE_MB}MB
              </p>
            </div>
          ) : (
            <div className="selected-file-card">
              <div className="file-icon-box">
                <FiFile />
              </div>
              <div className="file-details">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{formatFileSize(file.size)}</span>
              </div>
              {!uploading && (
                <button
                  type="button"
                  className="remove-file-btn"
                  onClick={() => setFile(null)}
                  title="Remove selected file"
                >
                  <FiX />
                </button>
              )}
            </div>
          )}

          {/* Form Fields */}
          <div className="form-fields">
            <div className="form-group">
              <label>Document Title *</label>
              <Input
                placeholder="e.g., Operating System - Process Synchronization"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={uploading}
                required
              />
            </div>

            <div className="form-group">
              <label>Subject *</label>
              <select
                className="glass-input select-input"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={uploading}
              >
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Notes / Description (Optional)</label>
              <textarea
                className="glass-input textarea-input"
                rows={3}
                placeholder="Brief summary or chapters covered in this PDF..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={uploading}
                maxLength={500}
              />
            </div>

            <div className="form-group">
              <label>Tags (Optional - press Enter to add)</label>
              <div className="tag-input-container">
                <FiTag className="tag-icon" />
                <input
                  type="text"
                  placeholder="e.g. sem4, notes, pyq"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  disabled={uploading}
                />
              </div>
              {tags.length > 0 && (
                <div className="tag-list">
                  {tags.map((t) => (
                    <span key={t} className="tag-chip">
                      #{t}
                      {!uploading && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(t)}
                          aria-label={`Remove tag ${t}`}
                        >
                          &times;
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Upload Progress Bar */}
          {uploading && (
            <div className="upload-progress-wrapper">
              <div className="progress-info">
                <span>Uploading to ImageKit...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Validation or API Error Alert */}
          {(validationError || error) && (
            <div className="upload-alert error">
              <FiAlertCircle className="alert-icon" />
              <span>{validationError || error}</span>
            </div>
          )}

          {/* Actions */}
          <div className="upload-modal-actions">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={uploading}
              disabled={uploading || !file || !title.trim()}
            >
              <FiUploadCloud />
              <span>Upload PDF</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadMaterialModal;
