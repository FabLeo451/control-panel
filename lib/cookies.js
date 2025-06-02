// lib/cookies.js
const cookie = require('cookie');

//const cookieName = 'cookie-fabio';

/**
 * Funzione per ottenere tutti i cookie da una richiesta HTTP
 * @param {Object} req - Oggetto della richiesta HTTP
 * @returns {Object} Oggetto contenente tutti i cookie
 */
function getCookies(req) {
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
  return cookies;
}

/**
 * Funzione per ottenere un singolo cookie da una richiesta HTTP
 * @param {Object} req - Oggetto della richiesta HTTP
 * @param {string} name - Nome del cookie da recuperare
 * @returns {string|null} Il valore del cookie o null se non trovato
 */
function getCookie(req, name) {
  const cookies = getCookies(req);
  return cookies[name] || null;
}

/**
 * Funzione per impostare un cookie
 * @param {Object} res - Oggetto della risposta HTTP
 * @param {string} name - Nome del cookie
 * @param {string} value - Valore del cookie
 * @param {Object} options - Opzioni per il cookie (ad esempio, `httpOnly`, `secure`)
 */
function setCookie(res, name, value, options = {}) {
  const cookieString = cookie.serialize(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Assicurati che il cookie sia sicuro in produzione
    sameSite: 'strict',
    path: '/',
    ...options,
  });

  res.setHeader('Set-Cookie', cookieString);
}

module.exports = { /*cookieName,*/ getCookies, getCookie, setCookie };
