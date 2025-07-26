import React from "react";
import { NavLink } from "react-router-dom";
import {
  X,
  Home,
  Users,
  GraduationCap,
  UserCheck,
  CreditCard,
  FileText,
  Settings,
  BookOpen,
  Calendar,
  DollarSign,
} from "lucide-react";

const Sidebar = ({ isOpen, onClose, userType }) => {
  const tutorNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Batches", href: "/batches", icon: GraduationCap },
    { name: "Students", href: "/students", icon: Users },
    { name: "Attendance", href: "/attendance", icon: UserCheck },
    { name: "Fees", href: "/fees", icon: CreditCard },
    { name: "Tests", href: "/tests", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  const studentNavItems = [
    { name: "Dashboard", href: "/student", icon: Home },
    { name: "Schedule", href: "/student/schedule", icon: Calendar },
    { name: "Notes", href: "/student/notes", icon: BookOpen },
    { name: "Tests", href: "/student/tests", icon: FileText },
    { name: "Fees", href: "/student/fees", icon: DollarSign },
  ];

  const navItems = userType === "tutor" ? tutorNavItems : studentNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 lg:static lg:inset-0
      `}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="ml-3 text-xl font-semibold text-gray-900">
              ClassStack
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? "bg-teal-50 text-teal-700 border-r-2 border-teal-500"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
                onClick={() => window.innerWidth < 1024 && onClose()}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
