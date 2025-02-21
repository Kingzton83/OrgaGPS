// frontend/app/components/EditUserPopup.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DataFetcher } from './get_data';
import { User } from './interfaces';

interface EditUserPopupProps {
  dataFetcher: DataFetcher;
  user: User; // Der zu bearbeitende Benutzer
  onClose: () => void;
  onUserUpdated: () => void;
}

const EditUserPopup: React.FC<EditUserPopupProps> = ({ dataFetcher, user, onClose, onUserUpdated }) => {
  // Initialisiere die Formulardaten mit den existierenden Werten des Benutzers.
  const [formValues, setFormValues] = useState({
    email: user.email || '',
    password: '', // Optional: Neues Passwort; leer lassen, wenn nicht geändert
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone1: user.phone1 || '',
    phone2: user.phone2 || '',
    address1: user.address1 || '',
    address2: user.address2 || '',
    zip_code: user.zip_code || '',
    city: user.city || '',
    country: user.country || '',
    birth_date: user.birth_date || '',
  });
  const [error, setError] = useState<string>('');

  // Damit wir sicherstellen, dass wir erst rendern, wenn das DOM verfügbar ist
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Beim Bearbeiten rufen wir die Patch-Methode auf. Wir gehen davon aus, dass der Endpoint so aufgebaut ist:
      // GET/PUT/PATCH /api/db/users/{id}/
      const response = await dataFetcher.patchData('api/db/users', user.id, formValues);
      if (response) {
        onUserUpdated();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Error updating user.');
    }
  };

  const popupMarkup = (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Edit User</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-field">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formValues.email}
              onChange={handleChange}
              required
            />
          </div>
          {/* Optional: Passwortfeld, falls der Benutzer sein Passwort ändern möchte */}
          <div className="form-field">
            <input
              type="password"
              name="password"
              placeholder="New Password (leave blank to keep current)"
              value={formValues.password}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <input
              type="text"
              name="first_name"
              placeholder="First Name"
              value={formValues.first_name}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <input
              type="text"
              name="last_name"
              placeholder="Last Name"
              value={formValues.last_name}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <input
              type="text"
              name="phone1"
              placeholder="Phone 1"
              value={formValues.phone1}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <input
              type="text"
              name="phone2"
              placeholder="Phone 2"
              value={formValues.phone2}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <input
              type="text"
              name="address1"
              placeholder="Address 1"
              value={formValues.address1}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <input
              type="text"
              name="address2"
              placeholder="Address 2"
              value={formValues.address2}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <input
              type="text"
              name="zip_code"
              placeholder="ZIP Code"
              value={formValues.zip_code}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formValues.city}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={formValues.country}
              onChange={handleChange}
            />
          </div>
          <div className="form-field">
            <input
              type="date"
              name="birth_date"
              placeholder="Birth Date"
              value={formValues.birth_date}
              onChange={handleChange}
            />
          </div>
          <div className="modal-actions">
            <button type="submit">Update</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );

  if (mounted) {
    return createPortal(popupMarkup, document.body);
  }
  return null;
};

export default EditUserPopup;
