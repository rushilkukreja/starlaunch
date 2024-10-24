
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, TextInput, ActivityIndicator, PermissionsAndroid } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme, useNavigation } from '@react-navigation/native';
import Headers from '../../components/header/Headers';
import WeatherCard from '../../components/weatherCard/WeatherCard';
import Dropdown from '../../components/dropdown/Dropdown';
import Geocoder from 'react-native-geocoding';
import axios from 'axios';
import { useLocation } from '../../Context/LocationContext';
import GetLocation from 'react-native-get-location';
import Toast from 'react-native-toast-message';
const API_KEY = '949a1d7573f127ec294f5f41e686b7e9';

const AddFlight = ({ route }) => {
  const { colors, dark } = useTheme();
  const navigation = useNavigation();
  const { droneId, droneDetails } = route.params;
  const { userLocation, setUserLocation } = useLocation();

  useEffect(() => {
    Geocoder.init('AIzaSyAzcg5qXAaIopGlZwLb4mEjd64SaFjGlWk', { language: 'en' });
    requestLocationPermission().then(granted => {
      if (granted) {
        getCurrentLocation();
      }
    });
  }, []);

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [formattedDate, setFormattedDate] = useState('    _ _ / _ _ / _ _ _ _');
  const [formattedTime, setFormattedTime] = useState('  _ _ : _ _');
  const [timeUnit, setTimeUnit] = useState('am');
  const [droneMassUnit, setDroneMassUnit] = useState('g');
  const [droneMass, setDroneMass] = useState('');
  const [location, setLocation] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);

  const getCurrentLocation = async () => {
    try {
      const location = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });
      setUserLocation({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      const geocodeResponse = await Geocoder.from(location.latitude, location.longitude);
      const address = geocodeResponse.results[0].formatted_address;
      setLocation(address);
      fetchWeatherData(location.latitude, location.longitude);
    } catch (error) {
      console.error('Error getting current location:', error);
      Alert.alert('Error', 'Unable to fetch your location. Please try again.');
    }
  };

  const requestLocationPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Star Launch Location Permission',
            message: 'Star Launch needs access to your location to show your current position.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
    const formatted = `${('0' + currentDate.getDate()).slice(-2)}/${('0' + (currentDate.getMonth() + 1)).slice(-2)}/${currentDate.getFullYear()}`;
    setFormattedDate(formatted);
  };

  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || date;
    setShowTimePicker(false);

    let hours = currentTime.getHours();
    const minutes = ('0' + currentTime.getMinutes()).slice(-2);
    const timePeriod = hours >= 12 ? 'pm' : 'am';

    hours = hours % 12 || 12; // Convert to 12-hour format and handle the case for 12 PM/AM

    setFormattedTime(`${('0' + hours).slice(-2)}:${minutes}`);
    setTimeUnit(timePeriod);
    console.log(`${('0' + hours).slice(-2)}:${minutes} ${timePeriod}`);
    
  };
  const handleGetRecommendation = () => {
    Toast.show({
      type: 'success',
      text1: 'Coming Soon!',
      position: 'top',
      topOffset: 100,
      text1Style: { fontSize: 16, fontWeight: 'bold' }
    });
  }
  const fetchWeatherData = async (lat, lng) => {
    console.log(lat, lng)
    setLoadingWeather(true);
    try {
      const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`);
      setWeatherData(weatherResponse.data);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch weather data. Please check your location.');
      console.error(error);
    } finally {
      setLoadingWeather(false);
    }
  };

  const handleLocationChange = (inputLocation) => {
    setLocation(inputLocation);
  };

  const handleSubmitLocation = async () => {
    if (location.trim() === '') {
      Alert.alert('Error', 'Please enter a location.');
      return;
    }

    try {
      const geocodeResponse = await Geocoder.from(location);
      const { lat, lng } = geocodeResponse.results[0].geometry.location;
      fetchWeatherData(lat, lng);
    } catch (error) {
      console.error('Error fetching location data:', error);
      Alert.alert('Error', 'Could not fetch location data. Please check the location and try again.');
    }
  };

  const handleStartFlight = () => {
    // Collect all details to pass to Preferences
    const flightDetails = {
      date: formattedDate,
      time: formattedTime,
      location: location,
      weather: weatherData,
      droneId: droneId,
      timeUnit: timeUnit,
      droneMass: droneMass,
      droneMassUnit: droneMassUnit,
    };
    console.log(flightDetails, "flightDetails");


    if (!location || !formattedDate || !formattedTime || !droneMass) {
      Alert.alert("Star Launch", "Please enter all the fields");
      return;
    }
    navigation.navigate('Preferences', { flightDetails });
  };

  console.log(showTimePicker,"showTimePicker");
  
  

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Headers title="Add Flight" showBackButton={true} />

      {/* Location Input Field */}
      <View style={[styles.searchBar, { backgroundColor: colors.containerBackground }]}>
        <Image source={require('../../assets/icons/searchLocation.png')} style={[styles.searchIcon, { tintColor: colors.icon }]} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="Enter location"
          placeholderTextColor="#B0B0B0"
          value={location}
          onChangeText={handleLocationChange}
        />
        <TouchableOpacity onPress={handleSubmitLocation} style={[styles.searchButton, { backgroundColor: colors.unitbackground }]}>
          <Text style={styles.searchButtonText}>Submit</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.detailsContainer}>
          {/* Date Field */}
          <View style={styles.row}>
            <View style={styles.iconLabelContainer}>
              <Image source={require('../../assets/dashboardicons/last-flight-date.png')} style={[styles.icon, { tintColor: colors.icon }]} />
              <Text style={[styles.label, { color: colors.text }]}>Date</Text>
            </View>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={[styles.inputWrapper, { backgroundColor: colors.dateInputContainer }]}>
              <Text style={[styles.dateText, { color: colors.inputText }]}>{formattedDate}</Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode="date"
              display="default"
              onChange={onDateChange}
            />
          )}

          {/* Time Field with Dropdown */}
          <Dropdown
            icon={require('../../assets/dashboardicons/flight-time.png')}
            label="Time"
            placeholder={formattedTime}
            unitWithDropdown={timeUnit}
            options={['am', 'pm']}
            withDropdownIcon={require('../../assets/icons/dropdown_arrow.png')}
            onPressInput={() => setShowTimePicker(true)}
            onChangeUnit={setTimeUnit}
          />

          {showTimePicker && (
            <DateTimePicker
              testID="timePicker"
              value={date}
              mode="time"
              is24Hour={false}
              display="default"
              onChange={onTimeChange}
            />
          )}

          {/* Drone Mass Field with Dropdown */}
          <Dropdown
            icon={require('../../assets/dashboardicons/mass.png')}
            label="Rocket Mass"
            placeholder="Mass"
            value={droneMass}
            keyboardType="numeric"
            onChangeText={(text) => {
              console.log("Drone mass entered:", text);
              setDroneMass(text);
            }}
            // keyboardType="numeric"
            unitWithDropdown={droneMassUnit}
            withDropdownIcon={require('../../assets/icons/dropdown_arrow.png')}
            options={['g', 'lbs']}
            onChangeUnit={setDroneMassUnit}
          />

          {/* Weather Details */}
          <View style={styles.weatherContainer}>
            {loadingWeather ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : weatherData ? (
              <WeatherCard
                temperature={weatherData.main.temp}
                windSpeed={weatherData.wind.speed}
                precipitation={weatherData.rain ? weatherData.rain['1h'] : "0"}
                windGust={weatherData.wind.gust ? weatherData.wind.gust : "0"}
                pressure={weatherData.main.pressure}
                windDirection={weatherData.wind.deg}
              />
            ) : (
              <Text style={{ color: colors.text, fontSize: 16 }}>No weather data available. Please enter location</Text>
            )}
          </View>
        </View>

        {/* Start Flight and Recommendation Buttons */}
        <TouchableOpacity style={[styles.buttonContainer, { backgroundColor: colors.containerBackground }]} onPress={handleGetRecommendation}>
          <Text style={[styles.buttonText, { color: colors.text }]}>Get Pre-Flight AI Recommendation</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleStartFlight} style={[styles.buttonContainer, { backgroundColor: colors.containerBackground }]}>
          <Text style={[styles.buttonText, { color: colors.text }]}>Start flight</Text>
          <Image
            source={require('../../assets/icons/start_flight_icon.png')}
            style={[styles.buttonIcon, { tintColor: colors.icon }]}
          />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  detailsContainer: {
    padding: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.4,
  },
  icon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  label: {
    fontSize: 18,
    fontFamily: 'DMSans-Regular',
    fontWeight: '600',
  },
  inputWrapper: {
    flex: 0.6,
    borderRadius: 10,
    marginLeft: 80,
    height: 50,
    justifyContent: 'center',
    backgroundColor: '#E9E9E9',
  },
  buttonContainer: {
    marginHorizontal: 20,
    backgroundColor: '#E9E9E9',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    marginBottom: 20,
    padding: 10,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'DMSans-Regular',
    fontWeight: 'bold',
    color: '#000',
  },
  buttonIcon: {
    width: 25,
    height: 25,
  },
  weatherContainer: {
    marginTop: 20,
  },
  weatherTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'DMSans-Regular',

  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 10,
    height: 50,
    marginHorizontal: 10
  },
  searchIcon: {
    width: 20,
    height: 25,
    marginRight: 10
  },
  searchButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 10,
  },
  searchButtonText: {
    color: '#fff',
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'DMSans-Regular',
    padding: 10,
  },
  dateText: {
    margin: 12,
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
  }
});

export default AddFlight;
