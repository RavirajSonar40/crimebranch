import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CategoryTrendData {
  month: string;
  minor: number;
  major: number;
  minorMajor: number;
}

interface CategoryTrendChartProps {
  data: CategoryTrendData[];
}

export default function CategoryTrendChart({ data }: CategoryTrendChartProps) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <h3 className="text-xl font-semibold text-white mb-4">Crime Category Trends</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data}>
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
          <Area 
            type="monotone" 
            dataKey="minor" 
            stackId="1"
            stroke="#3B82F6" 
            fill="#3B82F6" 
            fillOpacity={0.6}
            name="Minor Crimes"
          />
          <Area 
            type="monotone" 
            dataKey="major" 
            stackId="1"
            stroke="#EF4444" 
            fill="#EF4444" 
            fillOpacity={0.6}
            name="Major Crimes"
          />
          <Area 
            type="monotone" 
            dataKey="minorMajor" 
            stackId="1"
            stroke="#F59E0B" 
            fill="#F59E0B" 
            fillOpacity={0.6}
            name="Minor/Major"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
} 