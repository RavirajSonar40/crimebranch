'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import CaseStatusChart from '@/components/charts/CaseStatusChart';
import MonthlyTrendChart from '@/components/charts/MonthlyTrendChart';
import CrimeTypeChart from '@/components/charts/CrimeTypeChart';
import ACPComparisonChart from '@/components/charts/ACPComparisonChart';
import StationPerformanceChart from '@/components/charts/StationPerformanceChart';
import EscalationTrendChart from '@/components/charts/EscalationTrendChart';
import ReminderStatusChart from '@/components/charts/ReminderStatusChart';
import CategoryTrendChart from '@/components/charts/CategoryTrendChart';
import ElegantLoadingAnimation from '@/components/ElegantLoadingAnimation';

export default function DCPDashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [acpData, setAcpData] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userData);
    if (user.role !== 'DCP') {
      router.push('/dashboard');
      return;
    }
    setUser(user);
    
    // Fetch ACP performance data from database
    fetchACPData();
    fetchChartData();
  }, [router]);

  const fetchACPData = async () => {
    try {
      const response = await fetch('/api/acp-performance');
      if (response.ok) {
        const data = await response.json();
        setAcpData(data.performances || []);
      }
    } catch (error) {
      console.error('Error fetching ACP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const response = await fetch(`/api/dashboard-stats?userId=${user?.user_id}&role=${user?.role}`);
      if (response.ok) {
        const data = await response.json();
        setChartData(data);
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user || loading) {
    return <ElegantLoadingAnimation text="DCP Dashboard" size="lg" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-2xl font-bold text-white">DCP Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Welcome, {user.name}</span>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-900/50 backdrop-blur-sm border-r border-gray-800 min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'overview'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  Overview
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/cases')}
                  className="w-full text-left px-4 py-3 rounded-lg transition-colors text-gray-300 hover:bg-gray-800"
                >
                  Cases
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/reminders')}
                  className="w-full text-left px-4 py-3 rounded-lg transition-colors text-gray-300 hover:bg-gray-800"
                >
                  Reminders
                </button>
              </li>
              <li>
                <button
                  onClick={() => router.push('/escalations')}
                  className="w-full text-left px-4 py-3 rounded-lg transition-colors text-gray-300 hover:bg-gray-800"
                >
                  Escalations
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'settings'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  Settings
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white mb-6">DCP Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-semibold text-white mb-2">Total Cases</h3>
                  <p className="text-3xl font-bold text-blue-400">{chartData.totalCases || 0}</p>
                  <p className="text-gray-400 text-sm">Active cases in your jurisdiction</p>
                </div>
                
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-semibold text-white mb-2">Pending Escalations</h3>
                  <p className="text-3xl font-bold text-yellow-400">{chartData.pendingEscalations || 0}</p>
                  <p className="text-gray-400 text-sm">Require your attention</p>
                </div>
                
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-semibold text-white mb-2">Resolved This Month</h3>
                  <p className="text-3xl font-bold text-green-400">{chartData.resolvedThisMonth || 0}</p>
                  <p className="text-gray-400 text-sm">Successfully closed cases</p>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CaseStatusChart 
                  data={chartData.caseStatusData || [
                    { name: 'Pending', value: 0, color: '#f59e0b' },
                    { name: 'Resolved', value: 0, color: '#10b981' },
                    { name: 'Overdue', value: 0, color: '#ef4444' },
                  ]} 
                />
                
                <MonthlyTrendChart 
                  data={chartData.monthlyTrendData || [
                    { month: 'Jan', cases: 0, resolved: 0, escalations: 0 },
                    { month: 'Feb', cases: 0, resolved: 0, escalations: 0 },
                    { month: 'Mar', cases: 0, resolved: 0, escalations: 0 },
                    { month: 'Apr', cases: 0, resolved: 0, escalations: 0 },
                    { month: 'May', cases: 0, resolved: 0, escalations: 0 },
                    { month: 'Jun', cases: 0, resolved: 0, escalations: 0 },
                  ]} 
                />
              </div>

              <CrimeTypeChart 
                data={chartData.crimeTypeData || [
                  { type: 'No Data', count: 0, color: '#3b82f6' },
                ]} 
              />

              {/* Station Performance Chart */}
              <StationPerformanceChart 
                data={chartData.stationPerformanceData || []} 
              />

              {/* Escalation Trend Chart */}
              <EscalationTrendChart 
                data={chartData.escalationTrendData || []} 
              />

              {/* Reminder Status Chart */}
              <ReminderStatusChart 
                data={chartData.reminderStatusData || []} 
              />

              {/* Category Trend Chart */}
              <CategoryTrendChart 
                data={chartData.categoryTrendData || []} 
              />

              {/* ACP Performance Comparison */}
              {acpData.length > 0 && (
                <ACPComparisonChart 
                  data={acpData.map((acp: any) => ({
                    acpName: acp.acp.name,
                    totalCases: acp.performance.totalCases,
                    resolvedCases: acp.performance.resolvedCases,
                    pendingCases: acp.performance.pendingCases,
                    overdueCases: acp.performance.overdueCases,
                    resolutionRate: acp.performance.resolutionRate,
                  }))} 
                />
              )}

              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-4">DCP Information & Recent Activities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-white mb-2">Personal Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">User ID:</span>
                        <span className="text-white font-semibold">{user.user_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Your Role:</span>
                        <span className="text-blue-400 font-semibold">{user.role}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Jurisdiction Cases:</span>
                        <span className="text-green-400 font-semibold">1,234</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">ACPs Under You:</span>
                        <span className="text-white font-semibold">{acpData.length}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-white mb-2">Recent Activities</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-300">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                        <span>New case registered - Theft at Central Mall</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                        <span>Escalation received from Station A</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-300">
                        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                        <span>Case resolved - Assault at Park Street</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'cases' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Cases Management</h2>
              <p className="text-gray-300">Cases management interface will be implemented here.</p>
            </div>
          )}

          {activeTab === 'reminders' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Reminders</h2>
              <p className="text-gray-300">Reminders interface will be implemented here.</p>
            </div>
          )}

          {activeTab === 'escalations' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Escalations</h2>
              <p className="text-gray-300">Escalations interface will be implemented here.</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Settings</h2>
              <p className="text-gray-300">Settings interface will be implemented here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 