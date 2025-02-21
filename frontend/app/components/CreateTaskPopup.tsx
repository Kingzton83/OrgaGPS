// frontend/app/components/CreateTaskPopup.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DataFetcher } from './get_data';
import { Task, User } from './interfaces';
import SelectTaskUser from './SelectTaskUser';

interface CreateTaskPopupProps {
  dataFetcher: DataFetcher;
  onClose: () => void;
  onTaskCreated: () => void;
}

const CreateTaskPopup: React.FC<CreateTaskPopupProps> = ({ dataFetcher, onClose, onTaskCreated }) => {
  // Formularfelder entsprechend dem Task-Modell. Für das Schreiben verwenden wir das Feld "assigned_to_ids".
  const [formValues, setFormValues] = useState({
    assigned_to_ids: [] as string[],
    title: '',
    description: '',
    due_date: '',
    status: 'open',
    contact_person: '',
    contact_phone: '',
    contact_email: '',
    address: '',
    zip_code: '',
    city: '',
  });

  // Dieser State hält den angezeigten Text für die ausgewählten User.
  const [selectedUserName, setSelectedUserName] = useState<string>('Select users');
  // State für Due Date Checkbox
  const [hasDueDate, setHasDueDate] = useState<boolean>(false);

  const [error, setError] = useState<string>('');
  const [mounted, setMounted] = useState<boolean>(false);
  const [showSelectUserPopup, setShowSelectUserPopup] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formValues.assigned_to_ids || formValues.assigned_to_ids.length === 0) {
      setError("Please select at least one user to assign the task to.");
      return;
    }

    // Konvertiere due_date nur, wenn hasDueDate aktiviert ist und ein Wert eingegeben wurde
    const payload = {
      ...formValues,
      due_date: hasDueDate && formValues.due_date ? new Date(formValues.due_date).toISOString() : null,
    };

    try {
      const response = await dataFetcher.postData<Task>('api/db/tasks/', payload);
      if (response) {
        onTaskCreated();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Error creating task.');
    }
  };

  const popupMarkup = (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create Task/Job</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {/* Assigned To: Button öffnet den User-Auswahl-Popup */}
          <div className="form-field">
            <label>Assigned To:</label>
            <button
              type="button"
              onClick={() => setShowSelectUserPopup(true)}
              style={{ width: '100%', padding: '0.75em', fontSize: '16px' }}
            >
              {selectedUserName}
            </button>
          </div>
          <div className="form-field">
            <label>Title:</label>
            <input
              type="text"
              name="title"
              placeholder="Task title"
              value={formValues.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label>Description:</label>
            <textarea
              name="description"
              placeholder="Task description"
              value={formValues.description}
              onChange={handleChange}
              required
              rows={4}
              style={{ width: '100%' }}
            />
          </div>
          {/* Checkbox zum Setzen eines Fälligkeitsdatums */}
          <div className="form-field">
            <label>
              <input
                type="checkbox"
                checked={hasDueDate}
                onChange={() => setHasDueDate(!hasDueDate)}
              />
              {' '}Set Due Date
            </label>
          </div>
          {/* Nur anzeigen, wenn die Checkbox aktiviert ist */}
          {hasDueDate && (
            <div className="form-field">
              <label>Due Date:</label>
              <input
                type="datetime-local"
                name="due_date"
                value={formValues.due_date}
                onChange={handleChange}
              />
            </div>
          )}
          <div className="form-field">
            <label>Status:</label>
            <input
              type="text"
              name="status"
              placeholder="open / in progress / completed"
              value={formValues.status}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-field">
            <label>Contact Person:</label>
            <input
              type="text"
              name="contact_person"
              placeholder="Contact person"
              value={formValues.contact_person}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <label>Contact Phone:</label>
            <input
              type="text"
              name="contact_phone"
              placeholder="Contact phone"
              value={formValues.contact_phone}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <label>Contact Email:</label>
            <input
              type="email"
              name="contact_email"
              placeholder="Contact email"
              value={formValues.contact_email}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <label>Address:</label>
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formValues.address}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <label>ZIP Code:</label>
            <input
              type="text"
              name="zip_code"
              placeholder="ZIP Code"
              value={formValues.zip_code}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <label>City:</label>
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formValues.city}
              onChange={handleChange}
            />
          </div>
          <div className="modal-actions">
            <button type="submit">Create</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
        {showSelectUserPopup && (
          <SelectTaskUser
            dataFetcher={dataFetcher}
            onSelect={(selectedUsers: User[]) => {
              // Speichere die IDs aller ausgewählten User
              setFormValues({ ...formValues, assigned_to_ids: selectedUsers.map(u => u.id) });
              // Erstelle eine Zeichenkette mit den Namen aller ausgewählten User
              const names = selectedUsers.map(u => `${u.first_name} ${u.last_name}`);
              let displayName = names.join(', ');
              if (displayName.length > 30) {
                displayName = displayName.slice(0, 30) + '...';
              }
              setSelectedUserName(displayName);
            }}
            onClose={() => setShowSelectUserPopup(false)}
          />
        )}
      </div>
    </div>
  );

  return mounted ? createPortal(popupMarkup, document.body) : null;
};

export default CreateTaskPopup;
