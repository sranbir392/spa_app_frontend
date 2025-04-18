import { useState, useEffect } from 'react';

const Bookings = () => {
  // Helper function to get current date in YYYY-MM-DD format
  const getCurrentDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  // Helper function to get current time in HH:MM format
  const getCurrentTime = () => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  };

  // State management with current date and time pre-filled
  const [formData, setFormData] = useState({
    clientName: '',
    clientContact: '',
    massage: '',
    massageDate: getCurrentDate(),
    massageTime: getCurrentTime(),
    massageEndTime: '',
    sessionTime: '30MIN+15MIN',
    massageType: '',
    massagePrice: 0,
    staffDetails: '',
    createdBy: localStorage.getItem('name') || '',
    cash: 0,
    card: 0,
    upi: 0,
    otherPayment: 0,
    roomNumber: ''
  });

  const [employees, setEmployees] = useState([]);
  const [massages, setMassages] = useState([]);
  const [clientBookings, setClientBookings] = useState([]);

  // Session time options
  const sessionTimeOptions = [
    "30MIN+15MIN",
    "45MIN+15MIN",
    "60MIN+15MIN",
    "90MIN+15MIN",
    "120MIN+15MIN"
  ];

  useEffect(() => {
    fetchEmployees();
    fetchMassages();
    
    // Calculate end time when component mounts
    setFormData(prev => ({
      ...prev,
      massageEndTime: calculateEndTime(prev.massageTime, prev.sessionTime)
    }));
  }, []);

  useEffect(() => {
    if (formData.clientContact.length === 10) {
      fetchClientBookings();
    }
  }, [formData.clientContact]);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_END_POINT}/admin/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        const nonAdminEmployees = data?.employees?.filter(employee => 
          employee.role !== 'admin' && employee.role !== 'ADMIN'
        ) || [];
        setEmployees(nonAdminEmployees);
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
      const response = await fetch(`${import.meta.env.VITE_END_POINT}/massages`, {
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
      const response = await fetch(`${import.meta.env.VITE_END_POINT}/bookings/client/${formData.clientContact}`, {
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
      const [hours, minutes] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return timeString;
    }
  };

  const calculateEndTime = (time, sessionTime) => {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);

      let endTime;
      switch (sessionTime) {
        case '30MIN+15MIN':
          date.setMinutes(date.getMinutes() + 45); // 30 + 15 minutes
          break;
        case '45MIN+15MIN':
          date.setMinutes(date.getMinutes() + 60); // 45 + 15 minutes
          break;
        case '60MIN+15MIN':
          date.setMinutes(date.getMinutes() + 75); // 60 + 15 minutes
          break;
        case '90MIN+15MIN':
          date.setMinutes(date.getMinutes() + 105); // 90 + 15 minutes
          break;
        case '120MIN+15MIN':
          date.setMinutes(date.getMinutes() + 135); // 120 + 15 minutes
          break;
      }

      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
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

      if (name === 'massagePrice') {
        newData.massagePrice = parseFloat(value) || 0;
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
      const response = await fetch(`${import.meta.env.VITE_END_POINT}/bookings`, {
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
          massageDate: getCurrentDate(),
          massageTime: getCurrentTime(),
          massageEndTime: '',
          sessionTime: '30MIN+15MIN',
          massageType: '',
          massagePrice: 0,
          staffDetails: '',
          createdBy: localStorage.getItem('name') || '',
          cash: 0,
          card: 0,
          upi: 0,
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

          <div>
            <label className="block mb-2">Date</label>
            <input
              type="date"
              name="massageDate"
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

          <div>
            <label className="block mb-2">Price</label>
            <input
              type="number"
              name="massagePrice"
              value={formData.massagePrice}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              min="0"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block mb-2">Cash Payment</label>
            <input
              type="number"
              name="cash"
              value={formData.cash}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block mb-2">Card Payment</label>
            <input
              type="number"
              name="card"
              value={formData.card}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block mb-2">UPI Payment</label>
            <input
              type="number"
              name="upi"
              value={formData.upi}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              min="0"
              step="0.01"
            />
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
                <th className="p-2 text-left">Cash</th>
                <th className="p-2 text-left">Card</th>
                <th className="p-2 text-left">UPI</th>
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
                  <td className="p-2">{booking.cash || 0}</td>
                  <td className="p-2">{booking.card || 0}</td>
                  <td className="p-2">{booking.upi || 0}</td>
                  <td className="p-2">{booking.otherPayment || 0}</td>
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