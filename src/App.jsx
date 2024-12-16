import { useState, useEffect } from 'react';
import './App.css';
import { Auth } from './components/auth';
import { db } from './config/firebase';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import { useRoutes } from 'react-router-dom';
import Navbar from './components/NavBar';
import Home from './components/Home';

function App() {
  let element = useRoutes([
    { path: '*', element: <Home /> },
    { path: '/login', element: <Auth /> },
    // { path: '/profile', element: <Profile /> },
  ])
  return (
    <>
      {element}
    </>
  );
}

export default App;
