import React, { useState, useEffect } from 'react';
import EmployeeForm from '../../components/employees/EmployeeForm';
import EmployeeTable from '../../components/employees/EmployeeTable';

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <h1 className="text-3xl font-bold mb-8">Employee Management</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <EmployeeForm onSubmit={handleEmployeeAdded} />
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Employee List</h2>
              <EmployeeTable 
                employees={employees} 
                onStatusChange={handleStatusChange}
                onRefreshNeeded={fetchEmployees}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Employees;