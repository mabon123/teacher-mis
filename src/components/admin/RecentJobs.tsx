import React from 'react';
import { Card } from '@/components/ui/card';

export default function RecentJobs() {
  return (
    <Card className="p-6">
      <div className="font-semibold mb-2">Recent Added Jobs</div>
      <ul className="space-y-2">
        <li>Jr. Frontend Engineer <span className="text-xs text-gray-400">- 2 Days ago</span></li>
        <li>Product Designer <span className="text-xs text-gray-400">- 6 hours ago</span></li>
        <li>iOS Developer <span className="text-xs text-gray-400">- 2 Days ago</span></li>
        <li>Brand Strategist <span className="text-xs text-gray-400">- 2 Days ago</span></li>
      </ul>
    </Card>
  );
} 