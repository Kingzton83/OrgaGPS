// frontend/app/components/Users.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { DataFetcher } from './get_data';
import { User } from './interfaces';
import { useRouter } from 'next/navigation';
import CreateUserPopup from "./CreateUserPopup";
import EditUserPopup from "./EditUserPopup";
import ViewUserPopup from "./ViewUserPopup";

const Users: React.FC<{ dataFetcher: DataFetcher }> = ({ dataFetcher }) => {
  // Bestehende States
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [showPopup, setShowPopup] = useState<boolean>(false);
  
  // Zustände für Edit- und View-Popup sowie Auswahl
  const [showEditPopup, setShowEditPopup] = useState<boolean>(false);
  const [showViewPopup, setShowViewPopup] = useState<boolean>(false);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await dataFetcher.getData('api/db/users/');
        if (data) {
          const sortedUsers = data.sort((a: User, b: User) => {
            if (a.last_name < b.last_name) return -1;
            if (a.last_name > b.last_name) return 1;
            if (a.first_name < b.first_name) return -1;
            if (a.first_name > b.first_name) return 1;
            return 0;
          });
          setUsers(sortedUsers);
        }
      } catch (err: any) {
        setError(err.message || "Error fetching users");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [dataFetcher]);

  const filteredUsers = users.filter((user) => {
    const matchesSearch = `${user.first_name} ${user.last_name}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="users-section">
      <div className="users-top">
        <h2 className="users-title">Users</h2>
        <div className="schedules-header">
          <div className="header-left">
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="header-right">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={() => setShowInactive(!showInactive)}
              />
              Show inactive users
            </label>
            <button className="btn-add" onClick={() => setShowPopup(true)}>
              Add
            </button>
            <button
              className="btn-edit"
              onClick={() => {
                if (userToEdit) {
                  setShowEditPopup(true);
                } else {
                  alert("Please select a user first.");
                }
              }}
            >
              Edit
            </button>
          </div>
        </div>
      </div>

      {showPopup && (
        <CreateUserPopup
          dataFetcher={dataFetcher}
          onClose={() => setShowPopup(false)}
          onUserCreated={() => {
            // Optional: Erneutes Laden der Benutzerliste
          }}
        />
      )}

      {showEditPopup && userToEdit && (
        <EditUserPopup
          dataFetcher={dataFetcher}
          user={userToEdit}
          onClose={() => setShowEditPopup(false)}
          onUserUpdated={() => {
            // Optional: Erneutes Laden der Benutzerliste
          }}
        />
      )}

      {showViewPopup && userToEdit && (
        <ViewUserPopup
          dataFetcher={dataFetcher}
          user={userToEdit}
          onClose={() => setShowViewPopup(false)}
        />
      )}

      <div className="users-table-container">
        <div className="table-header">
          <div className="table-cell">Name</div>
          <div className="table-cell">Email</div>
          <div className="table-cell">Phone</div>
          <div className="table-cell">City</div>
        </div>
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user: User) => (
            <div
              className={`table-row ${selectedUserId === user.id ? 'selected' : ''}`}
              key={user.id}
              onClick={() => {
                // Toggle-Auswahl: Wenn bereits ausgewählt, abwählen; sonst auswählen
                if (selectedUserId === user.id) {
                  setSelectedUserId(null);
                  setUserToEdit(null);
                } else {
                  setSelectedUserId(user.id);
                  setUserToEdit(user);
                }
              }}
              onDoubleClick={() => {
                setUserToEdit(user);
                setShowViewPopup(true);
              }}
            >
              <div className="table-cell">{user.first_name} {user.last_name}</div>
              <div className="table-cell">{user.email}</div>
              <div className="table-cell">{user.phone1 || '-'}</div>
              <div className="table-cell">{user.city || '-'}</div>
            </div>
          ))
        ) : (
          <p>-no users found-</p>
        )}
      </div>
    </div>
  );
};

export default Users;
