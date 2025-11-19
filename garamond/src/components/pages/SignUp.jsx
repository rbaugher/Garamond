import React, { useState } from "react";
import './SignUp.css';

const WOULD_YOU_RATHER_QUESTIONS = [
  "Would you rather always have to sing everything you say or always have to dance everywhere you go?",
  "Would you rather live in a world without music or without movies?",
  "Would you rather be able to fly or be invisible?",
  "Would you rather always speak your mind or always have to lie?",
  "Would you rather be famous or wealthy?",
  "Would you rather have the ability to talk to animals or speak all languages?",
  "Would you rather have a time machine or a teleportation device?",
  "Would you rather always be cold or always be hot?",
  "Would you rather go back in time or forward into the future?",
  "Would you rather be able to time travel or read minds?",
  "Would you rather have to give up coffee or give up sleeping?",
  "Would you rather live without internet or without air conditioning?",
  "Would you rather be a professional gamer or a professional athlete?",
  "Would you rather always have a song stuck in your head or always have a random fact on your mind?",
  "Would you rather have the ability to pause time or slow it down?",
];

const COLOR_OPTIONS = [
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#FFA07A", // Light Salmon
  "#98D8C8", // Mint
  "#F7DC6F", // Yellow
  "#BB8FCE", // Purple
  "#85C1E2", // Sky Blue
  "#F8B195", // Peach
  "#A8D8EA", // Light Blue
];

const AVATAR_OPTIONS = [
  { id: 1, emoji: "🧑", label: "Person" },
  { id: 2, emoji: "🧔", label: "Person with Beard" },
  { id: 3, emoji: "👨‍🎮", label: "Gamer" },
  { id: 4, emoji: "🧑‍💻", label: "Coder" },
  { id: 5, emoji: "🧠", label: "Smart" },
  { id: 6, emoji: "⚡", label: "Lightning" },
  { id: 7, emoji: "🎯", label: "Focused" },
  { id: 8, emoji: "🏆", label: "Champion" },
  { id: 9, emoji: "🚀", label: "Rocket" },
  { id: 10, emoji: "🌟", label: "Star" },
  { id: 11, emoji: "🎨", label: "Creative" },
  { id: 12, emoji: "🎭", label: "Drama" },
];

