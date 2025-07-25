import React from 'react';
import { Calendar, BookOpen, FileText, CreditCard, Clock, Download, ExternalLink } from 'lucide-react';

const StudentPortal = () => {
  const upcomingClasses = [
    { subject: 'Physics', topic: 'Waves & Oscillations', time: '9:00 AM - 11:00 AM', date: 'Today', room: 'Room A-101' },
    { subject: 'Chemistry', topic: 'Organic Reactions', time: '2:00 PM - 4:00 PM', date: 'Today', room: 'Room B-201' },
    { subject: 'Mathematics', topic: 'Integration', time: '6:00 PM - 8:00 PM', date: 'Tomorrow', room: 'Room A-102' },
  ];

  const recentNotes = [
    { subject: 'Physics', title: 'Wave Motion - Chapter 15', uploadDate: '2024-01-15', size: '2.4 MB' },
    { subject: 'Chemistry', title: 'Organic Chemistry Basics', uploadDate: '2024-01-14', size: '1.8 MB' },
    { subject: 'Mathematics', title: 'Calculus - Derivatives', uploadDate: '2024-01-13', size: '3.1 MB' },
  ];

  const testResults = [
    { subject: 'Physics', title: 'Unit 2 Test', marks: 85, maxMarks: 100, rank: 3, date: '2024-01-10' },
    { subject: 'Chemistry', title: 'Organic Chemistry Test', marks: 78, maxMarks: 80, rank: 5, date: '2024-01-08' },
    { subject: 'Mathematics', title: 'Calculus Test', marks: 92, maxMarks: 100, rank: 1, date: '2024-01-05' },
  ];

  const feeStatus = {
    currentMonth: { amount: 15000, status: 'Paid', dueDate: '2024-01-31', paidDate: '2024-01-25' },
    nextMonth: { amount: 15000, status: 'Due', dueDate: '2024-02-28', paidDate: null },
    totalPaid: 45000,
    totalPending: 15000
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRankColor = (rank: number) => {
    if (rank <= 3) return 'bg-yellow-100 text-yellow-800';
    if (rank <= 10) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-500 to-blue-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, Rahul!</h1>
        <p className="text-teal-100 mt-1">JEE Main - Physics Batch | 95% Attendance</p>
        <div className="flex items-center mt-4 space-x-6">
          <div>
            <p className="text-sm text-teal-100">Overall Performance</p>
            <p className="text-2xl font-semibold">85%</p>
          </div>
          <div>
            <p className="text-sm text-teal-100">Class Rank</p>
            <p className="text-2xl font-semibold">#3</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <button className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
          <Calendar className="h-8 w-8 text-teal-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">Schedule</p>
        </button>
        <button className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
          <BookOpen className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">Notes</p>
        </button>
        <button className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
          <FileText className="h-8 w-8 text-orange-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">Tests</p>
        </button>
        <button className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
          <CreditCard className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-gray-900">Fees</p>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Classes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Today's Classes</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingClasses.filter(cls => cls.date === 'Today').map((cls, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{cls.subject}</h4>
                    <p className="text-sm text-gray-600">{cls.topic}</p>
                    <div className="flex items-center mt-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {cls.time}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{cls.room}</p>
                    <button className="text-xs text-teal-600 hover:text-teal-800 mt-1">
                      Join Class
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Notes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <BookOpen className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Recent Notes</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentNotes.map((note, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{note.title}</h4>
                    <p className="text-sm text-gray-600">{note.subject}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(note.uploadDate).toLocaleDateString()} • {note.size}
                    </p>
                  </div>
                  <button className="p-2 text-gray-400 hover:text-gray-600">
                    <Download className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Results */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Recent Test Results</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {testResults.map((test, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{test.title}</h4>
                    <p className="text-sm text-gray-600">{test.subject}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(test.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-semibold ${getScoreColor((test.marks / test.maxMarks) * 100)}`}>
                      {test.marks}/{test.maxMarks}
                    </p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getRankColor(test.rank)}`}>
                      Rank #{test.rank}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fee Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Fee Status</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-green-900">January 2024</p>
                    <p className="text-sm text-green-700">
                      Paid on {new Date(feeStatus.currentMonth.paidDate!).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-900">
                      ₹{feeStatus.currentMonth.amount.toLocaleString()}
                    </p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Paid
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-yellow-900">February 2024</p>
                    <p className="text-sm text-yellow-700">
                      Due: {new Date(feeStatus.nextMonth.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-yellow-900">
                      ₹{feeStatus.nextMonth.amount.toLocaleString()}
                    </p>
                    <button className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200">
                      Pay Now
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total Paid:</span>
                  <span className="font-medium">₹{feeStatus.totalPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mt-1">
                  <span className="text-gray-600">Pending:</span>
                  <span className="font-medium text-yellow-600">₹{feeStatus.totalPending.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPortal;