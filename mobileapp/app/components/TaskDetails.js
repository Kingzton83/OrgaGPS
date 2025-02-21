import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
  Image,
  PermissionsAndroid,
  Platform,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { API_URL } from '../../apiConfig';


const TaskDetails = ({ route }) => {
  const { task } = route.params;

  const [userLocation, setUserLocation] = useState(null);
  const [bearing, setBearing] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isInZone, setIsInZone] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const designatedZone = {
    latitude: parseFloat(task.location.location_gps_data.split(',')[0]),
    longitude: parseFloat(task.location.location_gps_data.split(',')[1]),
    radius: parseFloat(task.location.location_radius), // Make sure it's a number
  };

  const startTime = task.start_time ? new Date(task.start_time) : null;
  const startTimeLogin = task.start_time_login ? new Date(task.start_time_login) : null;
  const endTime = new Date(task.end_time);

  // Request location permission
  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission denied');
        }
      } catch (err) {
        console.warn(err);
      }
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // Countdown timer
  useEffect(() => {
    if (startTimeLogin && !isNaN(startTimeLogin)) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = startTimeLogin - now;

        if (diff <= 0) {
          clearInterval(interval);
          setTimeRemaining(null);
        } else {
          const hours = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, '0');
          const minutes = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
          const seconds = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, '0');
          setTimeRemaining(`${hours}:${minutes}:${seconds}`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [startTimeLogin]);

  // Geolocation watch
  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ latitude, longitude });

        const calculatedDistance = calculateDistance(
          latitude,
          longitude,
          designatedZone.latitude,
          designatedZone.longitude
        );

        const calculatedBearing = calculateBearing(
          latitude,
          longitude,
          designatedZone.latitude,
          designatedZone.longitude
        );

        setDistance(calculatedDistance.toFixed(1)); // Rounded distance
        setBearing(calculatedBearing); // Set direction
        setIsInZone(calculatedDistance <= designatedZone.radius); // Check if within radius
      },
      (error) => console.error('Geolocation error:', error),
      { enableHighAccuracy: true, distanceFilter: 1 }
    );

    return () => Geolocation.clearWatch(watchId);
  }, [designatedZone]);



  // Berechnet den Azimut zwischen zwei Punkten
  const calculateBearing = (lat1, lon1, lat2, lon2) => {
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x =
      Math.cos(φ1) * Math.sin(φ2) -
      Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    const θ = Math.atan2(y, x);
    return ((θ * 180) / Math.PI + 360) % 360; // Normalisiere auf 0-360°
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Radius of Earth in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  const handleLogin = async () => {
    if (!isInZone) {
      Alert.alert('Error', 'You are not in the designated zone.');
      return;
    }

    const loginTime = new Date().toISOString();

    try {
      const response = await fetch(`${API_URL}/db/schedules/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task_id: task.id, login_time: loginTime }),
      });

      if (!response.ok) {
        throw new Error('Failed to log in.');
      }

      setIsLoggedIn(true);
      Alert.alert('Success', 'Attendance confirmed.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to confirm attendance.');
    }
  };

  const openGoogleMaps = async () => {
    const { latitude, longitude } = designatedZone;
  
    // URL-Schemas für Karten-Apps und Webbrowser
    const appUrl = Platform.OS === 'ios'
      ? `maps://?q=${latitude},${longitude}`
      : `geo:0,0?q=${latitude},${longitude}(Designated Zone)`;
    const webUrl = `https://www.google.com/maps?q=${latitude},${longitude}&zoom=15`;
  
    try {
      // Prüfen, ob eine Karten-App verfügbar ist
      const canOpenApp = await Linking.canOpenURL(appUrl);
      if (canOpenApp) {
        await Linking.openURL(appUrl); // Karten-App öffnen
      } else {
        const canOpenWeb = await Linking.canOpenURL(webUrl);
        if (canOpenWeb) {
          await Linking.openURL(webUrl); // Webbrowser öffnen
        } else {
          throw new Error('Web-URL kann nicht geöffnet werden');
        }
      }
    } catch (err) {
      console.error('Fehler beim Öffnen von Google Maps:', err);
      Alert.alert('Fehler', 'Karte konnte nicht geöffnet werden. Überprüfen Sie Ihre Einstellungen.');
    }
  };
  
  

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return {
      month: monthNames[date.getMonth()],
      day: date.getDate(),
      year: date.getFullYear(),
      time: date.toTimeString().split(' ')[0].substring(0, 5) // this extracts time in HH:MM format
    };
  };
  
  const startDate = task.start_time ? formatDate(task.start_time) : null;
  const endDate = task.end_time ? formatDate(task.end_time) : null;
  

  const renderDynamicContent = () => {
    const now = new Date();
  
    // Check if current time is before the login window starts
    if (now < (startTime || startTimeLogin)) {
      return (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>Login opens in:</Text>
          <Text style={styles.countdownTime}>{timeRemaining}</Text>
        </View>
      );
    }
  
    // Check if the end time is reached and the task is finished
    if (endTime && now >= endTime) {
      return (
        <View style={styles.finishedContainer}>
          <Text style={styles.finishedText}>Task finished!</Text>
        </View>
      );
    }
  
    // If the user is logged in
    if (isLoggedIn) {
      return (
        <View style={styles.attendanceConfirmedContainer}>
          <Text style={styles.attendanceConfirmedText}>Attendance confirmed!</Text>
        </View>
      );
    }
  
    // If the user is in the zone and not yet logged in
    if (isInZone) {
      return (
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Confirm Attendance</Text>
        </TouchableOpacity>
      );
    }
  
    // If the user is outside the zone
    return (
      <View style={styles.arrowContainer}>
        <Image
          source={require('../../assets/arrow.png')}
          style={[
            styles.arrow,
            { transform: [{ rotate: `${bearing}deg` }] },
          ]}
        />
        <Text style={styles.distanceText}>
          Distance: {distance ? `${distance} m` : 'Calculating...'}
        </Text>
        <Text style={styles.outsideZoneText}>
          Move closer to the designated zone
        </Text>
      </View>
    );
  };
  

/**
 * Generates coordinates for a circular polygon to mimic a Circle in MapView.
 * @param {number} latitude
 * @param {number} longitude
 * @param {number} radius - Radius in meters.
 * @returns {Array<{latitude: number, longitude: number}>}
 */
const generateCircleCoordinates = (latitude, longitude, radius) => {
  const coordinates = [];
  const earthRadius = 6371000; // in meters
  const angularDistance = radius / earthRadius;

  for (let angle = 0; angle <= 360; angle += 10) {
    const bearing = (angle * Math.PI) / 180;
    const latRadians = (latitude * Math.PI) / 180;
    const lngRadians = (longitude * Math.PI) / 180;

    const lat = Math.asin(
      Math.sin(latRadians) * Math.cos(angularDistance) +
        Math.cos(latRadians) * Math.sin(angularDistance) * Math.cos(bearing)
    );
    const lng =
      lngRadians +
      Math.atan2(
        Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(latRadians),
        Math.cos(angularDistance) - Math.sin(latRadians) * Math.sin(lat)
      );

    coordinates.push({
      latitude: (lat * 180) / Math.PI,
      longitude: (lng * 180) / Math.PI
    });
  }

  return coordinates;
};


return (
    <View style={styles.container}>
      {/* Event Name */}
      <View style={styles.box}>
        <Text style={styles.title}>{task.event_name}</Text>
      </View>

      {/* Start Date */}
      <View style={styles.box}>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>Start</Text>
          </View>
          <View style={styles.column}>
            {startDate && <Text style={styles.date}>{`${startDate.month} ${startDate.day}, ${startDate.year}`}</Text>}
          </View>
          <View style={styles.column}>
            {startDate && <Text style={styles.time}>{startDate.time}</Text>}
          </View>
        </View>
      </View>

      {/* End Date */}
      <View style={styles.box}>
        <View style={styles.row}>
          <View style={styles.column}>
            <Text style={styles.label}>End</Text>
          </View>
          <View style={styles.column}>
            {endDate && <Text style={styles.date}>{`${endDate.month} ${endDate.day}, ${endDate.year}`}</Text>}
          </View>
          <View style={styles.column}>
            {endDate && <Text style={styles.time}>{endDate.time}</Text>}
          </View>
        </View>
      </View>

      {/* Location */}
      <View style={[styles.box, styles.row]}>
        <Text style={styles.location}>{task.location ? task.location.location_name : 'No Location'}</Text>
        <TouchableOpacity onPress={openGoogleMaps}>
          <Image
            source={require('../../assets/google-maps-icon.png')}
            style={styles.googleMapsIcon}
          />
        </TouchableOpacity>
      </View>

      {/* Description */}
      <View style={styles.box}>
        <Text style={styles.description}>{task.description}</Text>
      </View>

      {/* Dynamic Area */}
      <View style={styles.box}>
        {renderDynamicContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#4BC6B9',
  },
  map: {
    width: '100%',
    height: 400, // Adjust height as necessary
  },
  box: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 16,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  time: {
    fontSize: 16,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  location: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
  },
  finishedText: {
    color: 'red',
    fontSize: 18,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#4BC6B9',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  countdownContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  countdownText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'left',
  },
  countdownTime: {
    fontSize: 16,
    color: 'green',
    textAlign: 'right',
    fontWeight: 'bold',
  },
  arrowContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  arrow: {
    width: 100,
    height: 100,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  googleMapsIcon: {
    width: 24,
    height: 24,
    marginLeft: 10,
  },
  finishedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  attendanceConfirmedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  attendanceConfirmedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4BC6B9',
  },
  distanceText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
  },
  outsideZoneContainer: {
    padding: 10,
    backgroundColor: '#ffe5e5',
    borderRadius: 8,
    alignItems: 'center',
  },
  outsideZoneText: {
    fontSize: 16,
    color: 'red',
    fontWeight: 'bold',
  },
});

export default TaskDetails;
