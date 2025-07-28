'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface MonthlyTrendChartProps {
  data: Array<{
    month: string;
    cases: number;
    resolved: number;
    escalations: number;
  }>;
}

export default function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  // Handle empty or invalid data
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
        <h3 className="text-xl font-semibold text-white mb-4">Monthly Trends</h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-gray-400 text-lg mb-2">No monthly trend data available</div>
            <div className="text-gray-500 text-sm">Monthly trends will appear here when available</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <h3 className="text-xl font-semibold text-white mb-4">Monthly Trends</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="month" 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
            />
            <YAxis 
              stroke="#9ca3af"
              tick={{ fill: '#9ca3af' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1f2937', 
                border: '1px solid #374151',
                borderRadius: '8px',
                color: '#ffffff'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="cases" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="New Cases"
            />
            <Line 
              type="monotone" 
              dataKey="resolved" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Resolved Cases"
            />
            <Line 
              type="monotone" 
              dataKey="escalations" 
              stroke="#f59e0b" 
              strokeWidth={2}
              name="Escalations"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
} 