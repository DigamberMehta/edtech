import React, { useState } from 'react';
import { Plus, Search, Users, Calendar, Clock, Edit, Trash2, Eye } from 'lucide-react';

const Batches = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const batches = [
    {
      id: 1,
      name: 'JEE Main - Physics',
      subject: 'Physics',
      students: 35,
      schedule: 'Mon, Wed, Fri',
      time: '9:00 AM - 11:00 AM',
      fee: 15000,
      status: 'Active'
    },
    {
      id: 2,
      name: 'NEET - Chemistry',
      subject: 'Chemistry',
      students: 42,
      schedule: 'Tue, Thu, Sat',
      time: '2:00 PM - 4:00 PM',
      fee: 18000,
      status: 'Active'
    },
    {
      id: 3,
      name: 'JEE Advanced - Maths',
      subject: 'Mathematics',
      students: 28,
      schedule: 'Daily',
      time: '6:00 PM - 8:00 PM',
      fee: 25000,
      status: 'Active'
    },
    {
      id: 4,
      name: 'NEET - Biology',
      subject: 'Biology',
      students: 38,
      schedule: 'Mon, Wed, Fri',
      time: '10:00 AM - 12:00 PM',
      fee: 20000,
      status: 'Active'
    }
  ];

  const filteredBatches = batches.filter(batch =>
    batch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    batch.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Batches</h1>
          <p className="text-gray-600 mt-1">Manage your teaching batches and schedules</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Batch
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search batches..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500"
        />
      </div>

      {/* Batches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBatches.map((batch) => (
          <div key={batch.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{batch.name}</h3>
                <p className="text-sm text-gray-600">{batch.subject}</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {batch.status}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-4 w-4 mr-2" />
                {batch.students} students
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-4 w-4 mr-2" />
                {batch.schedule}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                {batch.time}
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">Fee:</span> ₹{batch.fee.toLocaleString()}
              </div>
            </div>

            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Eye className="h-4 w-4 mr-1" />
                View
              </button>
              <div className="flex space-x-2">
                <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Batch Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Batch</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Batch Name</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500" placeholder="e.g., JEE Main - Physics" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500">
                  <option>Physics</option>
                  <option>Chemistry</option>
                  <option>Mathematics</option>
                  <option>Biology</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500" placeholder="e.g., Mon, Wed, Fri" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500" placeholder="e.g., 9:00 AM - 11:00 AM" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fee (₹)</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500" placeholder="15000" />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700">
                  Create Batch
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Batches;