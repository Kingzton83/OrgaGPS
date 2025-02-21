// frontend/app/components/ViewJobPopup.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DataFetcher } from './get_data';
import { Job } from './interfaces';

// Hilfsfunktion: fügt eine führende Null hinzu
const pad = (n: number): string => n < 10 ? '0' + n : String(n);

// Formatiert ein Datum als "MM/DD/YYYY, HH:MM" im 24-Stunden-Format
const formatCreatedAt = (dateStr: string | null | undefined): string => {
  if (!dateStr || dateStr.trim() === "" || dateStr === "null") return "Ongoing";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Ongoing";
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const year = date.getFullYear();
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  return `${month}/${day}/${year}, ${hour}:${minute}`;
};

const formatDate = (dateStr: string | null | undefined): string => {
  // Analog zur formatCreatedAt-Funktion
  if (!dateStr || dateStr.trim() === "" || dateStr === "null") return "Ongoing";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Ongoing";
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const year = date.getFullYear();
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  return `${month}/${day}/${year}, ${hour}:${minute}`;
};

interface ViewJobPopupProps {
  dataFetcher: DataFetcher;
  job: Job;
  onClose: () => void;
}

const ViewJobPopup: React.FC<ViewJobPopupProps> = ({ dataFetcher, job, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const renderAssignedUsers = () => {
    if (Array.isArray(job.assigned_to) && job.assigned_to.length > 0) {
      return job.assigned_to.map((user: any, index: number) => (
        <span key={user.id}>
          {user.first_name} {user.last_name}
          {index < job.assigned_to.length - 1 && ', '}
        </span>
      ));
    }
    if (job.assigned_to) {
      return `${job.assigned_to.first_name} ${job.assigned_to.last_name}`;
    }
    return '';
  };

  const popupMarkup = (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Job Details</h2>
        <div className="view-field">
          <strong>Description:</strong> {job.description}
        </div>
        <div className="view-field">
          <strong>Status:</strong> {job.status}
        </div>
        <div className="view-field">
          <strong>Assigned To:</strong> {renderAssignedUsers()}
        </div>
        <div className="view-field">
          <strong>Created At:</strong> {formatCreatedAt(job.created_at)}
        </div>
        <div className="view-field">
          <strong>Due Date:</strong> {formatDate(job.due_date)}
        </div>
        <div className="view-field">
          <strong>Job Finished:</strong> {job.finished_at ? new Date(job.finished_at).toLocaleString() : '-'}
        </div>
        <div className="modal-actions">
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );

  return mounted ? createPortal(popupMarkup, document.body) : null;
};

export default ViewJobPopup;
