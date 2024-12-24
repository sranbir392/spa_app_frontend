import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  const fetchClients = async (search = '') => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      const url = new URL(`http://localhost:5000/api/client`);
      if (search) {
        url.searchParams.append('search', search);
      }
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        throw new Error('Unauthorized access. Please login again.');
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      
      const data = await response.json();
      setClients(data.clients || []);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      if (err.message.includes('Unauthorized')) {
        window.location.href = '/login';
      }
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchClients(searchTerm);
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchTerm]);

  const handleClientClick = (clientId) => {
    window.location.href = `/dashboard/client/${clientId}`;
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    const sortedClients = [...clients].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    setClients(sortedClients);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className=" mx-auto px-2 sm:px-4 py-4">
      <div className="bg-white rounded-lg shadow">
        <div className="px-3 py-4 sm:p-5">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-2xl font-semibold text-gray-900">Client List</h1>
              <p className="mt-2 text-sm text-gray-700">
                A list of all clients including their name and contact information
              </p>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="mt-4 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Table */}
          <div className="mt-4 flow-root">
            <div className="-mx-2 overflow-x-auto">
              <div className="inline-block min-w-full align-middle">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="py-5 pl-6 pr-4 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          Name
                          {sortConfig.key === 'name' && (
                            <span className="ml-2">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-5 text-left text-sm font-semibold text-gray-900 cursor-pointer hover:bg-gray-50"
                        onClick={() => handleSort('phone')}
                      >
                        <div className="flex items-center">
                          Phone Number
                          {sortConfig.key === 'phone' && (
                            <span className="ml-2">
                              {sortConfig.direction === 'asc' ? '↑' : '↓'}
                            </span>
                          )}
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {clients.length > 0 ? (
                      clients.map((client) => (
                        <tr
                          key={client._id}
                          onClick={() => handleClientClick(client._id)}
                          className="hover:bg-gray-50 cursor-pointer transition-all duration-150"
                        >
                          <td                           className="whitespace-nowrap py-6 pl-6 pr-4 text-sm font-medium text-gray-900">
                            {client.name}
                          </td>
                          <td                           className="whitespace-nowrap px-6 py-6 text-sm text-gray-500">
                            {client.phone}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="2"
                          className="px-3 py-4 text-sm text-gray-500 text-center"
                        >
                          No clients found matching your search.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clients;