// frontend/app/components/ViewTaskPopup.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { DataFetcher } from './get_data';
import { Task, Job, User } from './interfaces';
import CreateJobPopup from './CreateJobPopup';
import ViewJobPopup from './ViewJobPopup';

// Hilfsfunktion: fügt eine führende Null hinzu
const pad = (n: number): string => (n < 10 ? '0' + n : String(n));

// Formatiert ein Datum als "MM/DD/YYYY, HH:MM" im 24-Stunden-Format
const formatDateTime = (dateStr: string | null | undefined): string => {
  if (!dateStr || dateStr.trim() === '' || dateStr === 'null') return 'Ongoing';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return 'Ongoing';
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const year = date.getFullYear();
  const hour = pad(date.getHours());
  const minute = pad(date.getMinutes());
  return `${month}/${day}/${year}, ${hour}:${minute}`;
};

interface ViewTaskPopupProps {
  dataFetcher: DataFetcher;
  task: Task;
  onClose: () => void;
}

const ViewTaskPopup: React.FC<ViewTaskPopupProps> = ({ dataFetcher, task, onClose }) => {
  const [mounted, setMounted] = useState(false);
  const [showAddJobPopup, setShowAddJobPopup] = useState<boolean>(false);
  const [jobList, setJobList] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showViewJobPopup, setShowViewJobPopup] = useState<boolean>(false);

  // Beim Mounten sofort die Jobliste für diesen Task abrufen
  useEffect(() => {
    setMounted(true);
    refreshJobList();
  }, [dataFetcher, task.id]);

  const refreshJobList = async () => {
    try {
      const data = await dataFetcher.getData(`api/db/jobs/?task=${task.id}`);
      if (data) {
        setJobList(data);
      }
    } catch (err) {
      console.error('Error fetching jobs', err);
    }
  };

  const renderAssignedUsers = () => {
    if (Array.isArray(task.assigned_to) && task.assigned_to.length > 0) {
      return task.assigned_to.map((user, index) => (
        <span key={user.id}>
          {user.first_name} {user.last_name}
          {index < task.assigned_to.length - 1 && ', '}
        </span>
      ));
    }
    if (task.assigned_to) {
      return `${task.assigned_to.first_name} ${task.assigned_to.last_name}`;
    }
    return '';
  };

  const renderJobList = () => {
    if (jobList && jobList.length > 0) {
      return (
        <table className="job-list-table">
          <thead>
            <tr>
              <th>Status</th>
              <th>Created At</th>
              <th>Assigned Users</th>
              <th>Description</th>
              <th>Job Finished</th>
            </tr>
          </thead>
          <tbody>
            {jobList.map((job) => (
              <tr
                key={job.id}
                onDoubleClick={() => {
                  setSelectedJob(job);
                  setShowViewJobPopup(true);
                }}
              >
                <td>{job.status}</td>
                <td>{formatDateTime(job.created_at)}</td>
                <td>
                  {job.assigned_to && Array.isArray(job.assigned_to) && job.assigned_to.length > 0
                    ? job.assigned_to.length > 1
                      ? `${job.assigned_to[0].first_name} ${job.assigned_to[0].last_name}...`
                      : `${job.assigned_to[0].first_name} ${job.assigned_to[0].last_name}`
                    : '-'}
                </td>
                <td>{job.description}</td>
                <td>{job.finished_at ? formatDateTime(job.finished_at) : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }
    return <p>No jobs added yet.</p>;
  };

  const renderTaskEntries = () => {
    if (task.entries && task.entries.length > 0) {
      return (
        <table className="task-entries-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>User</th>
              <th>Message</th>
              <th>Attachments</th>
            </tr>
          </thead>
          <tbody>
            {task.entries.map((entry) => {
              const entryDate = new Date(entry.created_at);
              return (
                <tr key={entry.id}>
                  <td>{entryDate.toLocaleDateString()}</td>
                  <td>
                    {entryDate.toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false,
                    })}
                  </td>
                  <td>
                    {entry.user.first_name} {entry.user.last_name}
                  </td>
                  <td>{entry.entry_text}</td>
                  <td>
                    {entry.attachments && entry.attachments.length > 0 ? (
                      entry.attachments.map((attachment) => (
                        <div key={attachment.id}>
                          <a href={attachment.file} target="_blank" rel="noopener noreferrer">
                            View File
                          </a>
                        </div>
                      ))
                    ) : (
                      '-'
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      );
    }
    return <p>No entries yet.</p>;
  };

  const popupMarkup = (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <h2>{task.title}</h2>
        <div className="view-field">
          <strong>Assigned To:</strong> {renderAssignedUsers()}
        </div>
        <div className="view-field">
          <strong>Scrum Master:</strong>{' '}
          {task.scrum_master ? `${task.scrum_master.first_name} ${task.scrum_master.last_name}` : '-'}
        </div>
        {task.due_date && (
          <div className="view-field">
            <strong>Due Date:</strong> {formatDateTime(task.due_date)}
          </div>
        )}
        <div className="view-field">
          <strong>Status:</strong> {task.status}
        </div>
        <div className="view-field">
          <strong>Contact Person:</strong> {task.contact_person || '-'}
        </div>
        <div className="view-field">
          <strong>Contact Phone:</strong> {task.contact_phone || '-'}
        </div>
        <div className="view-field">
          <strong>Contact Email:</strong> {task.contact_email || '-'}
        </div>
        <div className="view-field">
          <strong>Address:</strong> {task.address || '-'}
        </div>
        <div className="view-field">
          <strong>ZIP Code:</strong> {task.zip_code || '-'}
        </div>
        <div className="view-field">
          <strong>City:</strong> {task.city || '-'}
        </div>
        <div className="view-field">
          <strong>Description:</strong>
          <p>{task.description || '-'}</p>
        </div>

        {/* Job Section: Überschrift und "Add Job"-Button in einer Zeile */}
        <div className="job-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Jobs</h3>
            <button onClick={() => setShowAddJobPopup(true)}>Add Job</button>
          </div>
          {renderJobList()}
        </div>

        {/* Task Entries - ganz unten */}
        <div className="task-entries">
          <h3>Task Entries</h3>
          {renderTaskEntries()}
        </div>

        <div className="modal-actions">
          <button onClick={onClose}>Close</button>
        </div>

        {showAddJobPopup && (
          <CreateJobPopup
            dataFetcher={dataFetcher}
            taskId={task.id}
            onClose={() => {
              setShowAddJobPopup(false);
              refreshJobList();
            }}
            onJobCreated={() => refreshJobList()}
          />
        )}

        {showViewJobPopup && selectedJob && (
          <ViewJobPopup
            dataFetcher={dataFetcher}
            job={selectedJob}
            onClose={() => setShowViewJobPopup(false)}
          />
        )}
      </div>
    </div>
  );

  return mounted ? createPortal(popupMarkup, document.body) : null;
};

export default ViewTaskPopup;
