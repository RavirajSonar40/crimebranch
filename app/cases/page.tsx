'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ElegantLoadingAnimation from '@/components/ElegantLoadingAnimation';

interface Case {
  crime_id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  created_at: string;
  station_id: number;
  station_name: string;
  assigned_to_name: string;
  // Complainant Details
  complainant_name?: string;
  complainant_phone?: string;
  complainant_address?: string;
  // Incident Details
  incident_date?: string;
  incident_location?: string;
  // Case Details
  evidence_details?: string;
  witness_details?: string;
  suspect_details?: string;
  case_priority?: string;
  resolution_days?: number;
}

interface Station {
  station_id: number;
  name: string;
}

interface ACP {
  user_id: number;
  name: string;
}

export default function CasesPage() {
  const [user, setUser] = useState<any>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [stations, setStations] = useState<Station[]>([]);
  const [acps, setAcps] = useState<ACP[]>([]);
  const [selectedStation, setSelectedStation] = useState<string>('');
  const [selectedACP, setSelectedACP] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [showCaseModal, setShowCaseModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    const user = JSON.parse(userData);
    setUser(user);
    fetchCases(user);
    fetchFilters(user);
  }, [router]);

  const fetchCases = async (user: any) => {
    try {
      setIsSearching(true);
      const params = new URLSearchParams();
      params.append('userId', user.user_id.toString());
      params.append('role', user.role);
      
      if (selectedStation) params.append('stationId', selectedStation);
      if (selectedACP) params.append('acpId', selectedACP);
      if (selectedMonth) params.append('month', selectedMonth);
      if (selectedStatus) params.append('status', selectedStatus);
      if (selectedCategory) params.append('category', selectedCategory);

      const response = await fetch(`/api/cases?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setCases(data.cases || []);
      }
    } catch (error) {
      console.error('Error fetching cases:', error);
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  };

  const fetchFilters = async (user: any) => {
    try {
      const response = await fetch(`/api/cases/filters?userId=${user.user_id}&role=${user.role}`);
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
    fetchCases(user);
  };

  const handleClearFilters = () => {
    setSelectedStation('');
    setSelectedACP('');
    setSelectedMonth('');
    setSelectedStatus('');
    setSelectedCategory('');
  };

  const handleCaseClick = (caseItem: Case) => {
    setSelectedCase(caseItem);
    setShowCaseModal(true);
  };

  const closeCaseModal = () => {
    setShowCaseModal(false);
    setSelectedCase(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    router.push('/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'text-yellow-400';
      case 'Resolved': return 'text-green-400';
      case 'Overdue': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'MINOR': return 'text-blue-400';
      case 'MAJOR': return 'text-red-400';
      case 'MINOR_MAJOR': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  if (!user) {
    return <ElegantLoadingAnimation text="Cases" size="md" />;
  }

  // Show loading for initial data fetch
  if (loading && cases.length === 0) {
    return <ElegantLoadingAnimation text="Loading Cases" size="md" />;
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
                <div className="text-white text-xl font-medium animate-pulse">Searching Cases...</div>
                <div className="text-gray-400 text-sm mt-2">Please wait while we fetch your data</div>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-sm border-b border-gray-800 p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Cases Management</h1>
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
            <h2 className="text-3xl font-bold text-white mb-6">All Cases</h2>
            
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

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Overdue">Overdue</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Categories</option>
                    <option value="MINOR">Minor</option>
                    <option value="MAJOR">Major</option>
                    <option value="MINOR_MAJOR">Minor/Major</option>
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
                        <span className="group-hover:font-semibold transition-all duration-200">Search Cases</span>
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>

            {/* Cases Table */}
            <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-800 overflow-hidden">
              <div className="p-6 border-b border-gray-800">
                <h3 className="text-xl font-semibold text-white">
                  Cases ({cases.length} found)
                </h3>
              </div>
              
              {loading ? (
                <div className="p-6 text-center">
                  <div className="flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <div className="text-white text-lg">Loading cases...</div>
                  </div>
                </div>
              ) : cases.length === 0 ? (
                <div className="p-6 text-center">
                  <div className="text-gray-400">No cases found matching your filters.</div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-800/50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Case ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Station
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Assigned To
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-900/30 divide-y divide-gray-800">
                      {cases.map((caseItem) => (
                        <tr 
                          key={caseItem.crime_id} 
                          className="hover:bg-gray-800/50 cursor-pointer transition-colors duration-200"
                          onClick={() => handleCaseClick(caseItem)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            #{caseItem.crime_id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                            {caseItem.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {caseItem.station_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {caseItem.assigned_to_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(caseItem.status)}`}>
                              {caseItem.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(caseItem.category)}`}>
                              {caseItem.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                            {new Date(caseItem.created_at).toLocaleDateString()}
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

      {/* Case Details Modal */}
      {showCaseModal && selectedCase && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl border border-gray-800 w-full max-w-4xl max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-800">
              <div>
                <h3 className="text-xl font-bold text-white">Case Details</h3>
                <p className="text-gray-400 text-sm mt-1">Case #{selectedCase.crime_id}</p>
              </div>
              <button
                onClick={closeCaseModal}
                className="text-gray-400 hover:text-white text-2xl font-bold transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800"
              >
                ×
              </button>
            </div>
            
            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-blue-400 uppercase tracking-wide">Basic Information</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Case Title</label>
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white">
                        {selectedCase.title}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Case ID</label>
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white">
                        #{selectedCase.crime_id}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white min-h-[60px]">
                      {selectedCase.description || 'No description provided'}
                    </div>
                  </div>
                </div>

                {/* Complainant Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-orange-400 uppercase tracking-wide">Complainant Information</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Name</label>
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white">
                        {selectedCase.complainant_name || 'Not provided'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white">
                        {selectedCase.complainant_phone || 'Not provided'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Address</label>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white min-h-[60px]">
                      {selectedCase.complainant_address || 'Not provided'}
                    </div>
                  </div>
                </div>

                {/* Incident Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-red-400 uppercase tracking-wide">Incident Information</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Incident Date</label>
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white">
                        {selectedCase.incident_date ? new Date(selectedCase.incident_date).toLocaleDateString() : 'Not provided'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Location</label>
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white">
                        {selectedCase.incident_location || 'Not provided'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status and Category */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-green-400 uppercase tracking-wide">Status & Category</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Status</label>
                      <div className="flex items-center">
                        <span className={`inline-flex px-3 py-2 text-sm font-semibold rounded-lg ${getStatusColor(selectedCase.status)}`}>
                          {selectedCase.status}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Category</label>
                      <div className="flex items-center">
                        <span className={`inline-flex px-3 py-2 text-sm font-semibold rounded-lg ${getCategoryColor(selectedCase.category)}`}>
                          {selectedCase.category}
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Created Date</label>
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white">
                        {new Date(selectedCase.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Assignment Information */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wide">Assignment Information</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Station</label>
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white">
                        {selectedCase.station_name}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Assigned To</label>
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white">
                        {selectedCase.assigned_to_name}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Case Details */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-indigo-400 uppercase tracking-wide">Case Details</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white">
                        {selectedCase.case_priority || 'Not specified'}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Resolution Days</label>
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white">
                        {selectedCase.resolution_days || 'Not specified'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Evidence Details</label>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white min-h-[60px]">
                      {selectedCase.evidence_details || 'Not provided'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Witness Details</label>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white min-h-[60px]">
                      {selectedCase.witness_details || 'Not provided'}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Suspect Details</label>
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white min-h-[60px]">
                      {selectedCase.suspect_details || 'Not provided'}
                    </div>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold text-yellow-400 uppercase tracking-wide">Additional Details</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Station ID</label>
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white">
                        {selectedCase.station_id}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Created At</label>
                      <div className="bg-gray-800/50 border border-gray-700 rounded-lg px-3 py-2 text-white">
                        {new Date(selectedCase.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-3 p-6 border-t border-gray-800 bg-gray-900/50">
              <button
                onClick={closeCaseModal}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}