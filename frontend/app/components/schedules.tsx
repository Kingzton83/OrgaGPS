// frontend/app/components/schedules.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { DataFetcher } from './get_data';
import { Schedule } from './interfaces';
import { useRouter } from 'next/navigation';

const Schedules: React.FC<{ dataFetcher: DataFetcher }> = ({ dataFetcher }) => {
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showInactive, setShowInactive] = useState<boolean>(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [scheduleToEdit, setScheduleToEdit] = useState<Schedule | null>(null);
  const [showScheduleEditPopup, setShowScheduleEditPopup] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const userSchedules = await dataFetcher.getUserSchedules();
        if (!userSchedules) {
          router.push('/');
          return;
        }
        const sortedSchedules = userSchedules.sort(
          (a: Schedule, b: Schedule) =>
            new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
        );
        setSchedules(sortedSchedules);
      } catch (err: any) {
        if (err.message.includes('Session expired')) {
          router.push('/login');
        } else {
          setError(err.message || 'Error fetching schedules');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [dataFetcher, router]);

  const filteredSchedules = schedules.filter((schedule) => {
    const matchesSearch = schedule.event_name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const isActive = schedule.start_time_login
      ? new Date(schedule.start_time_login) <= new Date()
      : true;
    return matchesSearch && (showInactive ? true : isActive);
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="schedules-section">
      <div className="schedules-top">
        <h2 className="schedules-title">Duty Schedules</h2>
        <div className="schedules-header">
          <div className="header-left">
            <input
              type="text"
              placeholder="Search schedules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="header-right">
            <button className="btn-add" onClick={() => router.push('/dashboard/tasks/add')}>
              Add
            </button>
            <button className="btn-edit" onClick={() => router.push('/dashboard/tasks/edit')}>
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

      {/* Optional: ScheduleEditPopup könnte hier eingebunden werden */}
      {showScheduleEditPopup && scheduleToEdit && (
        // <EditSchedulePopup
        //   dataFetcher={dataFetcher}
        //   schedule={scheduleToEdit}
        //   onClose={() => setShowScheduleEditPopup(false)}
        //   onScheduleUpdated={() => { /* Optional: Liste aktualisieren */ }}
        // />
        null
      )}

      <div className="schedules-table-container">
        <div className="table-header">
          <div className="table-cell">Status</div>
          <div className="table-cell">User</div>
          <div className="table-cell">Event Name</div>
          <div className="table-cell">Start Login</div>
          <div className="table-cell">Start Time</div>
          <div className="table-cell">Login Time</div>
          <div className="table-cell">Punctual</div>
          <div className="table-cell">Start Logout</div>
          <div className="table-cell">End Time</div>
          <div className="table-cell">Logout Time</div>
          <div className="table-cell">Description</div>
        </div>
        {filteredSchedules.length > 0 ? (
          filteredSchedules.map((schedule: Schedule) => (
            <div
              className={`table-row ${selectedScheduleId === schedule.id ? 'selected' : ''}`}
              key={schedule.id}
              onClick={() => {
                setSelectedScheduleId(schedule.id);
                setScheduleToEdit(schedule);
              }}
              onDoubleClick={() => {
                setScheduleToEdit(schedule);
                setShowScheduleEditPopup(true);
              }}
            >
              <div className="table-cell">{schedule.status}</div>
              <div className="table-cell">
                {schedule.user.first_name} {schedule.user.last_name}
              </div>
              <div className="table-cell">{schedule.event_name}</div>
              <div className="table-cell">
                {schedule.start_time_login ? new Date(schedule.start_time_login).toLocaleString() : '-'}
              </div>
              <div className="table-cell">
                {schedule.start_time ? new Date(schedule.start_time).toLocaleString() : '-'}
              </div>
              <div className="table-cell">
                {schedule.login_time ? new Date(schedule.login_time).toLocaleString() : '-'}
              </div>
              <div className="table-cell">{schedule.punctual ? 'Yes' : 'No'}</div>
              <div className="table-cell">
                {schedule.start_time_logout ? new Date(schedule.start_time_logout).toLocaleString() : '-'}
              </div>
              <div className="table-cell">
                {schedule.end_time ? new Date(schedule.end_time).toLocaleString() : '-'}
              </div>
              <div className="table-cell">
                {schedule.logout_time ? new Date(schedule.logout_time).toLocaleString() : '-'}
              </div>
              <div className="table-cell">{schedule.description || '-'}</div>
            </div>
          ))
        ) : (
          <p>-no upcoming events-</p>
        )}
      </div>
    </div>
  );
};

export default Schedules;
