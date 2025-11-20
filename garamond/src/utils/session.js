// src/utils/session.js
// Centralized helpers for reading/writing the user session in localStorage

const STORAGE_KEY = 'garamondUser';

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    // If parsing fails, clear the corrupted value and return null
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    return null;
  }
}

export function getStoredUserName() {
  const u = getStoredUser();
  if (u && typeof u.nickname === 'string' && u.nickname.trim().length > 0) return u.nickname.trim();
  if (u && typeof u.name === 'string' && u.name.trim().length > 0) return u.name.trim();
  return null;
}

export function setStoredUser(userObj) {
  try {
    const toStore = {
      id: userObj.id || userObj.userId || null,
      name: userObj.name || userObj.displayName || null,
      nickname: userObj.nickname || null,
      email: userObj.email || null,
      avatar: userObj.avatar || '🧑',
      preferredColor: userObj.preferredColor || '#4ECDC4'
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    // Dispatch event so other components (Navbar) can react
    try {
      window.dispatchEvent(new CustomEvent('userSignedUp', { detail: toStore }));
    } catch (e) {
      // ignore
    }
    return toStore;
  } catch (err) {
    console.error('Failed to store user session:', err);
    return null;
  }
}

export function clearStoredUser() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    try { window.dispatchEvent(new CustomEvent('userSignedOut')); } catch (e) {}
  } catch (err) {}
}

export default {
  getStoredUser,
  getStoredUserName,
  setStoredUser,
  clearStoredUser
};
