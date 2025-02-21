import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

const TaskList = ({ tasks, scrollToDay, navigation }) => {
  const scrollViewRef = useRef(null);
  const taskRefs = useRef([]);
  const [sortedTasks, setSortedTasks] = useState([]);

  useEffect(() => {
    if (tasks && Array.isArray(tasks)) {
      taskRefs.current = tasks.map((_, i) => taskRefs.current[i] || React.createRef());
    }
  }, [tasks]);

  useEffect(() => {
    if (tasks && Array.isArray(tasks)) {
      const sorted = [...tasks].sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
      setSortedTasks(sorted);
    }
  }, [tasks]);

  useEffect(() => {
    console.log("Scroll to Day:", scrollToDay);
    if (scrollToDay && sortedTasks.length > 0) {
      const index = sortedTasks.findIndex(task => formatDate(task.start_time) === scrollToDay);
      console.log("Scroll Index:", index);

      if (index !== -1 && taskRefs.current[index]?.current) {
        taskRefs.current[index].current.measureLayout(
          scrollViewRef.current,
          (x, y) => {
            scrollViewRef.current.scrollTo({ y, animated: true });
          },
          (error) => console.error("Measure layout error:", error)
        );
      }
    }
  }, [scrollToDay, sortedTasks]);

  const formatDate = (date) => {
    if (!date) return "N/A";
    const dt = new Date(date);
    const year = dt.getFullYear();
    const month = (dt.getMonth() + 1).toString().padStart(2, '0'); // Monate von 0-11, also +1 und padStart für führende Null
    const day = dt.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`; // Format zu YYYY-MM-DD ändern
  };
  
  const formatDisplayDate = (date) => {
    if (!date) return "N/A";
    const dt = new Date(date);
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const day = dt.getDate();
    const month = months[dt.getMonth()]; // Abgekürzter Monatsname
    const year = dt.getFullYear();
    return `${month} ${day}, ${year}`; // Format z. B. "Dec 3, 2024"
  };

  const formatTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleTimeString('de-DE', {
      hour: '2-digit', minute: '2-digit', hour12: false
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView ref={scrollViewRef} style={styles.scrollView}>
        {sortedTasks.length > 0 ? (
          sortedTasks.map((task, index) => (
            <TouchableOpacity
              key={task.id}
              onPress={() => {
                console.log("Navigating to Task Details:", task);
                navigation.navigate('Details', { task });
              }}
            >
            <View ref={taskRefs.current[index]} style={styles.task}>
              <View style={styles.firstLine}>
                <Text>{`${formatTime(task.start_time)} - ${formatTime(task.end_time)}`}</Text>
                <Text style={styles.dateText}>{formatDisplayDate(task.start_time)}</Text>
              </View>
              <Text style={styles.title}>{(task.event_name || "Unnamed Event").toString()}</Text>
              <Text style={styles.locationText}>
                {(task.location?.location_name || "No location specified").toString()}
              </Text>
            </View>
            </TouchableOpacity>
          ))
        ) : (
          <Text style={styles.emptyMessage}>No tasks available.</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, margin: 10 },
  scrollView: { flex: 1 },
  task: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginBottom: 5,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  firstLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  title: { fontWeight: 'bold', fontSize: 16, flexShrink: 1 },
  dateText: { fontWeight: 'bold', fontSize: 16 },
  locationText: { fontSize: 16, flexShrink: 1 },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
});

export default TaskList;
