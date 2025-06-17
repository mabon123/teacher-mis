import React from 'react';
import { Card } from '@/components/ui/card';

export default function Meetings() {
  return (
    <Card className="p-6">
      <div className="font-semibold mb-2">Meetings</div>
      <ul className="space-y-2">
        <li><span className="font-bold">Mon 10</span> Interview <span className="text-xs text-gray-400">9:00 am - 11:30 am</span></li>
        <li><span className="font-bold">Thu 08</span> Organizational meeting <span className="text-xs text-gray-400">9:00 am - 11:30 am</span></li>
        <li><span className="font-bold">Fri 11</span> Meeting with the manager <span className="text-xs text-gray-400">9:00 am - 11:30 am</span></li>
      </ul>
    </Card>
  );
} 