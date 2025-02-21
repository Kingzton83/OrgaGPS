import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Calendar } from 'react-native-calendars';

const CalendarView = ({ markedDates, onDayPress }) => {
  // Berechne die Breite des Bildschirms
  const screenWidth = Dimensions.get('window').width;

  return (
    <View style={styles.container}>
      <Calendar
        markedDates={markedDates}
        onDayPress={onDayPress}
        style={[styles.calendar, { height: screenWidth - 20 }]} // 20 Pixel Abzug für Padding
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  calendar: {
    borderWidth: 1.5,
    borderColor: 'grey',
    borderRadius: 10,
    width: '100%',
  },
});

export default CalendarView;
