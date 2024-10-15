import React, { useState } from 'react';
import axios from 'axios';

const AuthComponent = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');

  const sendOtp = async () => {
    try {
      const response = await axios.post('http://localhost:3002/api/auth/send-otp', { email });
      setMessage(response.data.message);
    } catch (error: unknown) { // Specify the error type as unknown
      if (axios.isAxiosError(error)) {
        setMessage(error.response ? error.response.data.message : 'Error sending OTP.');
      } else {
        setMessage('Error sending OTP.');
      }
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await axios.post('http://localhost:3002/api/auth/verify-otp', { email, otp });
      setMessage(response.data.message);
    } catch (error: unknown) { // Specify the error type as unknown
      if (axios.isAxiosError(error)) {
        setMessage(error.response ? error.response.data.message : 'Error verifying OTP.');
      } else {
        setMessage('Error verifying OTP.');
      }
    }
  };

  return (
    <div>
      <h2>Authentication</h2>
      <input 
        type="email" 
        placeholder="Enter your email" 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <button onClick={sendOtp}>Send OTP</button>

      <input 
        type="text" 
        placeholder="Enter OTP" 
        value={otp} 
        onChange={(e) => setOtp(e.target.value)} 
      />
      <button onClick={verifyOtp}>Verify OTP</button>

      <p>{message}</p>
    </div>
  );
};

export default AuthComponent;
