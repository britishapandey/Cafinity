import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Import useNavigate for redirection
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../config/firebase';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Use navigate for redirecting

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/'); // Redirect to home after login
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>

      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>

      {error && <p>{error}</p>}
    </div>
  );
}

export default Login;
