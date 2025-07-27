'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CaseStatusChart from '@/components/charts/CaseStatusChart';
import MonthlyTrendChart from '@/components/charts/MonthlyTrendChart';
import CrimeTypeChart from '@/components/charts/CrimeTypeChart';
import ReminderStatusChart from '@/components/charts/ReminderStatusChart';
import CategoryTrendChart from '@/components/charts/CategoryTrendChart';

export default function PIDashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stationData, setStationData] = useState<any>(null);
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
    if (user.role !== 'PI') {
      router.push('/dashboard');
      return;
    }
    setUser(user);
    setStationData(user.station);
    fetchChartData(user.user_id);
    setLoading(false);
  }, [router]);

  const fetchChartData = async (piId: number) => {
    try {
      const response = await fetch(`/api/dashboard-stats?userId=${piId}&role=PI`);
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
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-2xl font-bold text-white">PI Dashboard</h1>
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
              <h2 className="text-3xl font-bold text-white mb-6">PI Overview</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-semibold text-white mb-2">Station Cases</h3>
                  <p className="text-3xl font-bold text-blue-400">{chartData.totalCases || 0}</p>
                  <p className="text-gray-400 text-sm">Cases in your station</p>
                </div>
                
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-semibold text-white mb-2">My Assigned Cases</h3>
                  <p className="text-3xl font-bold text-yellow-400">{chartData.assignedCases || 0}</p>
                  <p className="text-gray-400 text-sm">Cases assigned to you</p>
                </div>
                
                <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-semibold text-white mb-2">Station Resolution</h3>
                  <p className="text-3xl font-bold text-green-400">{chartData.resolutionRate || 0}%</p>
                  <p className="text-gray-400 text-sm">Station success rate</p>
                </div>
              </div>

              {/* Station Information */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-4">Station Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-white mb-2">Station Details</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Station ID:</span>
                        <span className="text-white font-semibold">{user.station?.station_id || 'Not Assigned'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Station Name:</span>
                        <span className="text-white font-semibold">{user.station?.name || 'Not Assigned'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Your Role:</span>
                        <span className="text-blue-400 font-semibold">{user.role}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">User ID:</span>
                        <span className="text-white font-semibold">{user.user_id}</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-white mb-2">Quick Stats</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Station Cases:</span>
                        <span className="text-white font-semibold">23</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Your Cases:</span>
                        <span className="text-blue-400 font-semibold">15</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Pending:</span>
                        <span className="text-yellow-400 font-semibold">3</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Resolved:</span>
                        <span className="text-green-400 font-semibold">18</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Station Overview */}
              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-4">Your Station Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-white mb-2">Station Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Cases:</span>
                        <span className="text-white font-semibold">23</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Resolved:</span>
                        <span className="text-green-400 font-semibold">18</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Pending:</span>
                        <span className="text-yellow-400 font-semibold">3</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Overdue:</span>
                        <span className="text-red-400 font-semibold">2</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800/50 rounded-lg p-4">
                    <h4 className="text-lg font-medium text-white mb-2">Your Performance</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Assigned Cases:</span>
                        <span className="text-white font-semibold">15</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Completed:</span>
                        <span className="text-green-400 font-semibold">12</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">In Progress:</span>
                        <span className="text-yellow-400 font-semibold">2</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Overdue:</span>
                        <span className="text-red-400 font-semibold">1</span>
                      </div>
                    </div>
                  </div>
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

              {/* Reminder Status Chart */}
              <ReminderStatusChart 
                data={chartData.reminderStatusData || []} 
              />

              {/* Category Trend Chart */}
              <CategoryTrendChart 
                data={chartData.categoryTrendData || []} 
              />

              <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                <h3 className="text-xl font-semibold text-white mb-4">Recent Activities</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <span>New case assigned - Theft investigation</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                    <span>Reminder: Follow up on robbery case</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-300">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Case report submitted - Assault case</span>
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