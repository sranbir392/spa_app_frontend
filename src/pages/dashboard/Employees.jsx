import React, { useState, useEffect } from 'react';
import EmployeeForm from '../../components/employees/EmployeeForm';
import EmployeeTable from '../../components/employees/EmployeeTable';
import { Plus } from 'lucide-react';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await fetch(`${import.meta.env.VITE_END_POINT}/admin/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch employees');
      }

      const data = await response.json();
      setEmployees(data.employees);
      setError(null);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to load employees. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleEmployeeAdded = () => {
    fetchEmployees(); // Refresh the list after adding a new employee
    setShowModal(false); // Hide the modal after successful submission
  };

  const handleEmployeeUpdated = () => {
    fetchEmployees(); // Refresh the list after updating an employee
    setShowModal(false); // Hide the modal after successful submission
    setEditingEmployee(null); // Clear the editing employee
    setIsEditing(false); // Reset editing state
  };

  const handleAddEmployee = () => {
    setIsEditing(false);
    setEditingEmployee(null);
    setShowModal(true);
  };

  const handleEditEmployee = (employee) => {
    setEditingEmployee(employee);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmployee(null);
    setIsEditing(false);
  };

  const handleStatusChange = (employeeId, newStatus) => {
    setEmployees(employees.map(emp => 
      emp._id === employeeId ? { ...emp, status: newStatus } : emp
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Employee Management</h1>
        <div className="flex space-x-3">
          <button
            onClick={handleAddEmployee}
            className="flex items-center bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm transition-colors"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add New Employee
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Employee List</h2>
          <EmployeeTable 
            employees={employees} 
            onStatusChange={handleStatusChange}
            onRefreshNeeded={fetchEmployees}
            onEditEmployee={handleEditEmployee}
          />
        </div>
      </div>

      <EmployeeForm
        isOpen={showModal}
        onClose={handleCloseModal}
        onSubmit={isEditing ? handleEmployeeUpdated : handleEmployeeAdded}
        employee={editingEmployee}
        isEditing={isEditing}
      />
    </div>
  );
};

export default Employees;