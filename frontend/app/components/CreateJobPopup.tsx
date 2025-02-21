// frontend/app/components/CreateJobPopup.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DataFetcher } from './get_data';
import { Job, User } from './interfaces';
import SelectTaskUser from './SelectTaskUser';

interface CreateJobPopupProps {
  dataFetcher: DataFetcher;
  taskId: string; // ID des übergeordneten Tasks
  onClose: () => void;
  onJobCreated: () => void;
}

const CreateJobPopup: React.FC<CreateJobPopupProps> = ({ dataFetcher, taskId, onClose, onJobCreated }) => {
  // Wir speichern hier die ausgewählten User als Objekte (nicht nur die IDs)
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);
  // Dieser State hält den angezeigten Text für die ausgewählten User
  const [selectedUserNames, setSelectedUserNames] = useState<string>('Select users');
  const [description, setDescription] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [hasDueDate, setHasDueDate] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [mounted, setMounted] = useState<boolean>(false);
  const [showSelectUserPopup, setShowSelectUserPopup] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Wird aufgerufen, wenn in der User-Auswahl mehrere User bestätigt werden.
  const handleConfirmSelection = (users: User[]) => {
    setSelectedUsers(users);
    // Erzeuge eine Zeichenkette mit den vollständigen Namen
    const names = users.map(u => `${u.first_name} ${u.last_name}`);
    let displayName = names.join(', ');
    // Falls die Zeichenkette zu lang ist, kürzen wir sie und hängen "..." an
    if (displayName.length > 30) {
      displayName = displayName.slice(0, 30) + '...';
    }
    setSelectedUserNames(displayName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUsers.length === 0) {
      setError('Please select at least one user.');
      return;
    }
    const payload: any = {
      task: taskId,
      // Für den Schreibvorgang senden wir die IDs der ausgewählten User
      assigned_to_ids: selectedUsers.map(u => u.id),
      description,
      status: 'open'
    };
    if (hasDueDate && dueDate) {
      payload.due_date = new Date(dueDate).toISOString();
    } else {
      payload.due_date = null;
    }
    try {
      const response = await dataFetcher.postData<Job>('api/db/jobs/', payload);
      if (response) {
        onJobCreated();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Error creating job.');
    }
  };

  const popupMarkup = (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Add Job</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <label>Assigned Users:</label>
            <div>
              <button type="button" onClick={() => setShowSelectUserPopup(true)}>
                Select Users
              </button>
              <div>
                {selectedUserNames ? selectedUserNames : 'No users selected.'}
              </div>
            </div>
          </div>
          <div className="form-field">
            <label>Description:</label>
            <textarea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Job description"
              required
            />
          </div>
          <div className="form-field">
            <label>
              <input
                type="checkbox"
                checked={hasDueDate}
                onChange={() => setHasDueDate(!hasDueDate)}
              />
              Set Due Date
            </label>
          </div>
          {hasDueDate && (
            <div className="form-field">
              <label>Due Date:</label>
              <input
                type="datetime-local"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          )}
          <div className="modal-actions">
            <button type="submit">Add Job</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
        {showSelectUserPopup && (
          <SelectTaskUser
            dataFetcher={dataFetcher}
            onSelect={handleConfirmSelection}
            onClose={() => setShowSelectUserPopup(false)}
          />
        )}
      </div>
    </div>
  );

  return mounted ? createPortal(popupMarkup, document.body) : null;
};

export default CreateJobPopup;
