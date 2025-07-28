import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface EscalationTrendData {
  month: string;
  pending: number;
  resolved: number;
  overdue: number;
}

interface EscalationTrendChartProps {
  data: EscalationTrendData[];
}

export default function EscalationTrendChart({ data }: EscalationTrendChartProps) {
  // Handle empty or invalid data
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
        <h3 className="text-xl font-semibold text-white mb-4">Escalation Trends</h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-gray-400 text-lg mb-2">No escalation trend data available</div>
            <div className="text-gray-500 text-sm">Escalation trends will appear here when available</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <h3 className="text-xl font-semibold text-white mb-4">Escalation Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="month" 
            stroke="#9CA3AF"
            fontSize={12}
            tick={{ fill: '#9CA3AF' }}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
            tick={{ fill: '#9CA3AF' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#1F2937', 
              border: '1px solid #374151',
              borderRadius: '8px',
              color: '#F9FAFB'
            }}
          />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="pending" 
            stroke="#F59E0B" 
            strokeWidth={2}
            name="Pending"
          />
          <Line 
            type="monotone" 
            dataKey="resolved" 
            stroke="#10B981" 
            strokeWidth={2}
            name="Resolved"
          />
          <Line 
            type="monotone" 
            dataKey="overdue" 
            stroke="#EF4444" 
            strokeWidth={2}
            name="Overdue"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
} 