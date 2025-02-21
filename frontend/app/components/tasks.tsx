// frontend/app/components/tasks.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { DataFetcher } from './get_data';
import { Task } from './interfaces';
import { useRouter } from 'next/navigation';
import CreateTaskPopup from './CreateTaskPopup';
import ViewTaskPopup from './ViewTaskPopup';

const Tasks: React.FC<{ dataFetcher: DataFetcher }> = ({ dataFetcher }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showInactive, setShowInactive] = useState<boolean>(false);

  // Zustände für Auswahl und Bearbeitung (Edit, etc.)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);
  const [showTaskEditPopup, setShowTaskEditPopup] = useState<boolean>(false);

  // Zustand für das Create Task Popup
  const [showTaskPopup, setShowTaskPopup] = useState<boolean>(false);

  // Zustand für das View Task Popup
  const [showViewTaskPopup, setShowViewTaskPopup] = useState<boolean>(false);
  const [viewTask, setViewTask] = useState<Task | null>(null);

  const router = useRouter();

  // Hilfsfunktion, um die Darstellung der zugewiesenen Benutzer zu bestimmen
  const getAssignedUsersDisplay = (assigned: any): string => {
    if (Array.isArray(assigned)) {
      if (assigned.length > 1) {
        // Bei mehreren Usern: Zeige nur den ersten Benutzer vollständig und hänge "..." an
        const firstUser = assigned[0];
        return `${firstUser.first_name} ${firstUser.last_name}...`;
      } else if (assigned.length === 1) {
        // Bei nur einem User: Gib den vollständigen Namen zurück
        const user = assigned[0];
        return `${user.first_name} ${user.last_name}`;
      }
    }
    // Fallback: falls assigned ein einzelnes Objekt ist
    if (assigned) {
      return `${assigned.first_name} ${assigned.last_name}`;
    }
    return '';
  };

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const tasksData = await dataFetcher.getTasks();
        if (!tasksData) {
          router.push('/');
          return;
        }
        const sortedTasks = tasksData.sort(
          (a: Task, b: Task) =>
            new Date(a.due_date || 0).getTime() - new Date(b.due_date || 0).getTime()
        );
        setTasks(sortedTasks);
      } catch (err: any) {
        if (err.message.includes('Session expired')) {
          router.push('/login');
        } else {
          setError(err.message || 'Error fetching tasks');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [dataFetcher, router]);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    const isActive = task.status !== 'completed';
    return matchesSearch && (showInactive ? true : isActive);
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="tasks-section">
      <div className="tasks-top">
        <h2 className="tasks-title">Tasks / Jobs</h2>
        <div className="schedules-header">
          <div className="header-left">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="header-right">
            {/* Der "Add"-Button öffnet das CreateTaskPopup */}
            <button className="btn-add" onClick={() => setShowTaskPopup(true)}>
              Add
            </button>
            <button
              className="btn-edit"
              onClick={() => {
                if (taskToEdit) {
                  setShowTaskEditPopup(true);
                } else {
                  alert('Please select a task first.');
                }
              }}
            >
              Edit
            </button>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={() => setShowInactive(!showInactive)}
              />
              Show inactive tasks
            </label>
          </div>
        </div>
      </div>

      {/* Create Task Popup */}
      {showTaskPopup && (
        <CreateTaskPopup
          dataFetcher={dataFetcher}
          onClose={() => setShowTaskPopup(false)}
          onTaskCreated={() => {
            // Optional: Liste neu laden
          }}
        />
      )}

      {/* Optional: Edit Task Popup (falls implementiert) */}
      {showTaskEditPopup && taskToEdit && (
        // Hier könnte ein EditTaskPopup ähnlich wie EditUserPopup implementiert werden
        null
      )}

      <div className="tasks-table-container">
        <div className="table-header">
          <div className="table-cell">Status</div>
          <div className="table-cell">User</div>
          <div className="table-cell">Title</div>
          <div className="table-cell">Due Date</div>
          <div className="table-cell">Contact Person</div>
          <div className="table-cell">Description</div>
        </div>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task: Task) => (
            <div
              className={`table-row ${selectedTaskId === task.id ? 'selected' : ''}`}
              key={task.id}
              onClick={() => {
                if (selectedTaskId === task.id) {
                  setSelectedTaskId(null);
                  setTaskToEdit(null);
                } else {
                  setSelectedTaskId(task.id);
                  setTaskToEdit(task);
                }
              }}
              onDoubleClick={() => {
                setViewTask(task);
                setShowViewTaskPopup(true);
              }}
            >
              <div className="table-cell">{task.status}</div>
              <div className="table-cell assigned-users">
                {getAssignedUsersDisplay(task.assigned_to)}
              </div>
              <div className="table-cell">{task.title}</div>
              <div className="table-cell">
                {task.due_date ? new Date(task.due_date).toLocaleString() : '-'}
              </div>
              <div className="table-cell">{task.contact_person || '-'}</div>
              <div className="table-cell">{task.description || '-'}</div>
            </div>
          ))
        ) : (
          <p>-no tasks found-</p>
        )}
      </div>

      {/* View Task Popup */}
      {showViewTaskPopup && viewTask && (
        <ViewTaskPopup
          dataFetcher={dataFetcher}
          task={viewTask}
          onClose={() => setShowViewTaskPopup(false)}
        />
      )}
    </div>
  );
};

export default Tasks;
