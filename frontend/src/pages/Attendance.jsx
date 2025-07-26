import React, { useState } from "react";
import { Calendar, Download, Users, Check, X } from "lucide-react";

const Attendance = () => {
  const [selectedBatch, setSelectedBatch] = useState("JEE Main - Physics");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceData, setAttendanceData] = useState({});

  const batches = [
    "JEE Main - Physics",
    "NEET - Chemistry",
    "JEE Advanced - Maths",
    "NEET - Biology",
  ];

  const students = [
    { id: 1, name: "Rahul Sharma", rollNo: "JEE001" },
    { id: 2, name: "Priya Singh", rollNo: "JEE002" },
    { id: 3, name: "Amit Kumar", rollNo: "JEE003" },
    { id: 4, name: "Sneha Patel", rollNo: "JEE004" },
    { id: 5, name: "Vikash Singh", rollNo: "JEE005" },
    { id: 6, name: "Anita Sharma", rollNo: "JEE006" },
  ];

  const recentAttendance = [
    { date: "2024-01-15", batch: "JEE Main - Physics", present: 32, total: 35 },
    { date: "2024-01-14", batch: "NEET - Chemistry", present: 38, total: 42 },
    {
      date: "2024-01-13",
      batch: "JEE Advanced - Maths",
      present: 26,
      total: 28,
    },
    { date: "2024-01-12", batch: "NEET - Biology", present: 35, total: 38 },
  ];

  const toggleAttendance = (studentId) => {
    setAttendanceData((prev) => ({
      ...prev,
      [studentId]: !prev[studentId],
    }));
  };

  const markAll = (present) => {
    const newData = {};
    students.forEach((student) => {
      newData[student.id] = present;
    });
    setAttendanceData(newData);
  };

  const presentCount = Object.values(attendanceData).filter(Boolean).length;
  const absentCount = students.length - presentCount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-600 mt-1">
            Mark and track student attendance
          </p>
        </div>
        <button className="mt-3 sm:mt-0 inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Batch
            </label>
            <select
              value={selectedBatch}
              onChange={(e) => setSelectedBatch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            >
              {batches.map((batch) => (
                <option key={batch} value={batch}>
                  {batch}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div className="flex items-end">
            <div className="flex space-x-2 w-full">
              <button
                onClick={() => markAll(true)}
                className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 text-sm"
              >
                Mark All Present
              </button>
              <button
                onClick={() => markAll(false)}
                className="flex-1 bg-red-600 text-white py-2 px-3 rounded-lg hover:bg-red-700 text-sm"
              >
                Mark All Absent
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-blue-500 rounded-lg p-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Students
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {students.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-green-500 rounded-lg p-3">
              <Check className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Present</p>
              <p className="text-2xl font-semibold text-gray-900">
                {presentCount}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="bg-red-500 rounded-lg p-3">
              <X className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Absent</p>
              <p className="text-2xl font-semibold text-gray-900">
                {absentCount}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mark Attendance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Mark Attendance
            </h3>
            <p className="text-sm text-gray-600">
              {selectedBatch} - {new Date(selectedDate).toLocaleDateString()}
            </p>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <div className="font-medium text-gray-900">
                      {student.name}
                    </div>
                    <span className="ml-2 text-sm text-gray-500">
                      ({student.rollNo})
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        setAttendanceData((prev) => ({
                          ...prev,
                          [student.id]: true,
                        }))
                      }
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        attendanceData[student.id] === true
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-green-50"
                      }`}
                    >
                      Present
                    </button>
                    <button
                      onClick={() =>
                        setAttendanceData((prev) => ({
                          ...prev,
                          [student.id]: false,
                        }))
                      }
                      className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                        attendanceData[student.id] === false
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : "bg-white text-gray-700 border border-gray-300 hover:bg-red-50"
                      }`}
                    >
                      Absent
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <button className="w-full bg-teal-600 text-white py-3 px-4 rounded-lg hover:bg-teal-700 font-medium">
                Save Attendance
              </button>
            </div>
          </div>
        </div>

        {/* Recent Attendance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <Calendar className="h-5 w-5 text-gray-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Attendance
              </h3>
            </div>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentAttendance.map((record, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {record.batch}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {new Date(record.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {record.present}/{record.total}
                    </p>
                    <p className="text-sm text-gray-600">
                      {Math.round((record.present / record.total) * 100)}%
                    </p>
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

export default Attendance;
