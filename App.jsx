import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useEffect, useState } from 'react';
import { Alert, Appearance, StatusBar } from 'react-native';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './src/common/store/store';
import { BlueTheme, CustomDarkTheme, LightTheme } from './src/common/theme/Theme';
import AddDrone from './src/screens/drones/AddDrone';
import { setTheme } from './src/features/theme/themeSlice';
import MainNavigation from './src/navigation/MainNavigation';
import LoginScreen from './src/screens/auth/LoginScreen';
import SignupScreen from './src/screens/auth/SignupScreen';
import SplashScreen from './src/screens/auth/SplashScreen';
import AddFlight from './src/screens/FlightDetails/AddFlight';
import EditDetails from './src/screens/FlightDetails/EditDetails';
import FlightDetails from './src/screens/FlightDetails/FlightDetails';
import SearchLocation from './src/screens/Location/SearchLocation';
import SettingsScreen from './src/screens/module/SettingsScreen';
import EditPreferencesDetails from './src/screens/Preferences/EditPreferencesDetails';
import Preferences from './src/screens/Preferences/Preferences';
import HandleLogout from './src/screens/Profile/HandleLogout';
import StopwatchScreen from './src/screens/Stopwatch/Stopwatch';
import VideoStopwatchScreen from './src/screens/VideoStopwatch/VideoStopwatch';
import ForgotPasswordScreen from './src/screens/auth/ForgotPassword';
import EditProfile from './src/screens/Profile/EditProfile';
import { LocationProvider } from './src/Context/LocationContext';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Dashboard from './src/screens/Home/Home';
import EditDrone from './src/screens/drones/EditDrone';
import Toast from 'react-native-toast-message';
import NetInfo from '@react-native-community/netinfo';
import NoInternetScreen from './src/components/network/NoInternetScreen';
import LocationDetails from './src/screens/Location/LocationDetails';

// import Toast from 'react-native-toast-message';

const Stack = createStackNavigator();
function RootNavigator() {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  useEffect(() => {
    const getStoredTheme = async () => {
      const storedTheme = await AsyncStorage.getItem('theme');
      if (storedTheme) {
        console.log(`Stored theme found: ${storedTheme}`);
        dispatch(setTheme(storedTheme));
      } else {
        console.log('No theme stored, using default or device theme.');
      }
    };
    getStoredTheme();
  }, [dispatch]);
  return (
    <>
      <Stack.Navigator initialRouteName="Splash">
        {isAuthenticated ? (
          <>
            <Stack.Screen name="App" component={MainNavigation} options={{ headerShown: false }} />
            <Stack.Screen name="Dashboard" component={Dashboard} options={{ headerShown: false }} />
            <Stack.Screen name="AddDrone" component={AddDrone} options={{ headerShown: false }} />
            <Stack.Screen name="Setting" component={SettingsScreen} options={{ headerShown: false }} />
            <Stack.Screen name="SearchLocation" component={SearchLocation} options={{ headerShown: false }} />
            <Stack.Screen name="FlightDetails" component={FlightDetails} options={{ headerShown: false }} />
            <Stack.Screen name="EditDetails" component={EditDetails} options={{ headerShown: false }} />
            <Stack.Screen name="AddFlight" component={AddFlight} options={{ headerShown: false }} />
            <Stack.Screen name="Preferences" component={Preferences} options={{ headerShown: false }} />
            <Stack.Screen name="HandleLogout" component={HandleLogout} options={{ headerShown: false }} />
            <Stack.Screen name="Stopwatch" component={StopwatchScreen} options={{ headerShown: false }} />
            <Stack.Screen name="EditPreferencesDetails" component={EditPreferencesDetails} options={{ headerShown: false }} />
            <Stack.Screen name="VideoStopwatch" component={VideoStopwatchScreen} options={{ headerShown: false }} />
            <Stack.Screen name="EditProfile" component={EditProfile} options={{ headerShown: false }} />
            <Stack.Screen name="EditDrone" component={EditDrone} options={{ headerShown: false }} />
            <Stack.Screen name="LocationDetails" component={LocationDetails} options={{ headerShown: false }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Signup" component={SignupScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
          </>
        )}
      </Stack.Navigator>
    </>
  );
}

function AppContainer() {
  const dispatch = useDispatch();
  const selectedTheme = useSelector((state) => state.theme);
  const [isConnected, setIsConnected] = useState(true);
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '157878797833-gbgdrc4gr1j0n1bee4sk91g2mvosc4uc.apps.googleusercontent.com', // Replace with your Web Client ID from Firebase
    });
    const checkStoredTheme = async () => {
      if (selectedTheme == null) {
        const colorScheme = Appearance.getColorScheme();
        dispatch(setTheme(colorScheme));
      }
    };
    checkStoredTheme();

  }, [dispatch]);

  useEffect(() => {
    const checkInitialNetInfo = async () => {
      const state = await NetInfo.fetch(); // Fetch the initial network state
      setIsConnected(state.isConnected);
    };

    checkInitialNetInfo(); // Check the connection at the start
    const unsubscribeNetInfo = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribeNetInfo();
    };
  }, []);

  const handleRetry = async () => {
    const state = await NetInfo.fetch();
    setIsConnected(state.isConnected);
  };

  console.log(isConnected, 'isConnected');


  let theme;
  switch (selectedTheme) {
    case 'dark':
      theme = CustomDarkTheme;
      break;
    case 'blue':
      theme = BlueTheme;
      break;
    case 'light':
    default:
      theme = LightTheme;
      break;
  }
  if (!isConnected) {
    return <NoInternetScreen onRetry={handleRetry} />;
  }
  return (
    <LocationProvider>
      <NavigationContainer theme={theme}>
        <StatusBar backgroundColor={theme.colors.background} barStyle={selectedTheme === 'dark' || selectedTheme === 'blue' ? 'light-content' : 'dark-content'} />
        <RootNavigator />
        <Toast />
      </NavigationContainer>
    </LocationProvider>
  );
}



export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContainer />
      </PersistGate>
    </Provider>
  );
}