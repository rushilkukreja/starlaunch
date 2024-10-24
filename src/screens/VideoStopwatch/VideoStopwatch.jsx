import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, ActivityIndicator, Alert, Linking, Platform, PermissionsAndroid } from 'react-native';
import { useTheme, useNavigation, useRoute } from '@react-navigation/native';
import { Camera, useCameraDevice } from 'react-native-vision-camera'; 
import { CameraRoll } from "@react-native-camera-roll/camera-roll";
import LinearGradient from 'react-native-linear-gradient';
import RNFS from 'react-native-fs';
import Toast from 'react-native-toast-message';

const VideoStopwatchScreen = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateYAnim = useRef(new Animated.Value(0)).current;
  const device = useCameraDevice('back');
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const cameraRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [videoPath, setVideoPath] = useState('');
  const [cameraReady, setCameraReady] = useState(false);

  const route = useRoute();
  const flightDetails = route.params?.flightDetails || {};
  // Request camera and microphone permissions
  const requestPermissions = async () => {
    const cameraPermission = await Camera.requestCameraPermission();
    const microphonePermission = await Camera.requestMicrophonePermission();

    if (cameraPermission !== 'granted') {
      Alert.alert('Camera permission denied. Please enable it in the app settings.');
    }

    // if (microphonePermission !== 'granted') {
    //   Alert.alert('Microphone permission denied. Please enable it in the app settings.');
    // }

    // const granted = cameraPermission === 'granted' && microphonePermission === 'granted';
    const granted = cameraPermission === 'granted';
    setPermissionsGranted(granted);
  };

  // Format the time into hours, minutes, and seconds
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

  // Animate the seconds going down to up as they change
  const animateTimeChange = () => {
    translateYAnim.setValue(20);
    fadeAnim.setValue(0);

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
    requestPermissions(); // Request camera permissions
  
    if (isRunning) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => {
          animateTimeChange(); // Trigger animation on each second change
          return prevSeconds + 1; // Increment the seconds instead of decrementing
        });
      }, 1000);
    }
  
    return () => clearInterval(interval); // Clear interval on unmount
  }, [isRunning]);
  

  // Start recording when the screen is loaded and camera is ready
  useEffect(() => {
    if (permissionsGranted && device && cameraRef.current && cameraReady) {
      startRecording();
    }
  }, [permissionsGranted, device, cameraReady]);

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      setIsRecording(true);
      try {
        await cameraRef.current.startRecording({
          filePath: `${RNFS.ExternalDirectoryPath}/video_${Date.now()}.mp4`,
          audio: true, // Ensure audio is included in the recording
          onRecordingFinished: async (video) => {
            console.log('Recording finished, saving to CameraRoll...');
            try {
              const savedPath = await CameraRoll.save(`file://${video.path}`, { type: 'video' });
              console.log('Video saved to CameraRoll.');
              setVideoPath(savedPath);
              setIsRecording(false);
              
              // Adding a slight delay before showing the Toast
              setTimeout(() => {
                console.log('Showing Toast...');
                Toast.show({
                  type: 'success',
                  text1: 'Video saved successfully',
                  position: 'top',
                  topOffset: 100,
                  text1Style: { fontSize: 16, fontWeight: 'bold' }
                });
              }, 100);
            } catch (error) {
              console.error('Failed to save video to CameraRoll:', error);
              Alert.alert('Error', 'Failed to save video.');
            }
          },
          onRecordingError: (error) => {
            console.error('Recording failed:', error);
            setIsRecording(false);
          },
        });
      } catch (error) {
        console.error('Error starting recording:', error);
        setIsRecording(false);
      }
    }
  };
  
  
  const stopRecording = async () => {
    if (cameraRef.current && isRecording) {
      await cameraRef.current.stopRecording();
    }
  };
  const time = formatTime(seconds);
  const handlePress = async () => {
    setIsRunning(false);
    await stopRecording();
    const totalFlightTime = seconds;
    navigation.navigate('Preferences', {
      flightTime: totalFlightTime,
      flightDetails,
    });
  };



  if (!permissionsGranted) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color={colors.text} />
        <Text style={[styles.loadingText, { color: colors.text }]}>Awaiting permissions...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {device ? (
        <>
          <Camera
            ref={cameraRef}
            style={styles.camera}
            device={device}
            isActive={true}
            video={true}
            onInitialized={() => setCameraReady(true)}
          />

          <View style={styles.overlay}>
            <View style={styles.timerContainer}>
              <LinearGradient
                colors={['#ffffff10', '#ffffff30', '#ffffff20', '#ffffff30']}
                style={[styles.timeBox, { backgroundColor: colors.timerBackground }]}
                start={{ x: 0.3, y: 0.1 }}
                end={{ x: 1, y: 0.2 }}
              >
                <View style={styles.timeRow}>
                  <Text style={styles.timerText}>{`${time.hours}:${time.minutes}:`}</Text>
                  <Animated.Text
                    style={[styles.timerText, { opacity: fadeAnim, transform: [{ translateY: translateYAnim }] }]}
                  >
                    {time.seconds}
                  </Animated.Text>
                </View>
              </LinearGradient>
            </View>

            <TouchableOpacity style={styles.buttonContainer} onPress={handlePress}>
              <View style={[styles.recordButton, { backgroundColor: colors.tabBarColor }]}>
                <View style={styles.innerRecordButton} />
              </View>
            </TouchableOpacity>
          </View>
        </>
      ) : (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={colors.text} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Loading Camera...</Text>
        </View>
      )}
      <Toast/>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    ...StyleSheet.absoluteFillObject,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerContainer: {
    marginTop: 50,
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
    marginBottom: 100,
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    marginTop: 10,
  },
});

export default VideoStopwatchScreen;