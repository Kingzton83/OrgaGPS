// frontend/app/components/ViewUserPopup.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DataFetcher } from './get_data';
import { User } from './interfaces';

interface ViewUserPopupProps {
  dataFetcher: DataFetcher;
  user: User; // Der Benutzer, dessen Daten angezeigt werden sollen
  onClose: () => void;
}

const ViewUserPopup: React.FC<ViewUserPopupProps> = ({ dataFetcher, user, onClose }) => {
  // Wir benötigen keine Formulardaten zum Bearbeiten, sondern zeigen nur die Daten an.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const popupMarkup = (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>View User</h2>
        <div className="view-field">
          <strong>Email:</strong> {user.email}
        </div>
        <div className="view-field">
          <strong>First Name:</strong> {user.first_name}
        </div>
        <div className="view-field">
          <strong>Last Name:</strong> {user.last_name}
        </div>
        <div className="view-field">
          <strong>Phone:</strong> {user.phone1 || '-'}
        </div>
        <div className="view-field">
          <strong>City:</strong> {user.city || '-'}
        </div>
        {/* Füge hier weitere Felder hinzu, falls erforderlich */}
        <div className="modal-actions">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );

  if (mounted) {
    return createPortal(popupMarkup, document.body);
  }
  return null;
};

export default ViewUserPopup;
