'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardNavBar() {
  const router = useRouter();

  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 2rem',
        backgroundColor: '#4BC6B9',
        borderBottom: '1px solid #ccc'
      }}
    >
      <div>
        <Link
          href="/dashboard"
          style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#FFFDFD' }} // Weißer Text
        >
          OrgaGPS Dashboard
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <Link href="/dashboard/schedules" style={{ color: '#FFFDFD' }}>
          Schedules
        </Link>
        <Link href="/dashboard/team" style={{ color: '#FFFDFD' }}>
          Team
        </Link>
        <Link href="/dashboard/settings" style={{ color: '#FFFDFD' }}>
          Settings
        </Link>
        <button
          onClick={() => router.push('/logout')}
          style={{
            background: 'none',
            border: 'none',
            color: '#FFFDFD',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
