import React, { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';

const Massages = () => {
  const [massages, setMassages] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentMassage, setCurrentMassage] = useState({
    name: '',
    description: '',
    time: ['30MIN+15MIN',"45MIN+15MIN", "60MIN+15MIN", "90MIN+15MIN", "120MIN+15MIN"],
    price: [0,0, 0, 0, 0],
    discountedPrice: [0,0, 0, 0, 0]
  });

  // Check admin role on component mount
  useEffect(() => {
    const userRole = localStorage.getItem('role');
    setIsAdmin(userRole === 'admin');
  }, []);

  // Helper function to get authorization headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  useEffect(() => {
    handleSearch();
  }, [searchTerm]);

  // Helper function to handle unauthorized responses
  const handleUnauthorizedResponse = (response) => {
    if (response.status === 401) {
      window.location.href = '/login';
      return true;
    }
    return false;
  };

  // Fetch all massages
  const fetchMassages = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_END_POINT}/massages`, {
        headers: getAuthHeaders()
      });
      
      if (handleUnauthorizedResponse(response)) return;
      
      if (response.ok) {
        const data = await response.json();
        setMassages(data);
      }
    } catch (error) {
      console.error('Error fetching massages:', error);
    }
  };

  useEffect(() => {
    fetchMassages();
  }, []);

  // Handle search
  const handleSearch = async () => {
    if (searchTerm.trim() === '') {
      fetchMassages();
      return;
    }
    try {
      const response = await fetch(`${import.meta.env.VITE_END_POINT}/massages/search/${searchTerm}`, {
        headers: getAuthHeaders()
      });

      if (handleUnauthorizedResponse(response)) return;

      if (response.ok) {
        const data = await response.json();
        setMassages(data);
      }
    } catch (error) {
      console.error('Error searching massages:', error);
    }
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) return;

    const url = isEditMode 
      ? `${import.meta.env.VITE_END_POINT}/massages/${currentMassage._id}`
      : `${import.meta.env.VITE_END_POINT}/massages/create`;
    
    const method = isEditMode ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        body: JSON.stringify(currentMassage),
      });

      if (handleUnauthorizedResponse(response)) return;

      if (response.ok) {
        setIsModalOpen(false);
        fetchMassages();
        resetForm();
      }
    } catch (error) {
      console.error('Error submitting massage:', error);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!isAdmin) return;
    
    if (window.confirm('Are you sure you want to delete this massage?')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_END_POINT}/massages/${id}`, {
          method: 'DELETE',
          headers: getAuthHeaders()
        });

        if (handleUnauthorizedResponse(response)) return;

        if (response.ok) {
          fetchMassages();
        }
      } catch (error) {
        console.error('Error deleting massage:', error);
      }
    }
  };

  const handleEdit = (massage) => {
    if (!isAdmin) return;
    setCurrentMassage(massage);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setCurrentMassage({
      name: '',
      description: '',
      time: ['30MIN+15MIN',"45MIN+15MIN", "60MIN+15MIN", "90MIN+15MIN", "120MIN+15MIN"],
      price: [0,0, 0, 0, 0],
      discountedPrice: [0,0, 0, 0, 0]
    });
    setIsEditMode(false);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Search massages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border rounded px-3 py-2 w-64"
          />
        </div>
        {isAdmin && (
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Add Massage
          </button>
        )}
      </div>

      {/* Modal - Only rendered for admin users */}
      {isAdmin && isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl">
            <h2 className="text-xl font-bold mb-4">
              {isEditMode ? 'Edit Massage' : 'Add New Massage'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Form fields remain the same */}
              <div>
                <label className="block font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={currentMassage.name}
                  onChange={(e) => setCurrentMassage({
                    ...currentMassage,
                    name: e.target.value
                  })}
                  className="border rounded px-3 py-2 w-full"
                  required
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Description</label>
                <textarea
                  value={currentMassage.description}
                  onChange={(e) => setCurrentMassage({
                    ...currentMassage,
                    description: e.target.value
                  })}
                  className="border rounded px-3 py-2 w-full h-24"
                 
                />
              </div>
              <div className="space-y-2">
                {currentMassage.time.map((time, index) => (
                  <div key={index} className="grid grid-cols-3 gap-4 items-center">
                    <div className="font-medium">{time}</div>
                    <div>
                      <label className="block font-medium mb-1">Price</label>
                      <input
                        type="number"
                        value={currentMassage.price[index]}
                        onChange={(e) => {
                          const newPrices = [...currentMassage.price];
                          newPrices[index] = Number(e.target.value);
                          setCurrentMassage({
                            ...currentMassage,
                            price: newPrices
                          });
                        }}
                        className="border rounded px-3 py-2 w-full"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-1">Discounted Price</label>
                      <input
                        type="number"
                        value={currentMassage.discountedPrice[index]}
                        onChange={(e) => {
                          const newDiscountedPrices = [...currentMassage.discountedPrice];
                          newDiscountedPrices[index] = Number(e.target.value);
                          setCurrentMassage({
                            ...currentMassage,
                            discountedPrice: newDiscountedPrices
                          });
                        }}
                        className="border rounded px-3 py-2 w-full"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="border px-4 py-2 rounded hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  {isEditMode ? 'Update' : 'Add'} Massage
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time Slots
              </th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price Range
              </th>
              <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Discounted Price Range
              </th>
              {isAdmin && (
                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {massages.map((massage) => (
              <tr key={massage._id}>
                <td className="px-6 py-4 whitespace-nowrap">{massage.name}</td>
                <td className="px-6 py-4">{massage.description}</td>
                <td className="px-6 py-4">
                  <ul className="list-none">
                    {massage.time.map((t, index) => (
                      <li key={index}>{t}</li>
                    ))}
                  </ul>
                </td>
                <td className="px-6 py-4">
                  <ul className="list-none">
                    {massage.price.map((p, index) => (
                      <li key={index}>₹{p}</li>
                    ))}
                  </ul>
                </td>
                <td className="px-6 py-4">
                  <ul className="list-none">
                    {massage.discountedPrice.map((p, index) => (
                      <li key={index}>₹{p}</li>
                    ))}
                  </ul>
                </td>
                {isAdmin && (
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(massage)}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(massage._id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Massages;