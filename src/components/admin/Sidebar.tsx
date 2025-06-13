import React from 'react';

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white border-r flex flex-col p-6 min-h-screen">
      <div className="mb-8">
        <img src="/logo.png" alt="Logo" className="h-12 mb-2" />
        <div className="font-bold text-sm leading-tight text-gray-700">Human Resource Department</div>
        <div className="text-xs text-gray-500">ការិយាល័យធនធានមនុស្ស</div>
      </div>
      <nav className="flex-1">
        <ul className="space-y-2">
          <li><a href="#" className="flex items-center px-3 py-2 rounded-lg bg-blue-100 text-blue-700 font-semibold"><span className="mr-2">👥</span>Dashboard</a></li>
          <li><a href="#" className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"><span className="mr-2">👤</span>Staff</a></li>
          <li><a href="#" className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"><span className="mr-2">📅</span>Schedule</a></li>
        </ul>
        <div className="mt-8 text-xs text-gray-400 font-bold uppercase">Setup</div>
        <ul className="space-y-2 mt-2">
          <li><a href="#" className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">Jobs</a></li>
          <li><a href="#" className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">Candidates</a></li>
          <li><a href="#" className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">My Referrals</a></li>
          <li><a href="#" className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">Career Site</a></li>
        </ul>
        <div className="mt-8 text-xs text-gray-400 font-bold uppercase">Organization</div>
        <ul className="space-y-2 mt-2">
          <li><a href="#" className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">Employee</a></li>
          <li><a href="#" className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">Structure</a></li>
          <li><a href="#" className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">Report</a></li>
          <li><a href="#" className="flex items-center px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">Settings</a></li>
        </ul>
      </nav>
    </aside>
  );
} 