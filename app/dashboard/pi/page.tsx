'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CaseStatusChart from '@/components/charts/CaseStatusChart';
import MonthlyTrendChart from '@/components/charts/MonthlyTrendChart';
import CrimeTypeChart from '@/components/charts/CrimeTypeChart';
import ReminderStatusChart from '@/components/charts/ReminderStatusChart';
import CategoryTrendChart from '@/components/charts/CategoryTrendChart';
import ElegantLoadingAnimation from '@/components/ElegantLoadingAnimation';

export default function PIDashboard() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [stationData, setStationData] = useState<any>(null);
  const [chartData, setChartData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const [crimeTypes, setCrimeTypes] = useState<any[]>([]);
  const [crimeTypeSearch, setCrimeTypeSearch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [caseForm, setCaseForm] = useState({
    title: '',
    description: '',
    crime_type_ids: [] as number[],
    complainant_name: '',
    complainant_phone: '',
    complainant_address: '',
    incident_date: '',
    incident_location: '',
    evidence_details: '',
    witness_details: '',
    suspect_details: '',
    case_priority: 'Medium',
    case_status: 'Pending',
    resolution_days: 1
  });
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
    fetchCrimeTypes();
    setLoading(false);
  }, [router]);

  const fetchChartData = async (piId: number) => {
    try {
      const response = await fetch(`/api/dashboard-stats?userId=${piId}&role=PI`);
      if (response.ok) {
        const data = await response.json();
        setChartData(data);
      } else {
        console.error('Failed to fetch chart data:', response.status);
        // Set default data to prevent empty charts
        setChartData({
          caseStatusData: [
            { name: 'Pending', value: 0, color: '#f59e0b' },
            { name: 'Resolved', value: 0, color: '#10b981' },
            { name: 'Overdue', value: 0, color: '#ef4444' },
          ],
          monthlyTrendData: [
            { month: 'Jan', cases: 0, resolved: 0, escalations: 0 },
            { month: 'Feb', cases: 0, resolved: 0, escalations: 0 },
            { month: 'Mar', cases: 0, resolved: 0, escalations: 0 },
            { month: 'Apr', cases: 0, resolved: 0, escalations: 0 },
            { month: 'May', cases: 0, resolved: 0, escalations: 0 },
            { month: 'Jun', cases: 0, resolved: 0, escalations: 0 },
          ],
          crimeTypeData: [
            { type: 'No Data', count: 0, color: '#3b82f6' },
          ],
          reminderStatusData: [],
          categoryTrendData: [],
          totalCases: 0,
          assignedCases: 0,
          resolutionRate: 0
        });
      }
    } catch (error) {
      console.error('Error fetching chart data:', error);
      // Set default data on error
      setChartData({
        caseStatusData: [
          { name: 'Pending', value: 0, color: '#f59e0b' },
          { name: 'Resolved', value: 0, color: '#10b981' },
          { name: 'Overdue', value: 0, color: '#ef4444' },
        ],
        monthlyTrendData: [
          { month: 'Jan', cases: 0, resolved: 0, escalations: 0 },
          { month: 'Feb', cases: 0, resolved: 0, escalations: 0 },
          { month: 'Mar', cases: 0, resolved: 0, escalations: 0 },
          { month: 'Apr', cases: 0, resolved: 0, escalations: 0 },
          { month: 'May', cases: 0, resolved: 0, escalations: 0 },
          { month: 'Jun', cases: 0, resolved: 0, escalations: 0 },
        ],
        crimeTypeData: [
          { type: 'No Data', count: 0, color: '#3b82f6' },
        ],
        reminderStatusData: [],
        categoryTrendData: [],
        totalCases: 0,
        assignedCases: 0,
        resolutionRate: 0
      });
    }
  };

  const fetchCrimeTypes = async () => {
    try {
      const response = await fetch('/api/crime-types');
      if (response.ok) {
        const data = await response.json();
        console.log('Crime types fetched:', data);
        setCrimeTypes(data.crimeTypes || []);
      } else {
        console.error('Failed to fetch crime types:', response.status);
      }
    } catch (error) {
      console.error('Error fetching crime types:', error);
    }
  };

  const handleCaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least one crime type is selected
    if (caseForm.crime_type_ids.length === 0) {
      alert('Please select at least one crime type');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const caseData = {
        ...caseForm,
        pi_id: user.user_id,
        station_id: stationData.station_id
      };
      
      console.log('Submitting case data:', caseData);
      
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(caseData),
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Case registered successfully:', result);
        setShowCaseModal(false);
        setCaseForm({
          title: '',
          description: '',
          crime_type_ids: [],
          complainant_name: '',
          complainant_phone: '',
          complainant_address: '',
          incident_date: '',
          incident_location: '',
          evidence_details: '',
          witness_details: '',
          suspect_details: '',
          case_priority: 'Medium',
          case_status: 'Pending',
          resolution_days: 1
        });
        setCrimeTypeSearch('');
        // Refresh chart data
        fetchChartData(user.user_id);
      } else {
        const errorData = await response.json();
        console.error('Failed to register case:', errorData);
      }
    } catch (error) {
      console.error('Error registering case:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (!user || loading) {
    return <ElegantLoadingAnimation text="PI Dashboard" size="lg" />;
  }

  // Show loading for chart data
  const isChartDataLoading = Object.keys(chartData).length === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
        <div className="flex justify-between items-center px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">Welcome, PI {user.name.includes('PI') ? user.name.replace(/PI\s+/g, '').replace(/\s+PI/g, '') : user.name}</span>
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
        <div className="w-64 bg-gray-900/50 backdrop-blur-sm border-r border-gray-800 min-h-screen flex-shrink-0">
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">PI Overview</h2>
                <button
                  onClick={() => setShowCaseModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors font-semibold"
                >
                  Register Case
                </button>
              </div>
              
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
              {isChartDataLoading ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center justify-center h-64">
                      <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                        <div className="text-white text-lg">Loading charts...</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
                    <div className="flex items-center justify-center h-64">
                      <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                        <div className="text-white text-lg">Loading charts...</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
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
                </>
              )}

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

      {/* Case Registration Modal */}
      {showCaseModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-800 w-full max-w-lg max-h-[85vh] overflow-hidden relative">
            {/* Loading Overlay */}
            {isSubmitting && (
              <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-2xl">
                <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-2xl">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                      <div className="absolute inset-0 animate-spin rounded-full h-12 w-12 border-4 border-transparent border-b-blue-400" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>
                    <div className="text-center">
                      <div className="text-white text-xl font-medium animate-pulse">Registering Case...</div>
                      <div className="text-gray-400 text-sm mt-2">Please wait while we process your case registration</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <h3 className="text-xl font-bold text-white">Register New Case</h3>
              <button
                onClick={() => setShowCaseModal(false)}
                disabled={isSubmitting}
                className="text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed text-xl transition-colors"
              >
                ×
              </button>
            </div>
            
            {/* Form Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-140px)]">
              <form onSubmit={handleCaseSubmit} className="space-y-4">
                {/* Required Fields Section */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wide">Required Information</h4>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Case Title *
                      </label>
                      <input
                        type="text"
                        required
                        disabled={isSubmitting}
                        value={caseForm.title}
                        onChange={(e) => setCaseForm({...caseForm, title: e.target.value})}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Enter case title"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Crime Types *
                      </label>
                    
                      {/* Unified Crime Type Selection Container */}
                      <div className="border border-gray-700 rounded-lg bg-gray-800/50 overflow-hidden">
                        {/* Search Bar */}
                        <div className="relative border-b border-gray-700/50">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                          </div>
                          <input
                            type="text"
                            disabled={isSubmitting}
                            placeholder="Search crime types..."
                            value={crimeTypeSearch}
                            onChange={(e) => setCrimeTypeSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-0 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                        </div>

                        {/* Crime Type List */}
                        <div className="max-h-32 overflow-y-auto">
                          {crimeTypes
                            .filter(type => 
                              type.heading.toLowerCase().includes(crimeTypeSearch.toLowerCase())
                            )
                            .map((type) => (
                              <label key={type.crime_type_id} className="flex items-center px-4 py-2.5 hover:bg-gray-700/30 cursor-pointer transition-colors border-b border-gray-700/50 last:border-b-0">
                                <input
                                  type="checkbox"
                                  disabled={isSubmitting}
                                  checked={caseForm.crime_type_ids.includes(type.crime_type_id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setCaseForm({
                                        ...caseForm,
                                        crime_type_ids: [...caseForm.crime_type_ids, type.crime_type_id]
                                      });
                                    } else {
                                      setCaseForm({
                                        ...caseForm,
                                        crime_type_ids: caseForm.crime_type_ids.filter(id => id !== type.crime_type_id)
                                      });
                                    }
                                  }}
                                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                <span className="text-white text-sm ml-3">{type.heading}</span>
                              </label>
                            ))}
                        </div>
                        
                        {/* No results message */}
                        {crimeTypeSearch && crimeTypes.filter(type => 
                          type.heading.toLowerCase().includes(crimeTypeSearch.toLowerCase())
                        ).length === 0 && (
                          <div className="px-4 py-3 text-gray-400 text-xs text-center border-t border-gray-700/50">
                            No crime types found matching "{crimeTypeSearch}"
                          </div>
                        )}
                      </div>
                      
                      {/* Status Messages */}
                      {caseForm.crime_type_ids.length === 0 && (
                        <p className="text-red-400 text-xs mt-1 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Please select at least one crime type
                        </p>
                      )}
                      {caseForm.crime_type_ids.length > 0 && (
                        <p className="text-green-400 text-xs mt-1 flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          {caseForm.crime_type_ids.length} crime type(s) selected
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Description *
                      </label>
                      <textarea
                        required
                        value={caseForm.description}
                        onChange={(e) => setCaseForm({...caseForm, description: e.target.value})}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all h-20"
                        placeholder="Enter case description"
                      />
                    </div>
                  </div>
                </div>

                {/* Complainant Section */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-sm font-semibold text-yellow-400 uppercase tracking-wide">Complainant Details</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        value={caseForm.complainant_name}
                        onChange={(e) => setCaseForm({...caseForm, complainant_name: e.target.value})}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        placeholder="Enter name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={caseForm.complainant_phone}
                        onChange={(e) => setCaseForm({...caseForm, complainant_phone: e.target.value})}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        placeholder="Enter phone"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Address
                    </label>
                    <textarea
                      value={caseForm.complainant_address}
                      onChange={(e) => setCaseForm({...caseForm, complainant_address: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all h-16"
                      placeholder="Enter address"
                    />
                  </div>
                </div>

                {/* Incident Section */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wide">Incident Details</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Date
                      </label>
                      <input
                        type="date"
                        value={caseForm.incident_date}
                        onChange={(e) => setCaseForm({...caseForm, incident_date: e.target.value})}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Location
                      </label>
                      <input
                        type="text"
                        value={caseForm.incident_location}
                        onChange={(e) => setCaseForm({...caseForm, incident_location: e.target.value})}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                        placeholder="Enter location"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Details Section */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wide">Additional Details</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Evidence
                      </label>
                      <textarea
                        value={caseForm.evidence_details}
                        onChange={(e) => setCaseForm({...caseForm, evidence_details: e.target.value})}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all h-16"
                        placeholder="Enter evidence details"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Witnesses
                      </label>
                      <textarea
                        value={caseForm.witness_details}
                        onChange={(e) => setCaseForm({...caseForm, witness_details: e.target.value})}
                        className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all h-16"
                        placeholder="Enter witness details"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Suspect Details
                    </label>
                    <textarea
                      value={caseForm.suspect_details}
                      onChange={(e) => setCaseForm({...caseForm, suspect_details: e.target.value})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all h-16"
                      placeholder="Enter suspect details"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Resolution Days *
                    </label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={caseForm.resolution_days}
                      onChange={(e) => setCaseForm({...caseForm, resolution_days: parseInt(e.target.value) || 1})}
                      className="w-full bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      placeholder="Enter resolution days"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-800 bg-gray-900/50">
              <button
                type="button"
                onClick={() => setShowCaseModal(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCaseSubmit}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Register Case
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 