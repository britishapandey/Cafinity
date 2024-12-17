import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";

export const Auth = () => {
  return(
    <div className="flex flex-col items-center justify-center h-screen">
      <div>Welcome to</div>
      <h1 className="text-3xl font-bold m-2">Cafinity!</h1>
      <div className="flex flex-col m-2">
        <input placeholder="Email..." />
        <input placeholder="Password..." />
      </div>
      <button className="m-2 bg-[#B07242] text-[#E7E4E1] transition-colors hover:bg-[#6490E1]">Sign in</button>
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      alert("Login Successful!");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Login</button>
      </form>
      {error && <p>{error}</p>}

    </div>
  );
};
