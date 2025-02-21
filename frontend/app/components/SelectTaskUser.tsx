// frontend/app/components/SelectTaskUser.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { DataFetcher } from './get_data';
import { User } from './interfaces';

interface SelectTaskUserProps {
  dataFetcher: DataFetcher;
  onSelect: (selectedUsers: User[]) => void;
  onClose: () => void;
  allowedUsers?: User[]; // Optional: Falls vorhanden, werden nur diese Benutzer angezeigt
}

const SelectTaskUser: React.FC<SelectTaskUserProps> = ({ dataFetcher, onSelect, onClose, allowedUsers }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await dataFetcher.getData('api/db/users/');
        if (data) {
          setUsers(data);
        }
      } catch (err: any) {
        setError(err.message || "Error fetching users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [dataFetcher]);

  // Filtere Benutzer anhand des Suchbegriffs.
  // Wenn allowedUsers übergeben wird, zeige nur diese an.
  const filteredUsers = users.filter((user: User) => {
    const matchesSearch = `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchQuery.toLowerCase());
    if (allowedUsers && allowedUsers.length > 0) {
      return matchesSearch && allowedUsers.some((allowedUser) => allowedUser.id === user.id);
    }
    return matchesSearch;
  });

  const toggleUserSelection = (user: User) => {
    const alreadySelected = selectedUsers.find((u) => u.id === user.id);
    if (alreadySelected) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleConfirmSelection = () => {
    onSelect(selectedUsers);
    onClose();
  };

  const popupMarkup = (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        <h2>Select Users</h2>
        {error && <div className="error">{error}</div>}
        <input
          type="text"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
          style={{ marginBottom: '1em' }}
        />
        {loading ? (
          <div>Loading...</div>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user: User) => (
            <div
              key={user.id}
              className="table-row"
              style={{ display: 'flex', alignItems: 'center', padding: '0.5em', borderBottom: '1px solid #ddd' }}
            >
              <input
                type="checkbox"
                checked={!!selectedUsers.find((u) => u.id === user.id)}
                onChange={() => toggleUserSelection(user)}
                style={{ marginRight: '0.5em' }}
              />
              <span style={{ cursor: 'pointer' }} onClick={() => toggleUserSelection(user)}>
                {user.first_name} {user.last_name} ({user.email})
              </span>
            </div>
          ))
        ) : (
          <div>No users found.</div>
        )}
        <div className="modal-actions" style={{ marginTop: '1em', textAlign: 'right' }}>
          <button onClick={handleConfirmSelection} style={{ marginRight: '0.5em' }}>
            Add Selected
          </button>
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );

  return createPortal(popupMarkup, document.body);
};

export default SelectTaskUser;
