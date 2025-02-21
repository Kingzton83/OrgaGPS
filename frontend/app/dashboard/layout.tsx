'use client';

import "./layout.css";
import DashboardNavBar from './components/DashboardNavBar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <DashboardNavBar />
      <main>{children}</main>
    </>
  );
}

