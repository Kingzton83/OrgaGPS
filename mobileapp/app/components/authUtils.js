import { API_URL } from '../../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Funktion zum Speichern der Tokens
const saveTokens = async (accessToken, refreshToken) => {
  try {
    console.log('Speichere Access Token:', accessToken);
    console.log('Speichere Refresh Token:', refreshToken);
    await AsyncStorage.setItem('access_token', accessToken);
    await AsyncStorage.setItem('refresh_token', refreshToken);
    console.log('Tokens wurden erfolgreich in AsyncStorage gespeichert.');
  } catch (error) {
    console.error('Fehler beim Speichern der Tokens:', error);
  }
};

// Funktion zum Abrufen des Refresh Tokens
const getRefreshToken = async () => {
  try {
    const refreshToken = await AsyncStorage.getItem('refresh_token');
    console.log('Geladener Refresh Token:', refreshToken);
    return refreshToken;
  } catch (error) {
    console.error('Fehler beim Abrufen des Refresh Tokens:', error);
    return null;
  }
};

// Funktion zum Abrufen des Access Tokens (plattformabhängig)
const getAccessToken = async () => {
  if (Platform.OS === 'web') {
    return localStorage.getItem('access_token');
  } else {
    return await AsyncStorage.getItem('access_token');
  }
};

// Funktion zum Login über E-Mail-Token
export const EmailTokenLogin = async (token) => {
  try {
    const response = await fetch(`${API_URL}accounts/token/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });

    if (!response.ok) {
      throw new Error('Ungültiger oder abgelaufener Token.');
    }

    const data = await response.json();

    // Tokens im Client speichern
    await saveTokens(data.access, data.refresh);

    console.log('Nutzer über E-Mail-Token erfolgreich eingeloggt.');
    return true;
  } catch (error) {
    console.error('Fehler beim Login über E-Mail-Token:', error);
    return false;
  }
};

// Funktion für Token-Refresh
export const refreshAccessToken = async () => {
  try {
    const refreshToken = await getRefreshToken(); // Plattformabhängig
    console.log('Refresh Token gefunden:', refreshToken); // Debug: Refresh Token gefunden

    if (!refreshToken) {
      throw new Error('Kein Refresh-Token gefunden.');
    }

    const response = await fetch(`${API_URL}/auth/token/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Token-Refresh fehlgeschlagen.');
    }

    const data = await response.json();
    console.log('Neues Access Token:', data.access); // Debug: Neues Access Token

    await saveTokens(data.access, refreshToken); // Speichere Access Token
    return data.access;
  } catch (error) {
    console.error('Fehler beim Token-Refresh:', error); // Debug: Fehler beim Refresh
    return null;
  }
};

// Funktion zum Abrufen des Access Tokens (bereitgestellt für andere Komponenten)
export const getStoredAccessToken = async () => {
  try {
    const accessToken = await getAccessToken();
    console.log('Access Token abgerufen:', accessToken); // Debug: Access Token
    return accessToken || null;
  } catch (error) {
    console.error('Fehler beim Abrufen des Access Tokens:', error);
    return null;
  }
};

// In authUtils.js
export const clearTokens = async () => {
  if (Platform.OS === 'web') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    console.log('Tokens aus localStorage entfernt.');
  } else {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    console.log('Tokens aus AsyncStorage entfernt.');
  }
};

