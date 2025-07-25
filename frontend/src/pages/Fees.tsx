import React, { useState } from 'react';
import { Search, Filter, MessageCircle, Mail, Download, CreditCard, Clock, AlertCircle } from 'lucide-react';

const Fees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const feeRecords = [
    {
      id: 1,
      studentName: 'Rahul Sharma',
      batch: 'JEE Main - Physics',
      amount: 15000,
      dueDate: '2024-01-31',
      paidDate: '2024-01-25',
      status: 'Paid',
      method: 'UPI'
    },
    {
      id: 2,
      studentName: 'Priya Singh',
      batch: 'NEET - Chemistry',
      amount: 18000,
      dueDate: '2024-01-31',
      paidDate: null,
      status: 'Due',
      method: null
    },
    {
      id: 3,
      studentName: 'Amit Kumar',
      batch: 'JEE Advanced - Maths',
      amount: 25000,
      dueDate: '2024-01-31',
      paidDate: '2024-01-30',
      status: 'Paid',
      method: 'Bank Transfer'
    },
    {
      id: 4,
      studentName: 'Sneha Patel',
      batch: 'NEET - Biology',
      amount: 20000,
      dueDate: '2024-01-15',
      paidDate: null,
      status: 'Overdue',
      method: null
    }
  ];

  const statusOptions = ['All', 'Paid', 'Due', 'Overdue'];

  const filteredRecords = feeRecords.filter(record => {
    const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.batch.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid': return 'bg-green-100 text-green-800 border-green-200';
      case 'Due': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Overdue': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Paid': return <CreditCard className="h-4 w-4" />;
      case 'Due': return <Clock className="h-4 w-4" />;
      case 'Overdue': return <AlertCircle className="h-4 w-4" />;
      default: return <CreditCard className="h-4 w-4" />;
    }
  };

  const totalPaid = feeRecords.filter(r => r.status === 'Paid').reduce((sum, r) => sum + r.amount, 0);
  const totalDue = feeRecords.filter(r => r.status === 'Due').reduce((sum, r) => sum + r.amount, 0);
  const totalOverdue = feeRecords.filter(r => r.status === 'Overdue').reduce((sum, r) => sum + r.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fee Management</h1>
          <p className="text-gray-600 mt-1">Track fee payments and send reminders</p>
        </div>
        <div className="flex space-x-3 mt-3 sm:mt-0">
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700">
            <MessageCircle className="h-4 w-4 mr-2" />
            Send Reminders
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-3">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Collected</p>
              <p className="text-2xl font-semibold text-gray-900">₹{totalPaid.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-yellow-500 rounded-lg p-3">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Pending Due</p>
              <p className="text-2xl font-semibold text-gray-900">₹{totalDue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-red-500 rounded-lg p-3">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-semibold text-gray-900">₹{totalOverdue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 focus:outline-none focus:ring-teal-500 focus:border-teal-500"
          >
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <Filter className="absolute right-2 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Fee Records Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRecords.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{record.studentName}</div>
                      <div className="text-sm text-gray-500">{record.batch}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">₹{record.amount.toLocaleString()}</div>
                    {record.method && (
                      <div className="text-sm text-gray-500">via {record.method}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(record.dueDate).toLocaleDateString()}</div>
                    {record.paidDate && (
                      <div className="text-sm text-gray-500">Paid: {new Date(record.paidDate).toLocaleDateString()}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                      <span className="ml-1">{record.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {record.status !== 'Paid' && (
                        <>
                          <button className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-teal-700 bg-teal-100 hover:bg-teal-200">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            WhatsApp
                          </button>
                          <button className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200">
                            <Mail className="h-3 w-3 mr-1" />
                            Email
                          </button>
                        </>
                      )}
                      <button className="text-gray-600 hover:text-gray-900 text-xs">View Details</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Fees;