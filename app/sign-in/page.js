'use client';

import { useState } from 'react';
import axios from 'axios';

import Button from '@/components/Button';
import Input from '@/components/Input';
import ResultBox from '@/components/ResultBox';

function Success({ username }) {
  return (
    <div className="m-4">
      <h2 className="text-xl font-bold mb-2">✅ Registration Successful</h2>
      <p>Welcome, <strong>{username}</strong>!</p>
      <p>You will receive an email with a link. Click on the link to complete the process</p>
    </div>
  );
}

function Form({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password_confirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!email.trim()) return setError('Email is a mandatory field');
    if (!username.trim()) return setError('Username is a mandatory field');
    if (!password || !password_confirm) return setError('Please set a password and confirm it');
    if (password !== password_confirm) return setError("Password and confirmed password don't match");
    if (password.length < 5) return setError("Password should be at least 5 characters long");

    try {
      setError('');
      const response = await axios.post('/api/sign-in', { email, username, password });

      // Simulate successful response data (e.g., return user info or ID)
      onSuccess(response.data.username || username);

    } catch (err) {
      if (!err.response) {
        setError('Network error: ' + err.message);
      } else {
        setError(err.response.data.message || 'Something went wrong');
      }
    }
  };

  return (
    <div className="m-4">
      <div className="my-[1em] font-bold text-2xl">Sign in</div>

      <ResultBox fail="true" className={`${error ? '' : 'invisible'}`}>{error}</ResultBox>

      <form onSubmit={handleSubmit} className="w-[20em]">
        <div className="mt-[2em] mb-[0.5em]">Email</div>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full" />

        <div className="mt-[2em] mb-[0.5em]">Name</div>
        <Input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full" />

        <div className="mt-[2em] mb-[0.5em]">Password</div>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full" />

        <div className="mt-[2em] mb-[0.5em]">Confirm password</div>
        <Input type="password" value={password_confirm} onChange={(e) => setPasswordConfirm(e.target.value)} className="w-full" />

        <div className="mt-[2em]">
          <Button type="submit">Sign in</Button>
        </div>
      </form>
    </div>
  );
}

export default function SignInPage() {
  const [successUser, setSuccessUser] = useState(null);

  return (
    <div>
      {!successUser ? (
        <Form onSuccess={setSuccessUser} />
      ) : (
        <Success username={successUser} />
      )}
    </div>
  );
}
