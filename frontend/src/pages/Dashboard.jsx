import React from 'react';
import { Users, GraduationCap, CreditCard, FileText, Plus, TrendingUp, Calendar, Clock } from 'lucide-react';

const Dashboard = () => {
  const stats = [
    {
      name: 'Total Students',
      value: '248',
      change: '+12%',
      changeType: 'increase',
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      name: 'Active Batches',
      value: '8',
      change: '+2',
      changeType: 'increase',
      icon: GraduationCap,
      color: 'bg-teal-500'
    },
    {
      name: 'Fees Collected',
      value: '₹2,48,000',
      change: '+8%',
      changeType: 'increase',
      icon: CreditCard,
      color: 'bg-green-500'
    },
    {
      name: 'Upcoming Tests',
      value: '3',
      change: 'This week',
      changeType: 'neutral',
      icon: FileText,
      color: 'bg-orange-500'
    }
  ];

  const recentActivities = [
    { type: 'student', message: 'New student Rahul Sharma joined JEE Main batch', time: '2 hours ago' },
    { type: 'fee', message: 'Fee payment of ₹15,000 received from Priya Singh', time: '4 hours ago' },
    { type: 'test', message: 'Physics Test - Unit 2 results published', time: '1 day ago' },
    { type: 'attendance', message: 'Attendance marked for JEE Advanced - Morning batch', time: '1 day ago' },
  ];

  const upcomingClasses = [
    { batch: 'JEE Main - Physics', time: '9:00 AM - 11:00 AM', students: 35, date: 'Today' },
    { batch: 'NEET - Chemistry', time: '2:00 PM - 4:00 PM', students: 42, date: 'Today' },
    { batch: 'JEE Advanced - Maths', time: '6:00 PM - 8:00 PM', students: 28, date: 'Tomorrow' },
    { batch: 'NEET - Biology', time: '10:00 AM - 12:00 PM', students: 38, date: 'Tomorrow' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your classes.</p>
        </div>
        <button className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500">
          <Plus className="h-4 w-4 mr-2" />
          Create New Batch
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className={`${stat.color} rounded-lg p-3`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stat.changeType === 'increase' && (
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${
                stat.changeType === 'increase' ? 'text-green-600' : 'text-gray-600'
              }`}>
                {stat.change}
              </span>
              {stat.changeType === 'increase' && (
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Classes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Upcoming Classes</h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingClasses.map((cls, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{cls.batch}</h4>
                    <div className="flex items-center mt-1 text-sm text-gray-600">
                      <Clock className="h-4 w-4 mr-1" />
                      {cls.time}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{cls.date}</p>
                    <p className="text-sm text-gray-600">{cls.students} students</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'student' ? 'bg-blue-500' :
                    activity.type === 'fee' ? 'bg-green-500' :
                    activity.type === 'test' ? 'bg-orange-500' : 'bg-teal-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;