import React from 'react';
import Sidebar from '@/components/admin/Sidebar';
import Topbar from '@/components/admin/Topbar';
import StatCards from '@/components/admin/StatCards';
import Chart from '@/components/admin/Chart';
import RecentJobs from '@/components/admin/RecentJobs';
import ActivityFeed from '@/components/admin/ActivityFeed';
import Meetings from '@/components/admin/Meetings';

export default function AdminDashboard() {
  return (
    <div className="flex min-h-screen bg-[#f5f8ff]">
      <Sidebar />
      <main className="flex-1 p-8">
        <Topbar />
        <StatCards />
        <div className="grid grid-cols-3 gap-6 mb-8">
          <Chart />
          <RecentJobs />
        </div>
        <div className="grid grid-cols-3 gap-6">
          <ActivityFeed />
          <Meetings />
        </div>
      </main>
    </div>
  );
} 