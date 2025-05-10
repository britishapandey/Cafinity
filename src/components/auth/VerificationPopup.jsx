// Updated VerificationPopup.jsx
import React from 'react';
import { auth } from '../../config/firebase';
import { sendEmailVerification } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const VerificationPopup = ({ 
  isOpen, 
  onClose, 
  email = null, 
  isRegistration = true, 
  onNavigateToLogin = null 
}) => {
  const navigate = useNavigate();
  
  if (!isOpen) return null;

  const handleResendVerification = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
        alert("Verification email resent! Please check your inbox.");
        if (!isRegistration) {
          onClose();
        }
      }
    } catch (err) {
      alert("Failed to resend verification email. Please try again later.");
    }
  };

  const handleContinueToHome = () => {
    onClose();
    navigate('/');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-whites-500 hover:text-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <div className="text-center mb-6">
          {isRegistration ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-[#B07242]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          )}
        </div>
        
        <h2 className="text-xl font-semibold mb-4 text-center">
          {isRegistration ? "Verify Your Email" : "Email Not Verified"}
        </h2>
        
        <p className="text-gray-600 mb-6 text-center">
          {isRegistration ? (
            <>We've sent a verification link to <strong>{email}</strong>. Please check your inbox and click the link to verify your account.</>
          ) : (
            <>Your email address hasn't been verified yet. Please check your inbox for a verification link and click it to activate your account.</>
          )}
        </p>
        
        <div className="flex flex-col space-y-4">
          {isRegistration && onNavigateToLogin && (
            <button
              onClick={() => {
                onClose();
                onNavigateToLogin();
              }}
              className="w-full bg-[#B07242] text-white py-2 px-4 rounded-md text-center hover:bg-[#A06030] transition-colors"
            >
              Go to Login
            </button>
          )}
          
          <button
            onClick={handleResendVerification}
            className={`${isRegistration ? 'w-full text-white underline' : 'w-full bg-[#B07242] text-white hover:bg-[#A06030]'} py-2 px-4 rounded-md text-center transition-colors`}
          >
            Resend verification email
          </button>
          
          {!isRegistration && (
            <>
              <button
                onClick={handleContinueToHome}
                className="w-full bg-blue-500 text-white py-2 px-4 rounded-md text-center hover:bg-blue-600 transition-colors"
              >
                Continue to Homepage
              </button>
              
              <button
                onClick={onClose}
                className="w-full text-gray-600 py-2 px-4 rounded-md text-center"
              >
                Close
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerificationPopup;