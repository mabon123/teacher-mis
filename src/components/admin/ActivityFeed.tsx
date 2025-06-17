import React from 'react';
import { Card } from '@/components/ui/card';

export default function ActivityFeed() {
  return (
    <Card className="col-span-2 p-6">
      <div className="font-semibold mb-2">Activity Feed</div>
      <ul className="space-y-2">
        <li><span className="font-bold">Marvin McKinney</span> applied for the job <span className="font-bold">Product Designer</span> <span className="text-xs text-gray-400">10 mins ago</span></li>
        <li><span className="font-bold">Jone Copper</span> Created new Account as a <span className="font-bold">Job Hunt</span> <span className="text-xs text-gray-400">4 hours ago</span></li>
        <li><span className="font-bold">Jenny Wilson</span> applied for the job <span className="font-bold">Frontend Engineer</span> <span className="text-xs text-gray-400">10 mins ago</span></li>
      </ul>
    </Card>
  );
} 