import React, { useState } from 'react';
import { Plus, Upload, Download, FileText, Calendar, Users, Trophy } from 'lucide-react';

const Tests = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const tests = [
    {
      id: 1,
      title: 'Physics - Unit 2 Test',
      batch: 'JEE Main - Physics',
      date: '2024-01-20',
      maxMarks: 100,
      studentsAppeared: 32,
      totalStudents: 35,
      status: 'Completed',
      resultsPublished: true
    },
    {
      id: 2,
      title: 'Chemistry - Organic Chemistry',
      batch: 'NEET - Chemistry',
      date: '2024-01-25',
      maxMarks: 80,
      studentsAppeared: 0,
      totalStudents: 42,
      status: 'Upcoming',
      resultsPublished: false
    },
    {
      id: 3,
      title: 'Mathematics - Calculus Test',
      batch: 'JEE Advanced - Maths',
      date: '2024-01-18',
      maxMarks: 120,
      studentsAppeared: 26,
      totalStudents: 28,
      status: 'Completed',
      resultsPublished: false
    }
  ];

  const topPerformers = [
    { name: 'Rahul Sharma', batch: 'JEE Main - Physics', marks: 95, maxMarks: 100 },
    { name: 'Priya Singh', batch: 'NEET - Chemistry', marks: 88, maxMarks: 80 },
    { name: 'Amit Kumar', batch: 'JEE Advanced - Maths', marks: 112, maxMarks: 120 },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Upcoming': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tests & Assessments</h1>
          <p className="text-gray-600 mt-1">Create tests, upload marks, and track student performance</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create New Test
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-3">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Tests</p>
              <p className="text-2xl font-semibold text-gray-900">{tests.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-3">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">This Month</p>
              <p className="text-2xl font-semibold text-gray-900">8</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-teal-500 rounded-lg p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Attendance</p>
              <p className="text-2xl font-semibold text-gray-900">92%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-orange-500 rounded-lg p-3">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Avg Score</p>
              <p className="text-2xl font-semibold text-gray-900">78%</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tests List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Tests</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {tests.map((test) => (
                <div key={test.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">{test.title}</h4>
                      <p className="text-sm text-gray-600">{test.batch}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                      {test.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(test.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {test.studentsAppeared}/{test.totalStudents} appeared
                    </div>
                    <div>Max Marks: {test.maxMarks}</div>
                    <div>Results: {test.resultsPublished ? 'Published' : 'Pending'}</div>
                  </div>

                  <div className="flex space-x-2">
                    {test.status === 'Completed' && !test.resultsPublished && (
                      <button 
                        onClick={() => setShowUploadModal(true)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Upload className="h-4 w-4 mr-1" />
                        Upload Marks
                      </button>
                    )}
                    {test.resultsPublished && (
                      <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                        <Download className="h-4 w-4 mr-1" />
                        Download Results
                      </button>
                    )}
                    <button className="text-teal-600 hover:text-teal-800 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Trophy className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Top Performers</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{performer.name}</div>
                    <div className="text-sm text-gray-600">{performer.batch}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {performer.marks}/{performer.maxMarks}
                    </div>
                    <div className="text-sm text-green-600">
                      {Math.round((performer.marks / performer.maxMarks) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Create Test Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Test</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Title</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500" placeholder="e.g., Physics - Unit 3 Test" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select Batch</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500">
                  <option>JEE Main - Physics</option>
                  <option>NEET - Chemistry</option>
                  <option>JEE Advanced - Maths</option>
                  <option>NEET - Biology</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Date</label>
                <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Maximum Marks</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500" placeholder="100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Test Duration (minutes)</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500" placeholder="120" />
              </div>
              <div className="flex space-x-3 pt-4">
                <button type="submit" className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700">
                  Create Test
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Marks Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Student Marks</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select CSV File</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-gray-400">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-teal-600 hover:text-teal-500">
                        <span>Upload a file</span>
                        <input type="file" className="sr-only" accept=".csv" />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">CSV up to 10MB</p>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>CSV Format:</strong> Student Name, Roll No, Marks
                </p>
              </div>
              <div className="flex space-x-3">
                <button className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-lg hover:bg-teal-700">
                  Upload Marks
                </button>
                <button 
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tests;