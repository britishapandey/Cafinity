import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
    } catch (err) {
      setError("Invalid email or password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate('/');
    } catch (err) {
      setError("Google sign-in failed. Try again.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-24">
      <div className="text-xl">Welcome to</div>
      <h1 className="font-extrabold mb-8">Cafinity</h1>
      <form className="flex flex-col text-left gap-4" onSubmit={handleEmailLogin}>
        <div className="flex flex-col">
          {/* <label>Email</label> */}
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
        </div>
        <div className="flex flex-col">
          {/* <label>Password</label> */}
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
        </div>
        <button type="submit" disabled={loading}>Login</button>
      </form>

      <div className="flex items-center justify-center gap-2">
        <hr className="w-12 border border-[#5B4A43]"/>or<hr className="w-12 border border-[#5B4A43]"/>
      </div>
      <button onClick={handleGoogleSignIn} disabled={loading}>Sign in with Google</button>

      <p>
        Don't have an account? <Link to="/register">Register here</Link>
      </p>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default Login;
