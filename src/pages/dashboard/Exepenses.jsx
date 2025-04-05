import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ExpenseModal from '../../components/expenses/ExpenseModal';


const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editingTitle, setEditingTitle] = useState(null);
  const [editingAmount, setEditingAmount] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const userRole = localStorage.getItem('role');

  const fetchExpenses = async (date) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `${import.meta.env.VITE_END_POINT}/expenses?date=${date}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setExpenses(response.data);
    } catch (err) {
      setError('Failed to fetch expenses. Please try again.');
      console.error('Error fetching expenses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (expenseId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.delete(
        `${import.meta.env.VITE_END_POINT}/expenses/${expenseId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      await fetchExpenses(selectedDate);
    } catch (err) {
      setError('Failed to delete expense. Please try again.');
      console.error('Error deleting expense:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTitleUpdate = async (expenseId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `${import.meta.env.VITE_END_POINT}/expenses/${expenseId}`,
        { title: newTitle },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      await fetchExpenses(selectedDate);
      setEditingTitle(null);
      setNewTitle('');
    } catch (err) {
      setError('Failed to update title. Please try again.');
      console.error('Error updating title:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAmountUpdate = async (expenseId) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      await axios.patch(
        `${import.meta.env.VITE_END_POINT}/expenses/${expenseId}`,
        { amount: parseFloat(newAmount) },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      await fetchExpenses(selectedDate);
      setEditingAmount(null);
      setNewAmount('');
    } catch (err) {
      setError('Failed to update amount. Please try again.');
      console.error('Error updating amount:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleModalSuccess = () => {
    // Refresh expenses after successful addition
    fetchExpenses(selectedDate);
  };

  useEffect(() => {
    if (userRole === 'employee') {
      const today = new Date();
      const localDate = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      setSelectedDate(localDate);
    }
    fetchExpenses(selectedDate);
  }, [selectedDate, userRole]);

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        {userRole !== 'employee' && (
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="p-2 border rounded-md w-48"
            />
          </div>
        )}
        
        {/* Add New Expense Button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center"
        >
          <span>Add Expense</span>
        </button>
      </div>

      {error && (
        <div className="text-red-500 mb-4">{error}</div>
      )}

      {loading ? (
        <div className="text-center py-4">Loading...</div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-lg">No expenses found for this date.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                {userRole === 'admin' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expenses.map((expense) => (
                <tr key={expense._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingTitle === expense._id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={newTitle}
                          onChange={(e) => setNewTitle(e.target.value)}
                          className="w-40 p-1 border rounded"
                        />
                        <button
                          onClick={() => handleTitleUpdate(expense._id)}
                          className="bg-green-500 text-white px-2 py-1 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingTitle(null);
                            setNewTitle('');
                          }}
                          className="bg-gray-500 text-white px-2 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        {expense.title}
                        <button
                          onClick={() => {
                            setEditingTitle(expense._id);
                            setNewTitle(expense.title);
                          }}
                          className="bg-blue-500 text-white px-2 py-1 rounded ml-2"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingAmount === expense._id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={newAmount}
                          onChange={(e) => setNewAmount(e.target.value)}
                          className="w-20 p-1 border rounded"
                        />
                        <button
                          onClick={() => handleAmountUpdate(expense._id)}
                          className="bg-green-500 text-white px-2 py-1 rounded"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingAmount(null);
                            setNewAmount('');
                          }}
                          className="bg-gray-500 text-white px-2 py-1 rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        ₹{expense.amount}
                        <button
                          onClick={() => {
                            setEditingAmount(expense._id);
                            setNewAmount(expense.amount?.toString() || '');
                          }}
                          className="bg-blue-500 text-white px-2 py-1 rounded ml-2"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{new Date(expense.date).toLocaleDateString()}</td>
                  {userRole === 'admin' && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDelete(expense._id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Expense Modal */}
      <ExpenseModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={handleModalSuccess} 
      />
    </div>
  );
};

export default Expenses;