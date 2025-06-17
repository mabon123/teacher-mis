import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Topbar() {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="flex items-center space-x-4">
        <Input placeholder="Search by anything" className="w-72" />
        <Button variant="ghost" className="rounded-full bg-white shadow p-2"><span role="img" aria-label="bell">🔔</span></Button>
        <Button variant="ghost" className="rounded-full bg-white shadow p-2"><span role="img" aria-label="help">❓</span></Button>
        <img src="/avatar.png" alt="Profile" className="w-10 h-10 rounded-full border" />
      </div>
    </div>
  );
} 