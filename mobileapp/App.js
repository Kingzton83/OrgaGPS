import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './app/components/HomeScreen';
import TaskDetails from './app/components/TaskDetails';
import LoginScreen from './app/components/LoginView';
import { refreshAccessToken, EmailTokenLogin } from './app/components/authUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActivityIndicator, View, Alert, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

const Stack = createNativeStackNavigator();

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('access_token');
        if (accessToken) {
          console.log('Vorhandenes Access Token gefunden, Benutzer ist bereits authentifiziert.');
          setIsAuthenticated(true);
        } else {
          console.log('Kein Access Token gefunden, versuche Refresh Token...');
          const refreshedToken = await refreshAccessToken();
          if (refreshedToken) {
            console.log('Token erfolgreich aktualisiert.');
            setIsAuthenticated(true);
          } else {
            console.log('Kein gültiger Token gefunden.');
            setIsAuthenticated(false);
          }
        }
      } catch (error) {
        console.error('Fehler bei der Authentifizierung:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuthentication();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#4BC6B9' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={isAuthenticated ? 'Home' : 'Login'}
        screenOptions={{
          contentStyle: { backgroundColor: '#4BC6B9' },
        }}
      >
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: 'OrgaGPS',
            headerTitleAlign: 'center',
            headerLeft: () => null,
          }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'OrgaGPS',
            headerTitleAlign: 'center',
            headerLeft: () => null,
          }}
        />
        <Stack.Screen
          name="Details"
          component={TaskDetails}
          options={({ navigation }) => ({
            title: 'Details',
            headerTitleAlign: 'center',
            headerLeft: () => (
              <Icon
                name="arrow-back"
                size={28}
                color="#000"
                style={{ marginLeft: 10 }}
                onPress={() => navigation.goBack()}
              />
            ),
          })}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
