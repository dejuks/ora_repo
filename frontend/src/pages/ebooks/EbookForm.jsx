// components/EbookForm.jsx
import { useState, useEffect, useRef } from "react";

export default function EbookForm({ initialData = {}, onSubmit }) {
  const fileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  
  const [form, setForm] = useState({
    title: initialData.title || "",
    abstract: initialData.abstract || "",
    keywords: initialData.keywords?.join(", ") || "",
    status: initialData.status || "draft",
    editor_id: initialData.editor_id || "",
    finance_clearance: initialData.finance_clearance || false,
    language: initialData.language || "om",
    page_count: initialData.page_count || "",
    file_format: initialData.file_format || "",
  });

  const [manuscriptFile, setManuscriptFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [fileToRemove, setFileToRemove] = useState({ type: null, isExisting: false });
  const [currentFiles, setCurrentFiles] = useState({
    manuscript: initialData.manuscript_file || null,
    cover: initialData.cover_image || null
  });
  
  const [editors, setEditors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState("");

  // Fetch available editors (users with editor role)
  useEffect(() => {
    const fetchEditors = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/users/editors");
        const data = await res.json();
        if (data.success) {
          setEditors(data.data);
        }
      } catch (error) {
        console.error("Error fetching editors:", error);
      }
    };
    fetchEditors();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    setFileError("");

    if (!file) return;

    // Validate file based on type
    if (type === 'manuscript') {
      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setFileError("Manuscript file must be less than 50MB");
        return;
      }
      
      // Check file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/epub+zip',
        'text/plain'
      ];
      
      if (!allowedTypes.includes(file.type) && 
          !file.name.match(/\.(pdf|doc|docx|epub|txt)$/i)) {
        setFileError("Please upload PDF, DOC, DOCX, EPUB, or TXT files");
        return;
      }
      
      setManuscriptFile(file);
      setForm(prev => ({
        ...prev,
        file_format: file.name.split('.').pop().toUpperCase()
      }));
    } 
    else if (type === 'cover') {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setFileError("Cover image must be less than 5MB");
        return;
      }
      
      // Check file type
      if (!file.type.startsWith('image/')) {
        setFileError("Please upload an image file");
        return;
      }
      
      setCoverImage(file);
    }
  };

  const removeFile = (type) => {
    if (type === 'manuscript') {
      setManuscriptFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } else {
      setCoverImage(null);
      if (coverInputRef.current) coverInputRef.current.value = '';
    }
  };

  const confirmRemoveFile = (type, isExisting = false) => {
    setFileToRemove({ type, isExisting });
    setShowConfirmModal(true);
  };

  const handleRemoveConfirmed = async () => {
    const { type, isExisting } = fileToRemove;
    
    if (isExisting) {
      try {
        const endpoint = type === 'manuscript' 
          ? `http://localhost:5000/api/ebooks/${initialData.id}/manuscript`
          : `http://localhost:5000/api/ebooks/${initialData.id}/cover`;
        
        const res = await fetch(endpoint, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        
        const data = await res.json();
        if (data.success) {
          setCurrentFiles(prev => ({
            ...prev,
            [type]: null
          }));
        }
      } catch (error) {
        console.error(`Error removing ${type}:`, error);
      }
    } else {
      removeFile(type);
    }
    
    setShowConfirmModal(false);
    setFileToRemove({ type: null, isExisting: false });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setUploading(true);

    try {
      // First, create/update ebook metadata
      const submitData = {
        ...form,
        keywords: form.keywords
          .split(",")
          .map(k => k.trim())
          .filter(k => k.length > 0),
        page_count: form.page_count ? parseInt(form.page_count) : null,
      };

      const url = initialData.id 
        ? `http://localhost:5000/api/ebooks/${initialData.id}` 
        : "http://localhost:5000/api/ebooks";
      const method = initialData.id ? "PUT" : "POST";

      // Create form data for file upload
      const formData = new FormData();
      
      // Add metadata as JSON string
      formData.append('data', JSON.stringify(submitData));
      
      // Add files if selected
      if (manuscriptFile) {
        formData.append('manuscript', manuscriptFile);
      }
      if (coverImage) {
        formData.append('cover', coverImage);
      }

      // Simulate upload progress (since fetch doesn't provide progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      const data = await res.json();

      if (data.success) {
        setTimeout(() => {
          onSubmit(data.data);
        }, 500);
      } else {
        alert(data.message);
      }
    } catch (err) {
      alert("Error saving ebook");
    } finally {
      setTimeout(() => {
        setLoading(false);
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="row">
          {/* TITLE */}
          <div className="col-md-12">
            <div className="form-group">
              <label>
                <i className="fas fa-book mr-1 text-primary"></i>
                Book Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                name="title"
                className="form-control"
                placeholder="Enter ebook title..."
                value={form.title}
                onChange={handleChange}
                required
                maxLength="255"
              />
              <small className="text-muted">
                {form.title.length}/255 characters
              </small>
            </div>
          </div>

          {/* LANGUAGE */}
          <div className="col-md-4">
            <div className="form-group">
              <label>
                <i className="fas fa-language mr-1 text-info"></i>
                Language
              </label>
              <select
                name="language"
                className="form-control"
                value={form.language}
                onChange={handleChange}
              >
                <option value="om">Afaan Oromoo</option>
                <option value="en">English</option>
                <option value="am">አማርኛ</option>
              </select>
            </div>
          </div>

          {/* PAGE COUNT */}
          <div className="col-md-4">
            <div className="form-group">
              <label>
                <i className="fas fa-file-alt mr-1 text-secondary"></i>
                Page Count
              </label>
              <input
                type="number"
                name="page_count"
                className="form-control"
                placeholder="Number of pages"
                value={form.page_count}
                onChange={handleChange}
                min="1"
              />
            </div>
          </div>

          {/* FILE FORMAT */}
          <div className="col-md-4">
            <div className="form-group">
              <label>
                <i className="fas fa-file-pdf mr-1 text-danger"></i>
                Format
              </label>
              <input
                type="text"
                name="file_format"
                className="form-control"
                placeholder="PDF, EPUB, etc."
                value={form.file_format}
                onChange={handleChange}
                readOnly={!!manuscriptFile}
              />
            </div>
          </div>

          {/* ABSTRACT */}
          <div className="col-md-12">
            <div className="form-group">
              <label>
                <i className="fas fa-align-left mr-1 text-info"></i>
                Abstract / Description
              </label>
              <textarea
                name="abstract"
                className="form-control"
                rows="4"
                placeholder="Provide a brief summary of the book..."
                value={form.abstract}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* KEYWORDS */}
          <div className="col-md-6">
            <div className="form-group">
              <label>
                <i className="fas fa-tags mr-1 text-success"></i>
                Keywords
              </label>
              <input
                type="text"
                name="keywords"
                className="form-control"
                placeholder="history, culture, language (comma separated)"
                value={form.keywords}
                onChange={handleChange}
              />
              <small className="text-muted">
                Separate keywords with commas
              </small>
            </div>
          </div>

          {/* STATUS */}
          <div className="col-md-3">
            <div className="form-group">
              <label>
                <i className="fas fa-flag mr-1 text-warning"></i>
                Status
              </label>
              <select
                name="status"
                className="form-control"
                value={form.status}
                onChange={handleChange}
              >
                <option value="draft">📝 Draft</option>
                <option value="under_review">🔍 Under Review</option>
                <option value="accepted">✅ Accepted</option>
                <option value="published">📚 Published</option>
              </select>
            </div>
          </div>

          {/* EDITOR ASSIGNMENT */}
          <div className="col-md-3">
            <div className="form-group">
              <label>
                <i className="fas fa-user-edit mr-1 text-secondary"></i>
                Assign Editor
              </label>
              <select
                name="editor_id"
                className="form-control"
                value={form.editor_id}
                onChange={handleChange}
              >
                <option value="">-- Select Editor --</option>
                {editors.map(editor => (
                  <option key={editor.uuid} value={editor.uuid}>
                    {editor.full_name} ({editor.email})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* FILE UPLOAD SECTION */}
        <div className="row mt-4">
          <div className="col-12">
            <h5 className="mb-3">
              <i className="fas fa-paperclip mr-2 text-primary"></i>
              Manuscript Files
            </h5>
          </div>

          {/* Manuscript Upload */}
          <div className="col-md-6">
            <div className="card border-0 bg-light mb-3">
              <div className="card-body">
                <h6 className="mb-3">
                  <i className="fas fa-file-pdf text-danger mr-2"></i>
                  Manuscript File
                </h6>
                
                {/* Existing file */}
                {currentFiles.manuscript && !manuscriptFile && (
                  <div className="alert alert-info d-flex align-items-center justify-content-between">
                    <div>
                      <i className="fas fa-check-circle text-success mr-2"></i>
                      <strong>Current file:</strong> {currentFiles.manuscript.split('/').pop()}
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => confirmRemoveFile('manuscript', true)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                )}

                {/* New file selected */}
                {manuscriptFile && (
                  <div className="alert alert-success d-flex align-items-center justify-content-between">
                    <div>
                      <i className="fas fa-file mr-2"></i>
                      <strong>{manuscriptFile.name}</strong>
                      <br />
                      <small>{(manuscriptFile.size / 1024 / 1024).toFixed(2)} MB</small>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => confirmRemoveFile('manuscript', false)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}

                {/* Upload button */}
                <div className="upload-area">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleFileChange(e, 'manuscript')}
                    accept=".pdf,.doc,.docx,.epub,.txt"
                    style={{ display: 'none' }}
                    id="manuscript-upload"
                  />
                  <label
                    htmlFor="manuscript-upload"
                    className="btn btn-outline-primary btn-block"
                  >
                    <i className="fas fa-upload mr-2"></i>
                    {currentFiles.manuscript ? 'Replace Manuscript' : 'Upload Manuscript'}
                  </label>
                </div>

                <small className="text-muted d-block mt-2">
                  <i className="fas fa-info-circle mr-1"></i>
                  Accepted formats: PDF, DOC, DOCX, EPUB, TXT (Max 50MB)
                </small>
              </div>
            </div>
          </div>

          {/* Cover Image Upload */}
          <div className="col-md-6">
            <div className="card border-0 bg-light mb-3">
              <div className="card-body">
                <h6 className="mb-3">
                  <i className="fas fa-image text-success mr-2"></i>
                  Cover Image
                </h6>
                
                {/* Existing cover */}
                {currentFiles.cover && !coverImage && (
                  <div className="alert alert-info d-flex align-items-center justify-content-between">
                    <div>
                      <i className="fas fa-check-circle text-success mr-2"></i>
                      <strong>Current cover:</strong> {currentFiles.cover.split('/').pop()}
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => confirmRemoveFile('cover', true)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                )}

                {/* New cover preview */}
                {coverImage && (
                  <div className="alert alert-success d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      {coverImage.type.startsWith('image/') && (
                        <img
                          src={URL.createObjectURL(coverImage)}
                          alt="Preview"
                          style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', marginRight: '10px' }}
                        />
                      )}
                      <div>
                        <strong>{coverImage.name}</strong>
                        <br />
                        <small>{(coverImage.size / 1024).toFixed(0)} KB</small>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => confirmRemoveFile('cover', false)}
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}

                {/* Upload button */}
                <div className="upload-area">
                  <input
                    type="file"
                    ref={coverInputRef}
                    onChange={(e) => handleFileChange(e, 'cover')}
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="cover-upload"
                  />
                  <label
                    htmlFor="cover-upload"
                    className="btn btn-outline-success btn-block"
                  >
                    <i className="fas fa-upload mr-2"></i>
                    {currentFiles.cover ? 'Replace Cover' : 'Upload Cover Image'}
                  </label>
                </div>

                <small className="text-muted d-block mt-2">
                  <i className="fas fa-info-circle mr-1"></i>
                  Accepted formats: JPG, PNG, GIF (Max 5MB)
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* File Error */}
        {fileError && (
          <div className="alert alert-danger mt-3">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {fileError}
          </div>
        )}

        {/* Upload Progress */}
        {uploading && uploadProgress > 0 && (
          <div className="mt-3">
            <div className="progress" style={{ height: '20px' }}>
              <div
                className="progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar"
                style={{ width: `${uploadProgress}%` }}
                aria-valuenow={uploadProgress}
                aria-valuemin="0"
                aria-valuemax="100"
              >
                {uploadProgress}%
              </div>
            </div>
          </div>
        )}

        {/* FINANCE CLEARANCE */}
        <div className="row mt-4">
          <div className="col-md-6">
            <div className="form-group">
              <div className="custom-control custom-switch">
                <input
                  type="checkbox"
                  className="custom-control-input"
                  id="financeClearance"
                  name="finance_clearance"
                  checked={form.finance_clearance}
                  onChange={handleChange}
                />
                <label className="custom-control-label" htmlFor="financeClearance">
                  <i className="fas fa-dollar-sign mr-1 text-success"></i>
                  Finance Clearance Granted
                </label>
              </div>
              <small className="text-muted d-block mt-1">
                Check if financial/royalty terms are approved
              </small>
            </div>
          </div>
        </div>

        {/* KEYWORDS PREVIEW */}
        {form.keywords && form.keywords.trim().length > 0 && (
          <div className="mt-3 mb-3">
            <label className="mb-2">Keyword Preview:</label>
            <div>
              {form.keywords.split(",").map((keyword, index) => {
                const trimmed = keyword.trim();
                if (!trimmed) return null;
                return (
                  <span
                    key={index}
                    className="badge badge-pill mr-2 mb-2"
                    style={{
                      backgroundColor: "#e9ecef",
                      color: "#495057",
                      padding: "8px 15px",
                      fontSize: "0.9rem",
                    }}
                  >
                    {trimmed}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* METADATA (if editing) */}
        {initialData.created_at && (
          <div className="row mt-3">
            <div className="col-md-6">
              <small className="text-muted">
                <i className="fas fa-calendar-alt mr-1"></i>
                Created: {new Date(initialData.created_at).toLocaleDateString()}
              </small>
            </div>
            <div className="col-md-6 text-right">
              <small className="text-muted">
                <i className="fas fa-clock mr-1"></i>
                Last Updated: {new Date(initialData.updated_at).toLocaleDateString()}
              </small>
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="text-right mt-4">
          <button
            type="button"
            className="btn btn-secondary mr-2"
            onClick={() => window.history.back()}
          >
            <i className="fas fa-times mr-1"></i>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || uploading}
          >
            {loading || uploading ? (
              <>
                <span className="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
                {uploading ? 'Uploading...' : 'Saving...'}
              </>
            ) : (
              <>
                <i className="fas fa-save mr-1"></i>
                {initialData.id ? "Update Ebook" : "Create Ebook"}
              </>
            )}
          </button>
        </div>
      </form>

      {/* Custom Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={() => setShowConfirmModal(false)}>
          <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="fas fa-exclamation-triangle text-warning mr-2"></i>
                  Confirm Removal
                </h5>
                <button type="button" className="close" onClick={() => setShowConfirmModal(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to remove this {fileToRemove.type}?</p>
                {fileToRemove.isExisting && (
                  <p className="text-danger mb-0">
                    <i className="fas fa-exclamation-circle mr-1"></i>
                    This action cannot be undone.
                  </p>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowConfirmModal(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={handleRemoveConfirmed}>
                  Yes, Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}