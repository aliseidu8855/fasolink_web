import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from './Button';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login({ username, password });
      navigate('/');
    } catch (err) {
      setError('Failed to log in. Please check your credentials.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      {error && <p className="error-message">{error}</p>}
      <div className="form-group">
        <label>Username</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <Button type="submit" variant="primary">Log In</Button>
    </form>
  );
};

export default LoginForm;