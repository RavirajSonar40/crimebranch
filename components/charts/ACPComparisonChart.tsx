'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ACPComparisonChartProps {
  data: Array<{
    acpName: string;
    totalCases: number;
    resolvedCases: number;
    pendingCases: number;
    overdueCases: number;
    resolutionRate: number;
  }>;
}

export default function ACPComparisonChart({ data }: ACPComparisonChartProps) {
  // Handle empty or invalid data
  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
        <h3 className="text-xl font-semibold text-white mb-4">ACP Performance Comparison</h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-gray-400 text-lg mb-2">No ACP performance data available</div>
            <div className="text-gray-500 text-sm">ACP performance comparison will appear here when available</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
      <h3 className="text-xl font-semibold text-white mb-4">ACP Performance Comparison</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="acpName" 
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
            <Bar dataKey="totalCases" fill="#3b82f6" name="Total Cases" />
            <Bar dataKey="resolvedCases" fill="#10b981" name="Resolved Cases" />
            <Bar dataKey="pendingCases" fill="#f59e0b" name="Pending Cases" />
            <Bar dataKey="overdueCases" fill="#ef4444" name="Overdue Cases" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Resolution Rate Table */}
      <div className="mt-6">
        <h4 className="text-lg font-semibold text-white mb-3">Resolution Rates</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((acp, index) => (
            <div key={index} className="bg-gray-800/50 rounded-lg p-3">
              <h5 className="text-sm font-medium text-gray-300">{acp.acpName}</h5>
              <p className="text-2xl font-bold text-green-400">{acp.resolutionRate.toFixed(1)}%</p>
              <p className="text-xs text-gray-400">Resolution Rate</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 