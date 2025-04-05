import React, { useState } from 'react';
import ChangePasswordModal from './ChangePasswordModal';
import { Key } from 'lucide-react';

const ToggleSwitch = ({ checked, onChange }) => {
  return (
    <div 
      className={`relative w-11 h-6 rounded-full cursor-pointer transition-colors duration-200 ease-in-out ${
        checked ? 'bg-green-500' : 'bg-gray-200'
      }`}
      onClick={onChange}
    >
      <div
        className={`absolute w-4 h-4 bg-white rounded-full transition-transform duration-200 ease-in-out transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        } top-1`}
      />
    </div>
  );
};

const TrashIcon = () => (
  <svg 
    className="w-5 h-5" 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth="2" 
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const EyeIcon = ({ isVisible }) => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    {isVisible ? (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    ) : (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
      />
    )}
  </svg>
);

const PasswordField = ({ password }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex items-center space-x-2">
      <span className="text-sm text-gray-500">
        {showPassword ? password : '••••••••'}
      </span>
      <button
        onClick={() => setShowPassword(!showPassword)}
        className="text-gray-500 hover:text-gray-700 focus:outline-none"
        title={showPassword ? "Hide password" : "Show password"}
      >
        <EyeIcon isVisible={showPassword} />
      </button>
    </div>
  );
};

const EmployeeTable = ({ employees, onStatusChange, onRefreshNeeded }) => {
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleStatusToggle = async (employeeId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${import.meta.env.VITE_END_POINT}/admin/update-employee/${employeeId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: !currentStatus })
      });

      if (!response.ok) {
        throw new Error('Failed to update employee status');
      }

      onStatusChange(employeeId, !currentStatus);
    } catch (error) {
      console.error('Error updating employee status:', error);
    }
  };

  const handleDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('Authentication token not found');
        }

        const response = await fetch(`${import.meta.env.VITE_END_POINT}/admin/employees/${employeeId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to delete employee');
        }

        onRefreshNeeded();
      } catch (error) {
        console.error('Error deleting employee:', error);
        alert('Failed to delete employee. Please try again.');
      }
    }
  };

  const handleChangePassword = (userId) => {
    setSelectedUserId(userId);
    setShowPasswordModal(true);
  };
  
  const handlePasswordChangeSuccess = () => {
    setShowPasswordModal(false);
    setSelectedUserId(null);
    onRefreshNeeded(); // Refresh the table after password change
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Username
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Password
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created At
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {employees.map((employee) => (
            <tr key={employee._id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{employee.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{employee.username}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <PasswordField password={employee.password} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{employee.role}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {employee.role !== "admin" && (
                  <ToggleSwitch
                    checked={employee.status}
                    onChange={() => handleStatusToggle(employee._id, employee.status)}
                  />
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">
                  {new Date(employee.createdAt).toLocaleDateString()}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap space-x-2">
                <button
                  onClick={() => handleChangePassword(employee._id)}
                  className="text-blue-600 hover:text-blue-900 transition-colors duration-200 mr-2"
                  title="Change Password"
                >
                  <Key className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(employee._id)}
                  className="text-red-600 hover:text-red-900 transition-colors duration-200"
                  title="Delete Employee"
                >
                  <TrashIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => {
          setShowPasswordModal(false);
          setSelectedUserId(null);
        }}
        onSuccess={handlePasswordChangeSuccess}
        userId={selectedUserId}
      />
    </div>
  );
};

export default EmployeeTable;