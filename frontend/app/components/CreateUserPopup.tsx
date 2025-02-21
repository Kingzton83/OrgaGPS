// frontend/app/components/CreateUserPopup.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DataFetcher } from './get_data';

interface CreateUserPopupProps {
  dataFetcher: DataFetcher;
  onClose: () => void;
  onUserCreated: () => void;
}

const CreateUserPopup: React.FC<CreateUserPopupProps> = ({ dataFetcher, onClose, onUserCreated }) => {
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone1: '',
    phone2: '',
    address1: '',
    address2: '',
    zip_code: '',
    city: '',
    country: '',
    birth_date: '',
  });
  const [error, setError] = useState<string>('');

  // Für die Verwendung von Portals: Stelle sicher, dass das DOM geladen ist
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
      const payload = {
        ...formValues,
        username: formValues.email,
      };
      const response = await dataFetcher.postData('api/db/users/', payload);
      if (response) {
        onUserCreated();
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Error creating user.');
    }
  };

  const popupMarkup = (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create User</h2>
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
            <button type="submit">Create</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );

  // Rendere das Popup per Portal, wenn mounted
  if (mounted) {
    return createPortal(popupMarkup, document.body);
  }
  return null;
};

export default CreateUserPopup;
