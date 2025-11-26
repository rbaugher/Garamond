// Footer.jsx
import React, { useState, useMemo } from "react";
import './Footer.css';
import  { Button }  from './Button';
import { Link } from 'react-router-dom';
import AutoGrowTextarea from "./sub-components/AutoGrowTextArea";
import { getStoredUserName } from '../utils/session';

// SAT Vocabulary Bank
const SAT_WORDS = [
  { word: "Ephemeral", definition: "Lasting for a very short time; transitory" },
  { word: "Pragmatic", definition: "Dealing with things sensibly and realistically" },
  { word: "Ubiquitous", definition: "Present, appearing, or found everywhere" },
  { word: "Fastidious", definition: "Very attentive to detail; meticulous" },
  { word: "Tenacious", definition: "Holding firmly to something; persistent" },
  { word: "Quixotic", definition: "Exceedingly idealistic; unrealistic and impractical" },
  { word: "Laconic", definition: "Using very few words; concise" },
  { word: "Ameliorate", definition: "To make something bad or unsatisfactory better" },
  { word: "Ambiguous", definition: "Open to more than one interpretation; unclear" },
  { word: "Capricious", definition: "Given to sudden changes of mood or behavior" },
  { word: "Deference", definition: "Humble submission and respect" },
  { word: "Dogmatic", definition: "Inclined to lay down principles as undeniably true" },
  { word: "Erudite", definition: "Having or showing great knowledge or learning" },
  { word: "Lucid", definition: "Expressed clearly; easy to understand" },
  { word: "Meticulous", definition: "Showing great attention to detail; very careful" },
  { word: "Nefarious", definition: "Wicked or criminal; villainous" },
  { word: "Ostentatious", definition: "Characterized by vulgar or pretentious display" },
  { word: "Parsimonious", definition: "Unwilling to spend money; stingy" },
  { word: "Prosaic", definition: "Lacking poetic beauty; commonplace or dull" },
  { word: "Superfluous", definition: "Unnecessary; more than enough" },
  { word: "Taciturn", definition: "Reserved or uncommunicative in speech; saying little" },
  { word: "Voracious", definition: "Wanting or devouring great quantities; very eager" },
  { word: "Zealous", definition: "Having or showing great energy or enthusiasm" },
  { word: "Benevolent", definition: "Well meaning and kindly" },
  { word: "Candid", definition: "Truthful and straightforward; frank" },
  { word: "Duplicity", definition: "Deceitfulness; double-dealing" },
  { word: "Exacerbate", definition: "To make a problem or bad situation worse" },
  { word: "Gregarious", definition: "Fond of company; sociable" },
  { word: "Impetuous", definition: "Acting quickly without thought or care" },
  { word: "Juxtapose", definition: "To place close together for contrasting effect" }
];

// Adjectives and nouns for codename generation
const ADJECTIVES = [
  "Silent", "Swift", "Bold", "Crimson", "Shadow", "Iron", "Silver", "Arctic",
  "Thunder", "Mystic", "Phantom", "Velvet", "Storm", "Azure", "Golden", "Raven",
  "Jade", "Scarlet", "Frost", "Ember", "Onyx", "Ruby", "Steel", "Cosmic"
];

const NOUNS = [
  "Eagle", "Tiger", "Wolf", "Dragon", "Phoenix", "Viper", "Falcon", "Panther",
  "Cobra", "Hawk", "Lion", "Bear", "Raven", "Serpent", "Fox", "Lynx",
  "Jaguar", "Owl", "Badger", "Scorpion", "Leopard", "Stallion", "Condor", "Orca"
];

// Generate random codename
const generateCodename = () => {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adjective} ${noun}`;
};

// Generate random probability
const generateProbability = () => {
  return (Math.random() * 100).toFixed(2) + '%';
};

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
  // Generate random values once per component mount using useMemo
  const wordOfWeek = useMemo(() => SAT_WORDS[Math.floor(Math.random() * SAT_WORDS.length)], []);
  const codename = useMemo(() => generateCodename(), []);
  const probability = useMemo(() => generateProbability(), []);

  // State to track which section is expanded
  const [expandedSection, setExpandedSection] = useState(null);

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

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
            <Link to="#" onClick={(e) => { e.preventDefault(); toggleSection('how'); }}>
              How it Works
            </Link>
            {expandedSection === 'how' && (
              <div style={{ fontSize: '0.9em', marginTop: '4px', color: '#fff' }}>
                Play games, track stats, compete on leaderboards!
              </div>
            )}
            <Link to="#" onClick={(e) => { e.preventDefault(); toggleSection('mission'); }}>
              Mission Statement
            </Link>
            {expandedSection === 'mission' && (
              <div style={{ fontSize: '0.9em', marginTop: '4px', color: '#fff' }}>
                Enjoy God and glorify Him forever
              </div>
            )}
            <Link to="#" onClick={(e) => { e.preventDefault(); toggleSection('objectives'); }}>
              3 Objectives
            </Link>
            {expandedSection === 'objectives' && (
              <div style={{ fontSize: '0.9em', marginTop: '4px', color: '#fff' }}>
                1. Win<br />
                2. Don't lose<br />
                3. Don't tie
              </div>
            )}
          </div>
        </div>
        <div className="footer-link-wrapper">
          <div className="footer-link-items">
            <h2>Thoughts</h2>
            <div style={{ marginBottom: '10px' }}>
              <Link to="#" onClick={(e) => { e.preventDefault(); toggleSection('word'); }}>
                Word of the Week
              </Link>
              {expandedSection === 'word' && (
                <div style={{ fontSize: '0.9em', marginTop: '4px', color: '#fff' }}>
                  <em>{wordOfWeek.word}</em> - {wordOfWeek.definition}
                </div>
              )}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <Link to="#" onClick={(e) => { e.preventDefault(); toggleSection('codename'); }}>
                Codename of the Day
              </Link>
              {expandedSection === 'codename' && (
                <div style={{ fontSize: '0.9em', marginTop: '4px', color: '#fff' }}>
                  {codename}
                </div>
              )}
            </div>
            <div>
              <Link to="#" onClick={(e) => { e.preventDefault(); toggleSection('probability'); }}>
                Current Probabilities
              </Link>
              {expandedSection === 'probability' && (
                <div style={{ fontSize: '0.9em', marginTop: '4px', color: '#fff' }}>
                  {probability}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <small className="website-rights">Garamond © 2025</small>
    </div>
  );
}

export default Footer;
export { FooterForm };
