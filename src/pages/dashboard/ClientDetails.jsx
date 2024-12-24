import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const ClientDetails = () => {
  const { id } = useParams();
  const [clientData, setClientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [totalVisits,setTotalVistis]=useState(0)
  useEffect(() => {
    const fetchClientDetails = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Authentication token not found');
          return;
        }
        const config = {
          headers: {
            Authorization: `Bearer ${token}`
          }
        };
        const response = await axios.get(`${import.meta.env.VITE_END_POINT}/client/${id}`, config);
        setClientData(response.data.client);
        setTotalVistis(response.data.totalVisits)
        setError(null);
      } catch (err) {
        setError('Failed to fetch client details');
        console.error('Error fetching client details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchClientDetails();
    }
  }, [id]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTimeToAMPM = (timeString) => {
    if (!timeString) return '';
    
    try {
      const [hours, minutes] = timeString.split(':').map(num => parseInt(num));
      const hour = hours % 12 || 12;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      return `${hour}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (!clientData) {
    return <div className="text-center">No client data found</div>;
  }

  return (
    <div className="p-3">
      <div className="flex justify-end mb-3">
        <div className="bg-white rounded-lg shadow-md p-3 w-64">
          <h2 className="text-xl font-semibold mb-2">Total Visits</h2>
          <p className="text-xl font-bold text-blue-600">{totalVisits}</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-6 py-3 border-b text-left">Date</th>
              <th className="px-6 py-3 border-b text-left">Massage Type</th>
              <th className="px-6 py-3 border-b text-left">Time Slot</th>
              <th className="px-6 py-3 border-b text-left">Price</th>
              <th className="px-6 py-3 border-b text-left">Other Payment</th>
              <th className="px-6 py-3 border-b text-left">Staff Name</th>
            </tr>
          </thead>
          <tbody>
            {clientData.visitHistory.map((visit) => (
              <tr key={visit._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 border-b">{formatDate(visit.massageDate)}</td>
                <td className="px-6 py-4 border-b">{visit.massage.name}</td>
                <td className="px-6 py-4 border-b">
                  {formatTimeToAMPM(visit.massageTime)} - {formatTimeToAMPM(visit.massageEndTime)}
                </td>
                <td className="px-6 py-4 border-b">
                  <span className="text-green-600 font-medium">{visit.massagePrice}</span>
                </td>
                <td className="px-6 py-4 border-b">
                  <span className="font-medium">{visit.otherPayment}</span>
                </td>
                <td className="px-6 py-4 border-b">{visit?.staffDetails?.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientDetails;