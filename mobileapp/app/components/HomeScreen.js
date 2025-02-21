// HomeScreen.js
import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import TaskList from './TaskList';
import CalendarView from './CalendarView';
import { API_URL } from '../../apiConfig';

const HomeScreen = ({ navigation }) => {  // Hole die navigation-Prop
    const [tasks, setTasks] = useState([]);
    const [selectedDay, setSelectedDay] = useState(null);
  
    useEffect(() => {
      const fetchTasks = async () => {
        try {
          const response = await fetch(`${API_URL}db/schedules/`);
          if (!response.ok) {
            throw new Error('Failed to fetch tasks');
          }
          const data = await response.json();
          setTasks(data);
        } catch (error) {
          console.error('Error fetching tasks:', error);
        }
      };
  
      fetchTasks();
    }, []);
  
    const getMarkedDates = () => {
      const marked = {};
      tasks.forEach((task) => {
        const date = new Date(task.start_time).toISOString().split('T')[0];
        marked[date] = { marked: true, dotColor: 'green' };
      });
      return marked;
    };
  
    const handleDayPress = (day) => {
      setSelectedDay(day.dateString);  // Wähle den Tag aus, zu dem gescrollt werden soll
    };
  
    return (
      <View style={{ flex: 1 }}>
        {/* Weitergabe von navigation an TaskList */}
        <TaskList tasks={tasks} scrollToDay={selectedDay} navigation={navigation} />
        <CalendarView markedDates={getMarkedDates()} onDayPress={handleDayPress} />
      </View>
    );
  };  

export default HomeScreen;
