import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { API_URL } from '../../apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Fehler', 'Bitte geben Sie sowohl E-Mail als auch Passwort ein.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}api/token/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.access && data.refresh) {
          console.log('Erfolgreiche Authentifizierung, Tokens werden gespeichert.');
          await AsyncStorage.setItem('access_token', data.access);
          await AsyncStorage.setItem('refresh_token', data.refresh);
          console.log('Tokens erfolgreich gespeichert.');
          Alert.alert('Erfolg', 'Sie sind erfolgreich eingeloggt!');
          navigation.replace('Home');
        } else {
          console.log('Antwort fehlerhaft oder unvollständig:', JSON.stringify(data));
          Alert.alert('Fehler', 'Antwort des Servers unvollständig. Bitte versuchen Sie es erneut.');
        }
      } else {
        console.log('Fehlerantwort vom Server:', JSON.stringify(data));
        Alert.alert('Login fehlgeschlagen', data.error || 'Ungültige Anmeldedaten');
      }
    } catch (error) {
      console.error('Login-Fehler:', error);
      Alert.alert('Fehler', 'Ein Problem ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="E-Mail"
        value={email}
        onChangeText={setEmail}
        style={{ borderBottomWidth: 1, marginBottom: 20 }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Passwort"
        value={password}
        onChangeText={setPassword}
        style={{ borderBottomWidth: 1, marginBottom: 20 }}
        secureTextEntry
      />
      <Button title={loading ? 'Anmeldung...' : 'Login'} onPress={handleLogin} disabled={loading} />
    </View>
  );
};

export default LoginScreen;
