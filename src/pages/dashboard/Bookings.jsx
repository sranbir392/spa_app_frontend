import React, { useState, useEffect } from 'react';
import { format, addHours, addMinutes, parse } from 'date-fns';

const Bookings = () => {
  // State management
  const [formData, setFormData] = useState({
    clientName: '',
    clientContact: '',
    massage: '',
    massageDate: '',
    massageTime: '',
    massageEndTime: '',
    sessionTime: '45MIN+15MIN',
    massageType: '',
    massagePrice: 0,
    staffDetails: '',
    createdBy: localStorage.getItem('name') || '',
    paymentMode: 'Card',
    otherPayment: 0,
    roomNumber: ''
  });

  const [employees, setEmployees] = useState([]);
  const [massages, setMassages] = useState([]);
  const [clientBookings, setClientBookings] = useState([]);

  // Session time options
  const sessionTimeOptions = [
    "45MIN+15MIN",
    "60MIN+15MIN",
    "90MIN+15MIN",
    "120MIN+15MIN"
  ];

  useEffect(() => {
    fetchEmployees();
    fetchMassages();
  }, []);

  useEffect(() => {
    if (formData.clientContact.length === 10) {
      fetchClientBookings();
    }
  }, [formData.clientContact]);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/admin/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setEmployees(data?.employees || []);
      } else {
        console.error('Error fetching employees:', data.message);
      }
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const fetchMassages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/massages', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setMassages(data || []);
      } else {
        console.error('Error fetching massages:', data.message);
      }
    } catch (error) {
      console.error('Error fetching massages:', error);
    }
  };

  const fetchClientBookings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/bookings/client/${formData.clientContact}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setClientBookings(data?.bookings || []);
        if (data.bookings?.length > 0) {
          setFormData(prev => ({
            ...prev,
            clientName: data.bookings[0]?.clientName || ''
          }));
        }
      } else {
        console.error('Error fetching client bookings:', data.message);
      }
    } catch (error) {
      console.error('Error fetching client bookings:', error);
    }
  };

  const formatTime12Hour = (timeString) => {
    try {
      // Parse the input time string (which might be in 24-hour format)
      const date = parse(timeString, 'HH:mm', new Date());
      // Return the time in 12-hour format
      return format(date, 'hh:mm a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
    }
  };

  const calculateEndTime = (time, sessionTime) => {
    try {
      // Parse the time in 24-hour format first
      const startTime = parse(time, 'HH:mm', new Date());
      
      let endTime;
      switch (sessionTime) {
        case '45MIN+15MIN':
          endTime = addHours(startTime, 1);
          break;
        case '60MIN+15MIN':
          endTime = addMinutes(addHours(startTime, 1), 15);
          break;
        case '90MIN+15MIN':
          endTime = addMinutes(addHours(startTime, 1), 45);
          break;
        case '120MIN+15MIN':
          endTime = addMinutes(addHours(startTime, 2), 15);
          break;
        default:
          endTime = startTime;
      }

      // Return the end time in 12-hour format
      return format(endTime, 'HH:mm');
    } catch (error) {
      console.error('Error calculating end time:', error);
      return '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      if (name === 'massage') {
        const selectedMassage = massages.find(m => m._id === value);
        if (selectedMassage) {
          const timeIndex = sessionTimeOptions.findIndex(
            option => option === newData.sessionTime
          );
          newData.massageType = selectedMassage.name;
          newData.massagePrice = selectedMassage.discountedPrice[timeIndex];
        }
      }

      if (name === 'sessionTime') {
        if (newData.massage) {
          const selectedMassage = massages.find(m => m._id === newData.massage);
          if (selectedMassage) {
            const timeIndex = sessionTimeOptions.findIndex(
              option => option === value
            );
            newData.massagePrice = selectedMassage.discountedPrice[timeIndex];
          }
        }
      }

      if (name === 'massageTime' || name === 'sessionTime') {
        if (newData.massageTime) {
          newData.massageEndTime = calculateEndTime(newData.massageTime, newData.sessionTime);
        }
      }

      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert('Booking created successfully!');
        setFormData({
          clientName: '',
          clientContact: '',
          massage: '',
          massageDate: '',
          massageTime: '',
          massageEndTime: '',
          sessionTime: '45MIN+15MIN',
          massageType: '',
          massagePrice: 0,
          staffDetails: '',
          createdBy: localStorage.getItem('name') || '',
          paymentMode: 'Card',
          otherPayment: 0,
          roomNumber: ''
        });
        setClientBookings([]);
      } else {
        alert(data.message || 'Error creating booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Error creating booking');
    }
  };

  return (
    <div className="mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold mb-6">Create New Booking</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Client Information */}
          <div>
            <label className="block mb-2">Client Contact</label>
            <input
              type="tel"
              name="clientContact"
              value={formData.clientContact}
              onChange={handleInputChange}
              pattern="[0-9]{10}"
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block mb-2">Client Name</label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          

          {/* Massage Selection */}
          <div>
            <label className="block mb-2">Massage</label>
            <select
              name="massage"
              value={formData.massage}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Massage</option>
              {massages.map(massage => (
                <option key={massage._id} value={massage._id}>
                  {massage.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2">Staff</label>
            <select
              name="staffDetails"
              value={formData.staffDetails}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Staff</option>
              {employees.map(employee => (
                <option key={employee._id} value={employee._id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date and Time */}
          <div>
            <label className="block mb-2">Date</label>
            <input
              type="date"
              name="massageDate"
              min={new Date().toISOString().split('T')[0]}
              value={formData.massageDate}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Time</label>
            <input
              type="time"
              name="massageTime"
              value={formData.massageTime}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
              step="900"
            />
          </div>

          <div>
            <label className="block mb-2">Session Time</label>
            <select
              name="sessionTime"
              value={formData.sessionTime}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              {sessionTimeOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2">End Time</label>
            <input
              type="text"
              value={formData.massageEndTime}
              className="w-full p-2 border rounded bg-gray-100"
              disabled
            />
          </div>

          {/* Room Selection */}
          <div>
            <label className="block mb-2">Room Number</label>
            <select
              name="roomNumber"
              value={formData.roomNumber}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Room</option>
              <option value="1">Room 1</option>
              <option value="2">Room 2</option>
              <option value="3">Room 3</option>
              <option value="4">Room 4</option>
            </select>
          </div>

          {/* Payment Information */}
          <div>
            <label className="block mb-2">Price</label>
            <input
              type="number"
              name="massagePrice"
              value={formData.massagePrice}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Payment Mode</label>
            <select
              name="paymentMode"
              value={formData.paymentMode}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            >
              <option value="Card">Card</option>
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
            </select>
          </div>

          <div>
            <label className="block mb-2">Other Payment</label>
            <input
              type="number"
              name="otherPayment"
              value={formData.otherPayment}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="other payments"
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Create Booking
            </button>
          </div>
        </form>
      </div>

      {/* Client Booking History Table */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-6">Client Booking History</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Date</th>
                <th className="p-2 text-left">Time</th>
                <th className="p-2 text-left">Room</th>
                <th className="p-2 text-left">Massage</th>
                <th className="p-2 text-left">Staff</th>
                <th className="p-2 text-left">Price</th>
                <th className="p-2 text-left">Payment Mode</th>
                <th className="p-2 text-left">Other Payment</th>
              </tr>
            </thead>
            <tbody>
              {clientBookings.map((booking, index) => (
                <tr key={booking._id || index} className="border-b">
                  <td className="p-2">{new Date(booking.massageDate).toLocaleDateString()}</td>
                  <td className="p-2">{formatTime12Hour(booking.massageTime)}</td>
                  <td className="p-2">Room {booking.roomNumber}</td>
                  <td className="p-2">{booking.massageType}</td>
                  <td className="p-2">{typeof booking?.staffDetails === 'object' ? booking?.staffDetails?.name : booking?.staffDetails}</td>
                  <td className="p-2">{booking.massagePrice}</td>
                  <td className="p-2">{booking.paymentMode}</td>
                  <td className="p-2">{booking.otherPayment}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Bookings;