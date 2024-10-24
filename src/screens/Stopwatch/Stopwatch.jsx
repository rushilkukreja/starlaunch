import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useTheme, useNavigation, useRoute } from '@react-navigation/native';
import Headers from '../../components/header/Headers';
import LinearGradient from 'react-native-linear-gradient';

const StopwatchScreen = () => {
  const route = useRoute();
  const flightDetails = route.params?.flightDetails || {};
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [seconds, setSeconds] = useState(0); // Start from 0:59:59
  const [isRunning, setIsRunning] = useState(true); // Timer starts automatically
  const fadeAnim = useRef(new Animated.Value(0)).current; // Initial animation state
  const translateYAnim = useRef(new Animated.Value(0)).current; // For vertical animation

  // Separate the time into hours, minutes, and seconds
  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return {
      hours: hours.toString().padStart(1, '0'),
      minutes: minutes.toString().padStart(2, '0'),
      seconds: seconds.toString().padStart(2, '0'),
    };
  };

  const animateTimeChange = () => {
    // Reset to original position before the next animation
    translateYAnim.setValue(20);
    fadeAnim.setValue(0);

    // Start the animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateYAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };
  useEffect(() => {
    let interval = null;

    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          animateTimeChange(); // Trigger animation when seconds change
          return prevSeconds + 1; // Increment the seconds
        });
      }, 1000);
    } else if (seconds <= 0) {
      setIsRunning(false);
      clearInterval(interval); // Clear the interval when timer ends
    }

    return () => clearInterval(interval);
  }, [isRunning, seconds]);


  const handlePress = () => {
    setIsRunning(false);
    const totalFlightTime = seconds;  // Now this is the total elapsed time in seconds
    navigation.navigate('Preferences', { flightTime: totalFlightTime, flightDetails });
  };


  const time = formatTime(seconds);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Headers title="Stopwatch" showBackButton={true} />

      {/* Timer Display with Gradient Styling */}
      <View style={styles.timerContainer}>
        <LinearGradient
          colors={['#ffffff10', '#ffffff30', '#ffffff20', '#ffffff30']}
          style={[styles.timeBox, { backgroundColor: colors.timerBackground }]}
          start={{ x: 0.3, y: 0.1 }}
          end={{ x: 1, y: 0.2 }}
        >
          {/* Time (Animated seconds, static hours and minutes) */}
          <View style={styles.timeRow}>
            <Text style={styles.timerText}>{`${time.hours}:${time.minutes}:`}</Text>
            <Animated.Text
              style={[
                styles.timerText,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: translateYAnim }], // Slide animation
                },
              ]}
            >
              {time.seconds}
            </Animated.Text>
          </View>
        </LinearGradient>
      </View>

      {/* Navigate Button */}
      <TouchableOpacity style={styles.buttonContainer} onPress={handlePress}>
        <View style={[styles.recordButton, { backgroundColor: colors.tabBarColor }]}>
          <View style={styles.innerRecordButton} />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeBox: {
    paddingVertical: 10,
    paddingHorizontal: 40,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#FFFFFF50',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 60,
    color: '#FFFFFF',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonContainer: {
    flex: 1,
    alignItems: 'center',
    marginBottom: 180,
  },
  recordButton: {
    width: 80,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerRecordButton: {
    width: 30,
    height: 30,
    backgroundColor: 'red',
    borderRadius: 15,
  },
});

export default StopwatchScreen;
