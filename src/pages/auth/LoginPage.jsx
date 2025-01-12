import React, { useState } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Map the randomized field names back to our actual form fields
    const fieldName = name.includes('username') ? 'username' : 'password';
    setFormData(prevData => ({
      ...prevData,
      [fieldName]: value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_END_POINT}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem("name", data.user.name);
      localStorage.setItem("role", data.user.role);
      navigate('/dashboard');
      
    } catch (err) {
      setError(err.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 border border-gray-200 rounded">
        <div className="text-center">
          <h2 className="text-3xl font-serif font-bold text-gray-900">
            Welcome to SMS
          </h2>
        </div>
        
        {error && (
          <div className="border border-gray-300 rounded p-4 flex items-center space-x-2 bg-gray-50">
            <AlertCircle className="h-5 w-5 text-gray-900" />
            <p className="text-sm text-gray-900">{error}</p>
          </div>
        )}

        <form 
          className="mt-8 space-y-6" 
          onSubmit={handleSubmit} 
          autoComplete="off"
          spellCheck="false"
        >
          {/* Chrome ignores autocomplete="off" so we need to trick it */}
          <input 
            type="text" 
            name="prevent_autofill" 
            id="prevent_autofill" 
            value="" 
            style={{ display: 'none' }} 
          />
          <input 
            type="password" 
            name="password_fake" 
            id="password_fake" 
            value="" 
            style={{ display: 'none' }} 
          />
          
          <div className="space-y-6">
            <div>
              <label htmlFor="username_randomized" className="block text-sm font-medium text-gray-900 mb-2">
                Username
              </label>
              <input
                id="username_randomized"
                name="username_randomized"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                autoComplete="new-password"
                autoCorrect="off"
                spellCheck="false"
                data-form-type="other"
                className="block w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm"
                placeholder="Enter your username"
              />
            </div>
            <div>
              <label htmlFor="password_randomized" className="block text-sm font-medium text-gray-900 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password_randomized"
                  name="password_randomized"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  autoCorrect="off"
                  spellCheck="false"
                  data-form-type="other"
                  className="block w-full px-4 py-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 text-sm pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-gray-900 rounded font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:bg-gray-400 disabled:border-gray-400 text-sm"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;