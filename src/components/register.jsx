import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { Link, useNavigate } from 'react-router-dom';


function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Optional: Create a user profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        createdAt: serverTimestamp(),
      });

      alert('Registration successful!');
      navigate('/login');
    } catch (err) {
      setError("Registration failed. Please check your details.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-24">
      <div className="text-xl">Welcome to</div>
      <h1 className="font-extrabold mb-8">Cafinity!</h1>
      <form className="flex flex-col text-left gap-4" onSubmit={handleSubmit}>
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
        <button type="submit" className="text-[#E7E4E1]">Register</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      <p className="mt-4">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}

export default Register;