export default function SignUp({ onSignUpComplete }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    avatar: AVATAR_OPTIONS[0].emoji, // Default to first avatar
    preferredColor: "#4ECDC4",
    favoriteBibleVerse: "",
    wouldYouRatherAnswer: ""
  });

  const [randomQuestion, setRandomQuestion] = useState(
    WOULD_YOU_RATHER_QUESTIONS[Math.floor(Math.random() * WOULD_YOU_RATHER_QUESTIONS.length)]
  );

  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleColorChange = (color) => {
    setFormData(prev => ({
      ...prev,
      preferredColor: color
    }));
  };

  const handleAvatarChange = (emoji) => {
    setFormData(prev => ({
      ...prev,
      avatar: emoji
    }));
  };

  const handleNewQuestion = () => {
    let newQuestion;
    do {
      newQuestion = WOULD_YOU_RATHER_QUESTIONS[Math.floor(Math.random() * WOULD_YOU_RATHER_QUESTIONS.length)];
    } while (newQuestion === randomQuestion && WOULD_YOU_RATHER_QUESTIONS.length > 1);
    setRandomQuestion(newQuestion);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!formData.name.trim() || !formData.email.trim()) {
      setError("Please fill in your name and email!");
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/signUpUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          avatar: formData.avatar,
          preferredColor: formData.preferredColor,
          favoriteBibleVerse: formData.favoriteBibleVerse,
          wouldYouRatherAnswer: formData.wouldYouRatherAnswer
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create account");
        setLoading(false);
        return;
      }

      console.log("User created successfully:", data);
      
      // Save user data to localStorage
      const userData = {
        id: data.userId,
        name: formData.name,
        email: formData.email,
        avatar: formData.avatar,
        preferredColor: formData.preferredColor,
        createdAt: new Date()
      };
      localStorage.setItem('garamondUser', JSON.stringify(userData));
      
      // Dispatch custom event to notify Navbar of user login
      window.dispatchEvent(new CustomEvent('userSignedUp', { detail: userData }));
      
      setSubmitted(true);
      
      setTimeout(() => {
        setSubmitted(false);
        setError("");
        setFormData({
          name: "",
          email: "",
          avatar: AVATAR_OPTIONS[0].emoji,
          preferredColor: "#4ECDC4",
          favoriteBibleVerse: "",
          wouldYouRatherAnswer: ""
        });
        
        // Call the callback if provided (e.g., when used in SignIn)
        if (onSignUpComplete) {
          onSignUpComplete();
        } else {
          // Redirect to home if used directly
          setTimeout(() => {
            window.location.href = '/';
          }, 500);
        }
      }, 3000);
    } catch (err) {
      console.error("Sign up error:", err);
      setError("An error occurred while creating your account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1 className="signup-title">Join the Game Center</h1>
        <p className="signup-subtitle">Create your player profile</p>

        {submitted ? (
          <div className="success-message">
            <h2>✓ Welcome to Garamond!</h2>
            <p>Your profile has been created successfully.</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="signup-form">
            
            {/* Name and Email Section */}
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Avatar Section */}
            <div className="form-section">
              <h3>Choose Your Avatar</h3>
              <p className="section-subtitle">Pick an avatar to represent you</p>
              
              <div className="avatar-picker">
                {AVATAR_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`avatar-option ${formData.avatar === option.emoji ? 'selected' : ''}`}
                    onClick={() => handleAvatarChange(option.emoji)}
                    title={option.label}
                    aria-label={`Select ${option.label} avatar`}
                  >
                    <span className="avatar-emoji">{option.emoji}</span>
                    <span className="avatar-label">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Color Section */}
            <div className="form-section">
              <h3>Preferred Color</h3>
              <p className="section-subtitle">Choose a color that represents you</p>
              
              <div className="color-picker">
                {COLOR_OPTIONS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    className={`color-option ${formData.preferredColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                    aria-label={`Select color ${color}`}
                    title={color}
                  />
                ))}
              </div>
            </div>

            {/* Bible Verse Section */}
            <div className="form-section">
              <h3>Favorite Bible Verse</h3>
              <div className="form-group">
                <label htmlFor="biblevVerse">Share your favorite verse (optional)</label>
                <textarea
                  id="biblevVerse"
                  name="favoriteBibleVerse"
                  value={formData.favoriteBibleVerse}
                  onChange={handleInputChange}
                  placeholder="E.g., Philippians 4:13 - 'I can do all things through Christ who strengthens me.'"
                  rows="4"
                />
              </div>
            </div>

            {/* Would You Rather Section */}
            <div className="form-section">
              <h3>Would You Rather?</h3>
              <div className="would-you-rather-container">
                <p className="random-question">{randomQuestion}</p>
                <button
                  type="button"
                  onClick={handleNewQuestion}
                  className="refresh-btn"
                >
                  Get Another Question →
                </button>
              </div>

              <div className="form-group">
                <label htmlFor="wouldYouRatherAnswer">Your Answer (optional)</label>
                <textarea
                  id="wouldYouRatherAnswer"
                  name="wouldYouRatherAnswer"
                  value={formData.wouldYouRatherAnswer}
                  onChange={handleInputChange}
                  placeholder="Share which option you'd choose and why!"
                  rows="3"
                />
              </div>
            </div>

            {/* Submit and Back Buttons */}
            <div className="form-buttons">
              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "Creating Profile..." : "Create Player Profile"}
              </button>
              {onSignUpComplete && (
                <button 
                  type="button" 
                  className="back-btn" 
                  onClick={onSignUpComplete}
                  disabled={loading}
                >
                  Back
                </button>
              )}
            </div>

            <p className="form-note">* Required fields</p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}