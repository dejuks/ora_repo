import React from 'react';

export default function CrudModal({ open, title, children, footer, onClose, size = 'lg' }) {
  if (!open) return null;

  const dialogMaxWidth = size === 'xl' ? '1140px' : size === 'md' ? '680px' : '920px';

  return (
    <div
      className="modal d-block"
      tabIndex="-1"
      role="dialog"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
      onClick={onClose}
    >
      <div
        className="modal-dialog modal-dialog-scrollable"
        role="document"
        style={{ maxWidth: dialogMaxWidth }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="close" aria-label="Close" onClick={onClose}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">{children}</div>
          {footer ? <div className="modal-footer">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
