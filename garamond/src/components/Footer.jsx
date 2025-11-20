// Footer.jsx
import React, { useState } from "react";
import './Footer.css';
import  { Button }  from './Button';
import { Link } from 'react-router-dom';
import AutoGrowTextarea from "./sub-components/AutoGrowTextArea";
import { getStoredUserName } from '../utils/session';

// ---------------------- FooterForm Component ----------------------
function FooterForm() {
  const [formData, setFormData] = useState({
    name: getStoredUserName() || '',
    thoughts: ''
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const apiBase = (import.meta.env && import.meta.env.VITE_API_BASE) ? import.meta.env.VITE_API_BASE : '';
      const res = await fetch(`${apiBase}/api/form`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      let text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }

      if (!res.ok) {
        throw new Error((data && data.message) || 'Failed to submit feedback');
      }

      alert((data && data.message) || "Feedback submitted successfully!");

      // Reset form
      setFormData({ name: getStoredUserName() || "", thoughts: "" });
    } catch (err) {
      console.error(err);
      alert("Error submitting feedback");
    }
  };

  return (
    <div className="input-areas">
      <form onSubmit={handleSubmit}>
        <input
          className="footer-input"
          name="name"
          type="text"
          placeholder="Your Name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        <AutoGrowTextarea
          className="footer-input"
          name="thoughts"
          maxHeight={120}
          placeholder="Your Thoughts"
          value={formData.thoughts}
          onChange={handleChange}
          required
        />
        <Button type="submit" buttonStyle="btn--outline">Send</Button>
      </form>
    </div>
  );
}

// ---------------------- Footer Component ----------------------
function Footer() {
  return (
    <div className="footer-container">
      <section className="footer-subscription">
        <p className="footer-subscription-heading">
          Feedback is always Welcome! Have Suggestions?
        </p>
        <FooterForm />
      </section>

      <div className="footer-links">
        <div className="footer-link-wrapper">
          <div className="footer-link-items">
            <h2>About</h2>
            <Link to="/sign-up">How it Works</Link>
            <Link to="/">Mission Statement</Link>
            <Link to="/">3 Objectives</Link>
          </div>
        </div>
        <div className="footer-link-wrapper">
          <div className="footer-link-items">
            <h2>Thoughts</h2>
            <Link to="/">Word of the Week</Link>
            <Link to="/">Codename of the Day</Link>
            <Link to="/">Current Probabilities</Link>
          </div>
        </div>
      </div>

      <small className="website-rights">Garamond © 2025</small>
    </div>
  );
}

export default Footer;
export { FooterForm };
