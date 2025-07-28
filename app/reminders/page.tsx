'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ElegantLoadingAnimation from '@/components/ElegantLoadingAnimation';

interface Reminder {
  reminder_id: number;
  crime_id: number;
  reminder_type: string;
  reminder_date: string;
  crime_title: string;
  station_name: string;
  assigned_to_name: string;
}

interface Station {
  station_id: number;
  name: string;
}

interface ACP {
  user_id: number;
  name: string;
}

export default function RemindersPage() {
  const [user, setUser] = useState<any>(null);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [stations, setStations] = useState<Station[]>([]);
  const [acps, setAcps] = useState<ACP[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [selectedACP, setSelectedACP] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userData);
    setUser(user);
    fetchReminders(user);
    fetchFilters(user);
  }, [router]);

  const fetchReminders = async (user: any) => {
    try {
      setIsSearching(true);
      const params = new URLSearchParams();
      params.append('userId', user.user_id.toString());
      params.append('role', user.role);
      
      if (selectedStation) params.append('stationId', selectedStation);
      if (selectedACP) params.append('acpId', selectedACP);
      if (selectedMonth) params.append('month', selectedMonth);
      if (selectedType) params.append('type', selectedType);

      const response = await fetch(`/api/reminders?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setReminders(data.reminders || []);
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const fetchFilters = async (user: any) => {
    try {
      const response = await fetch(`/api/reminders/filters?userId=${user.user_id}&role=${user.role}`);
      if (response.ok) {
        const data = await response.json();
        setStations(data.stations || []);
        setAcps(data.acps || []);
      }
    } catch (error) {
      console.error('Error fetching filters:', error);
    }
  };

  const handleSearch = () => {
    fetchReminders(user);
  };

  const handleClearFilters = () => {
    setSelectedStation('');
    setSelectedACP('');
    setSelectedMonth('');
    setSelectedType('');
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'First': return 'text-blue-400';
      case 'Second': return 'text-yellow-400';
      case 'Final': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (!user) {
    return <ElegantLoadingAnimation text="Reminders" size="md" />;
  }

  // Show loading for initial data fetch
  if (loading && reminders.length === 0) {
    return <ElegantLoadingAnimation text="Loading Reminders" size="md" />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black relative">
      {/* Full Screen Loading Overlay */}
      {isSearching && (
        <div className="fixed inset-0 bg-black bg-opacity-75 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-8 border border-gray-800 shadow-2xl">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
                <div className="absolute inset-0 animate-spin rounded-full h-12 w-12 border-4 border-transparent border-b-blue-400" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
              </div>
              <div className="text-center">
                <div className="text-white text-xl font-medium animate-pulse">Searching Reminders...</div>
                <div className="text-gray-400 text-sm mt-2">Please wait while we fetch your data</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Reminders Management</h1>
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
                  onClick={() => router.push('/dashboard')}
                  className="w-full text-left px-4 py-3 rounded-lg transition-colors text-gray-300 hover:bg-gray-800"
                >
                  ← Back to Dashboard
                </button>
              </li>
            </ul>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white mb-6">All Reminders</h2>
            
            {/* Filters */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-800">
              <h3 className="text-xl font-semibold text-white mb-4">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                
                {/* ACP Filter (DCP only) */}
                {user.role === 'DCP' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">ACP</label>
                    <select
                      value={selectedACP}
                      onChange={(e) => setSelectedACP(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All ACPs</option>
                      {acps.map((acp) => (
                        <option key={acp.user_id} value={acp.user_id}>
                          {acp.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Station Filter */}
                {(user.role === 'DCP' || user.role === 'ACP') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Station</label>
                    <select
                      value={selectedStation}
                      onChange={(e) => setSelectedStation(e.target.value)}
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Stations</option>
                      {stations.map((station) => (
                        <option key={station.station_id} value={station.station_id}>
                          {station.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Month Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Month</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Months</option>
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>

                {/* Reminder Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Reminder Type</label>
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Types</option>
                    <option value="First">First Reminder</option>
                    <option value="Second">Second Reminder</option>
                    <option value="Final">Final Reminder</option>
                  </select>
                </div>
              </div>
              
              {/* Buttons aligned to the right */}
              <div className="flex justify-end gap-2 mt-4">
                <button
                  onClick={handleClearFilters}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                >
                  Clear Filters
                </button>
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="relative bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-2 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-105 active:scale-95 overflow-hidden group"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <span className="relative z-10 flex items-center gap-2">
                    {isSearching ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        <span className="animate-pulse">Searching...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 transform group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="group-hover:font-semibold transition-all duration-200">Search Reminders</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>

            {/* Reminders Table */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <h3 className="text-xl font-semibold text-white">
                  Reminders ({reminders.length} found)
                </h3>
              </div>
              
              {loading ? (
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <div className="text-white text-lg">Loading reminders...</div>
                  </div>
                </div>
              ) : reminders.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="text-gray-400">No reminders found matching your filters.</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Reminder ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Case Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Station
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Assigned To
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-900/30 divide-y divide-gray-800">
                      {reminders.map((reminder) => (
                        <tr key={reminder.reminder_id} className="hover:bg-gray-800/50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            #{reminder.reminder_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {reminder.crime_title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {reminder.station_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {reminder.assigned_to_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(reminder.reminder_type)}`}>
                              {reminder.reminder_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {new Date(reminder.reminder_date).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 