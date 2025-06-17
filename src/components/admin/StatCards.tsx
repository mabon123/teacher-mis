import React from 'react';
import { Card } from '@/components/ui/card';

const stats = [
  { label: 'Total Applications', value: 5672, change: '+74%', color: 'bg-green-500', text: 'text-green-500' },
  { label: 'Shotlisted Candidates', value: 234, change: '+74%', color: 'bg-yellow-500', text: 'text-yellow-500' },
  { label: 'Rejected Candidates', value: 3567, change: '+74%', color: 'bg-red-500', text: 'text-red-500' },
  { label: 'Candidates In-Review', value: 2145, change: '+74%', color: 'bg-blue-500', text: 'text-blue-500' },
];

export default function StatCards() {
  return (
    <div className="grid grid-cols-4 gap-6 mb-8">
      {stats.map((stat, i) => (
        <Card key={i} className="p-6 flex flex-col items-center justify-center">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${stat.color} bg-opacity-10`}>
            <span className={`text-2xl font-bold ${stat.text}`}>{stat.value}</span>
          </div>
          <div className="font-semibold text-gray-700 mb-1">{stat.label}</div>
          <div className="text-xs text-gray-400">{stat.change} Inc</div>
        </Card>
      ))}
    </div>
  );
} 