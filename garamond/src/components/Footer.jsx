// Footer.jsx
import React, { useState } from "react";
import './Footer.css';
import  { Button }  from './Button';
import { Link } from 'react-router-dom';
import AutoGrowTextarea from "./sub-components/AutoGrowTextArea";

// ---------------------- FooterForm Component ----------------------
function FooterForm() {
  const [formData, setFormData] = useState({
    name: '',
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
      const response = await fetch("/api/form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      alert(data.message || "Feedback submitted successfully!");

      // Reset form
      setFormData({ name: "", thoughts: "" });
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
