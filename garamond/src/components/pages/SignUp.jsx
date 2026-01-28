import React, { useState } from "react";
import './SignUp.css';
import { setStoredUser } from '../../utils/session';
import { AVATAR_OPTIONS, COLOR_OPTIONS } from '../../utils/avatars';

const WOULD_YOU_RATHER_QUESTIONS = [
  "Would you rather always have to sing everything you say or always have to dance everywhere you go?",
  "Would you rather live in a world without music or without movies?",
  "Would you rather be able to fly or be invisible?",
  "Would you rather always speak your mind or always have to lie?",
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
  "Would you rather explore space or the deep ocean?",
  "Would you rather have unlimited pizza or unlimited tacos for life?",
  "Would you rather live in a house made of glass or a house with no windows?",
  "Would you rather have super strength or super speed?",
  "Would you rather never have to sleep again or never have to eat again?",
  "Would you rather be able to control the weather or control technology with your mind?",
  "Would you rather always win at board games or always win at card games?",
  "Would you rather have the ability to change the past or see into the future?",
  "Would you rather have a pet dragon or a pet unicorn?",
  "Would you rather be the funniest person in the room or the smartest person in the room?",
  "Would you rather never age physically or never age mentally?",
  "Would you rather be able to speak to plants or speak to machines?",
  "Would you rather live in a world where it's always summer or always winter?",
];





export default function SignUp({ onSignUpComplete }) {
  const [formData, setFormData] = useState({
    name: "",
    nickname: "",
    email: "",
    avatar: AVATAR_OPTIONS[0].emoji, // Default to first avatar
    preferredColor: "#4ECDC4",
    favoriteBibleVerse: "",
    wouldYouRatherAnswer: "",
    mailingList: false
  });

  // Word lists for auto-nickname
  const ADJECTIVES = [
    "Swift", "Lucky", "Brave", "Clever", "Mighty", "Happy", "Witty", "Chill", "Funky", "Noble", "Cosmic", "Sunny", "Frosty", "Shadow", "Magic", "Epic", "Wild", "Silent", "Bold", "Jolly"
  ];
  const NOUNS = [
    "Tiger", "Falcon", "Wizard", "Ninja", "Rider", "Knight", "Rocket", "Gamer", "Hero", "Phoenix", "Wolf", "Dragon", "Comet", "Samurai", "Pirate", "Ranger", "Viking", "Sage", "Jester", "Lion"
  ];

  function generateNickname() {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
    const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
    return adj + noun;
  }

  const handleAutoNickname = (e) => {
    e.preventDefault();
    let newNick = generateNickname();
    // Ensure nickname is unique in this session (not already in field)
    while (newNick === formData.nickname && ADJECTIVES.length * NOUNS.length > 1) {
      newNick = generateNickname();
    }
    setFormData(prev => ({ ...prev, nickname: newNick }));
  };

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
    

    if (!formData.name.trim() || !formData.nickname.trim() || !formData.email.trim()) {
      setError("Please fill in your name, nickname, and email!");
      return;
    }

    // Validate nickname (alphanumeric, 3-16 chars)
    const nicknameRegex = /^[a-zA-Z0-9_]{3,16}$/;
    if (!nicknameRegex.test(formData.nickname)) {
      setError("Nickname must be 3-16 characters, letters, numbers, or underscores only.");
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
      // Use environment-aware API base so we can target deployed Vercel functions
      // or a locally running `vercel dev`. Set VITE_API_BASE in .env if needed.
      const apiBase = (import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : '';
      const response = await fetch(`${apiBase}/api/signUpUser`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          nickname: formData.nickname,
          email: formData.email,
          avatar: formData.avatar,
          preferredColor: formData.preferredColor,
          favoriteBibleVerse: formData.favoriteBibleVerse,
          wouldYouRatherAnswer: formData.wouldYouRatherAnswer,
          mailingList: formData.mailingList
        })
      });

      let data = null;
      let text = await response.text();
      try {
        data = text ? JSON.parse(text) : null;
      } catch (err) {
        // Not valid JSON
        data = null;
      }

      if (!response.ok) {
        setError((data && data.message) || "Failed to create account. Please try again later.");
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Unexpected server response. Please try again later.");
        setLoading(false);
        return;
      }

      console.log("User created successfully:", data);
      
      // Save user data to localStorage via centralized helper (also dispatches event)
      const userData = {
        id: data.userId,
        name: formData.name,
        nickname: formData.nickname,
        email: formData.email,
        avatar: formData.avatar,
        preferredColor: formData.preferredColor,
        createdAt: new Date()
      };
      setStoredUser(userData);
      
      setSubmitted(true);
      
      setTimeout(() => {
        setSubmitted(false);
        setError("");
        setFormData({
          name: "",
          nickname: "",
          email: "",
          avatar: AVATAR_OPTIONS[0].emoji,
          preferredColor: "#4ECDC4",
          favoriteBibleVerse: "",
          wouldYouRatherAnswer: "",
          mailingList: false
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
            
            {/* Name, Nickname, and Email Section */}
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
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="nickname">Nickname *</label>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    id="nickname"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleInputChange}
                    placeholder="Choose a unique player nickname"
                    required
                    maxLength={16}
                    pattern="[a-zA-Z0-9_]{3,16}"
                    title="3-16 characters, letters, numbers, or underscores only"
                    style={{ flex: 1 }}
                  />
                  <button type="button" className="auto-nickname-btn" onClick={handleAutoNickname} title="Generate a nickname" style={{ padding: '0.3rem 0.7rem', fontSize: '0.95rem', borderRadius: '5px', border: '1px solid #bbb', background: '#f7f7f7', cursor: 'pointer' }}>
                    Auto
                  </button>
                </div>
                <small>3-16 characters, letters, numbers, or underscores only</small>
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
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <input
                  type="checkbox"
                  id="mailingList"
                  name="mailingList"
                  checked={formData.mailingList}
                  onChange={(e) => setFormData(prev => ({ ...prev, mailingList: e.target.checked }))}
                  style={{ width: 'auto', cursor: 'pointer' }}
                />
                <label htmlFor="mailingList" style={{ margin: 0, cursor: 'pointer' }}>
                  Subscribe to our mailing list for updates and news
                </label>
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