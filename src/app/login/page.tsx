'use client';
import React, { useState, FormEvent } from 'react';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    otp: '',
  });

  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      const res = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'An error occurred');
      } else {
        setMessage(data.message);
      }
    } catch {
      setError('An error occurred while connecting to the server');
    }
  };

  return (
    <div>
      <h1>Login Page</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username:</label>
          <input
            name="username"
            value={formData.username}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            name="email"
            value={formData.email}
            onChange={handleChange}
            type="email"
          />
        </div>
        <div>
          <label>Phone Number:</label>
          <input
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            type="tel"
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            name="password"
            value={formData.password}
            onChange={handleChange}
            type="password"
            required
          />
        </div>
        <div>
          <label>OTP (if applicable):</label>
          <input name="otp" value={formData.otp} onChange={handleChange} />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default LoginPage;
