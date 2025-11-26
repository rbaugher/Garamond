import React, { useState } from 'react';
import SignUp from './SignUp';
import './SignIn.css';
import { setStoredUser } from '../../utils/session';

function SignIn() {
  const [mode, setMode] = useState('choice'); // 'choice', 'signin', 'signup'
  const [signinForm, setSigninForm] = useState({
    name: '',
    email: '',
  });
  const [signinMessage, setSigninMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignInInputChange = (e) => {
    const { name, value } = e.target;
    setSigninForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    
    if (!signinForm.name.trim() || !signinForm.email.trim()) {
      setSigninMessage('Please enter both name and email.');
      return;
    }

    setIsLoading(true);
    setSigninMessage('');

    try {
      const apiBase = (import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : '';
      // Use dedicated sign-in endpoint with POST
      const response = await fetch(`${apiBase}/api/signInUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: signinForm.name,
          email: signinForm.email
        })
      });

      let text = await response.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }

      if (response.ok && data) {
        const userData = data.user;

        // User exists and name matches, sign them in via centralized helper
        setStoredUser({
          id: userData.id,
          name: userData.name,
          nickname: userData.nickname || null,
          email: userData.email,
          avatar: userData.avatar || '🧑',
          preferredColor: userData.preferredColor || '#4ECDC4',
        });

        setSigninMessage('Welcome back! Redirecting...');
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      } else if (response.status === 404) {
        setSigninMessage('User not found. Please check your email and try again.');
      } else if (response.status === 401) {
        setSigninMessage('Name does not match the email on file. Please try again.');
      } else {
        setSigninMessage(data?.message || 'An error occurred. Please try again.');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setSigninMessage('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelSignIn = () => {
    setMode('choice');
    setSigninForm({ name: '', email: '' });
    setSigninMessage('');
  };

  return (
    <div className="signin-container">
      {mode === 'choice' && (
        <div className="signin-choice">
          <h1>Welcome to Garamond</h1>
          <p>What would you like to do?</p>
          <div className="choice-buttons">
            <button
              className="choice-btn signin-btn"
              onClick={() => setMode('signin')}
            >
              Sign In
            </button>
            <button
              className="choice-btn signup-btn"
              onClick={() => setMode('signup')}
            >
              Sign Up
            </button>
          </div>
        </div>
      )}

      {mode === 'signin' && (
        <div className="signin-form-wrapper">
          <div className="signin-form-container">
            <h2>Sign In</h2>
            <form onSubmit={handleSignInSubmit} className="signin-form">
              <div className="form-group">
                <label htmlFor="signin-name">Name:</label>
                <input
                  id="signin-name"
                  type="text"
                  name="name"
                  value={signinForm.name}
                  onChange={handleSignInInputChange}
                  placeholder="Enter your name"
                  disabled={isLoading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="signin-email">Email:</label>
                <input
                  id="signin-email"
                  type="email"
                  name="email"
                  value={signinForm.email}
                  onChange={handleSignInInputChange}
                  placeholder="Enter your email"
                  disabled={isLoading}
                />
              </div>

              {signinMessage && (
                <div className={`signin-message ${signinMessage.includes('not found') || signinMessage.includes('error') ? 'error' : 'success'}`}>
                  {signinMessage}
                </div>
              )}

              <div className="signin-buttons">
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancelSignIn}
                  disabled={isLoading}
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {mode === 'signup' && (
        <SignUp onSignUpComplete={() => setMode('choice')} />
      )}
    </div>
  );
}

export default SignIn;
