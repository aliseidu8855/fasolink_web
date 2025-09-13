import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState(''); // Optional email field
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation (e.g., password length) can be added here
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      // The backend only requires username and password for now
      await register({ username, password });
      navigate('/'); // Redirect to homepage on successful registration and login
    } catch (err) {
      // Handle specific errors from the backend if available
      if (err.response && err.response.data && err.response.data.username) {
        setError(err.response.data.username[0]); // e.g., "A user with that username already exists."
      } else {
        setError('Failed to register. Please try again.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Create an Account</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="form-group">
        <label htmlFor="reg-username">Username</label>
        <input
          id="reg-username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="reg-email">Email Address</label>
        <input
          id="reg-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="reg-password">Password</label>
        <input
          id="reg-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" variant="primary">Sign Up</Button>
    </form>
  );
};

export default RegisterForm;