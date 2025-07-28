import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface StationPerformanceData {
  station: string;
  totalCases: number;
  resolvedCases: number;
  pendingCases: number;
  resolutionRate: number;
}

interface StationPerformanceChartProps {
  data: StationPerformanceData[];
}

export default function StationPerformanceChart({ data }: StationPerformanceChartProps) {
  // Handle empty or invalid data
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
        <h3 className="text-xl font-semibold text-white mb-4">Station Performance Comparison</h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-gray-400 text-lg mb-2">No station performance data available</div>
            <div className="text-gray-500 text-sm">Station performance will appear here when available</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <h3 className="text-xl font-semibold text-white mb-4">Station Performance Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="station" 
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
          <Bar dataKey="totalCases" fill="#3B82F6" name="Total Cases" />
          <Bar dataKey="resolvedCases" fill="#10B981" name="Resolved Cases" />
          <Bar dataKey="pendingCases" fill="#F59E0B" name="Pending Cases" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 