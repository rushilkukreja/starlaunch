import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useTheme } from '@react-navigation/native';
import Headers from '../../components/header/Headers';
import WeatherCard from '../../components/weatherCard/WeatherCard';
import Dropdown from '../../components/dropdown/Dropdown';
import database from '@react-native-firebase/database';
import Geocoder from 'react-native-geocoding';
import axios from 'axios';
import Toast from 'react-native-toast-message';

const API_KEY = '949a1d7573f127ec294f5f41e686b7e9';

const EditDetails = ({ route }) => {
  const { colors } = useTheme();
  const { droneId, flightUid } = route.params;
  const navigation = useNavigation();

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formattedDate, setFormattedDate] = useState('    _ _ / _ _ / _ _ _ _');
  const [time, setTime] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [formattedTime, setFormattedTime] = useState('  _ _ : _ _');
  const [timeUnit, setTimeUnit] = useState('');
  const [massUnit, setMassUnit] = useState('');
  const [altitudeUnit, setAltitudeUnit] = useState('');
  const [location, setLocation] = useState('');
  const [wind, setWind] = useState('');
  const [duration, setDuration] = useState('');
  const [altitude, setAltitude] = useState('');
  const [angle, setAngle] = useState('');
  const [flightTime, setFlightTime] = useState('');
  const [temperature, setTemperature] = useState('');
  const [windSpeed, setWindSpeed] = useState('');
  const [windGust, setWindGust] = useState('');
  const [windDirection, setWindDirection] = useState('');
  const [precipitation, setPrecipitation] = useState('');
  const [pressure, setPressure] = useState('');
  const [droneMass, setDroneMass] = useState('');
  const [weatherData, setWeatherData] = useState(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [loading, setLoading] = useState(true);
  const [updateLoader, setUpdateLoader] = useState(false);

  useEffect(() => {
    const fetchFlightDetails = async () => {
      try {
        setLoading(true);
        const flightRef = database().ref('flights');
        const snapshot = await flightRef.once('value');
        const data = snapshot.val();

        if (data) {
          const flightEntries = Object.entries(data);
          const flightDetails = flightEntries.find(([key]) => key === flightUid);
          if (flightDetails) {
            const [, flight] = flightDetails;
            const flightDate = flight.date;
            setTime(flight.time);
            setTimeUnit(flight.timeUnit);

            if (flightDate) {
              const dateParts = flightDate.split('/');
              if (dateParts.length === 3) {
                const day = parseInt(dateParts[0], 10);
                const month = parseInt(dateParts[1], 10) - 1;
                const year = parseInt(dateParts[2], 10);

                const dateObj = new Date(year, month, day);
                if (!isNaN(dateObj.getTime())) {
                  setDate(dateObj);
                  const formatted = `${('0' + dateObj.getDate()).slice(-2)}/${('0' + (dateObj.getMonth() + 1)).slice(-2)}/${dateObj.getFullYear()}`;
                  setFormattedDate(formatted);
                } else {
                  console.error("Invalid Date", flightDate);
                }
              } else {
                console.error("Date format is incorrect", flightDate);
              }
            }

            const timeParts = flight.time.split(':');
            let hours = parseInt(timeParts[0], 10);
            const minutes = timeParts[1];
            const ampm = flight.timeUnit;
            if (ampm === 'pm' && hours < 12) {
              hours += 12;
            } else if (ampm === 'am' && hours === 12) {
              hours = 0;
            }

            const displayHours = hours % 12 || 12;
            setFormattedTime(`${('0' + displayHours).slice(-2)}:${('0' + minutes).slice(-2)}`);

            setLocation(flight.location);
            setMassUnit(flight.droneMassUnit);
            setWind(flight.wind);
            setDuration(flight.duration);
            setAltitude(flight.altitude);
            setAngle(flight.angle);
            setFlightTime(flight.flightTime);
            setTemperature(flight.weather.main.temp);
            setWindSpeed(flight.weather.wind.speed);
            setWindGust(flight.weather.wind.gust);
            setWindDirection(flight.weather.wind.deg);
            setPrecipitation(flight.weather.rain ? flight.weather.rain['1h'] : "0");
            setPressure(flight.weather.main.pressure);
            setDroneMass(flight.droneMass);
            setAltitudeUnit(flight.altitudeUnit);
          }
        }
      } catch (error) {
        console.error("Error fetching flight details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlightDetails();
  }, [flightUid]);

  useEffect(() => {
    Geocoder.init('AIzaSyAzcg5qXAaIopGlZwLb4mEjd64SaFjGlWk', { language: 'en' });
  }, []);

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
    const formatted = `${('0' + currentDate.getDate()).slice(-2)}/${('0' + (currentDate.getMonth() + 1)).slice(-2)}/${currentDate.getFullYear()}`;
    setFormattedDate(formatted);
  };

  const onTimeChange = (event, selectedTime) => {
    if (event.type === 'dismissed') {
      setShowTimePicker(false);
      return;
    }
    const currentTime = selectedTime || date;
    setShowTimePicker(false);
    let hours = currentTime.getHours();
    const minutes = ('0' + currentTime.getMinutes()).slice(-2);
    if (timeUnit === 'pm' && hours < 12) {
      hours += 12;
    } else if (timeUnit === 'am' && hours === 12) {
      hours = 0;
    }
    setFormattedTime(`${('0' + hours).slice(-2)}:${minutes}`);
  };

  const fetchWeatherData = async (lat, lng) => {
    setLoadingWeather(true);
    try {
      const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${API_KEY}&units=metric`);

      const main = weatherResponse?.data?.main;
      const wind = weatherResponse?.data?.wind;
      const rain = weatherResponse?.data?.rain;

      setTemperature(main?.temp);
      setWindSpeed(wind?.speed);
      setWindGust(wind?.gust);
      setPrecipitation(rain ? rain['1h'] : "0");
      setPressure(main?.pressure);
      setWindDirection(wind?.deg);
      setWeatherData(weatherResponse?.data);
    } catch (error) {
      Alert.alert('Star Launch', 'Failed to fetch weather data. Please check your location.');
      console.log(error);
    } finally {
      setLoadingWeather(false);
    }
  };

  const handleLocationChange = (inputLocation) => {
    setLocation(inputLocation);
  };

  const handleSubmitLocation = async () => {
    if (location.trim() === '') {
      Alert.alert('Star Launch', 'Please enter a location.');
      return;
    }

    try {
      const geocodeResponse = await Geocoder.from(location);
      const { lat, lng } = geocodeResponse.results[0].geometry.location;
      fetchWeatherData(lat, lng);
    } catch (error) {
      console.log('Error fetching location data:', error);
      Alert.alert('Star Launch', 'Could not fetch location data. Please check the location and try again.');
    }
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

  const handleSave = async () => {
    try {
      setUpdateLoader(true);
      const flightData = {
        date: formattedDate,
        time: formattedTime,
        timeUnit: timeUnit,
        location: location,
        wind: wind,
        duration: duration,
        altitude: altitude,
        altitudeUnit: altitudeUnit,
        angle: angle,
        flightTime: flightTime,
        droneMass: droneMass,
        droneMassUnit: massUnit,
        weather: {
          main: {
            temp: temperature,
            pressure: pressure,
          },
          wind: {
            speed: windSpeed,
            gust: windGust,
            deg: windDirection
          },
          rain: {
            "1h": precipitation,
          },
        },
      };

      await database().ref(`flights/${flightUid}`).update(flightData);

      Toast.show({
        type: 'success',
        text1: "Flight Details edited successfully",
        position: 'top',
        topOffset: 100,
        text1Style: { fontSize: 16, fontWeight: 'bold' },
        onHide: () => { navigation.navigate('FlightDetails', { droneId: droneId }) }
      })
    } catch (error) {
      console.error('Error updating flight details:', error);
      setUpdateLoader(false);
    } finally {
      setUpdateLoader(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Headers title="Edit Details" showBackButton={true} />
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

        <ScrollView contentContainerStyle={{ zIndex: 1 }} showsVerticalScrollIndicator={false}>
          <View style={styles.detailsContainer}>

            {/* Date Field */}
            <View style={styles.row}>
              <View style={styles.iconLabelContainer}>
                <Image source={require('../../assets/dashboardicons/last-flight-date.png')} style={[styles.icon, { tintColor: colors.icon }]} />
                <Text style={[styles.label, { color: colors.text }]}>Date</Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={[styles.inputWrapper, { backgroundColor: colors.dateInputContainer }]}>
                <Text style={[styles.input, { color: colors.inputText }]}>
                  {formattedDate}
                </Text>
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
                onChange={(event, selectedTime) => {
                  onTimeChange(event, selectedTime);
                  if (event.type === 'set') {
                    const selectedHours = selectedTime.getHours();
                    setTimeUnit(selectedHours >= 12 ? 'pm' : 'am');
                  }
                }}
              />
            )}

            {/* Drone Mass Field */}
            <Dropdown
              icon={require('../../assets/dashboardicons/mass.png')}
              label="Rocket Mass"
              placeholder="Mass"
              value={droneMass}
              onChangeText={(text) => {
                setDroneMass(text);
              }}
              unitWithDropdown={massUnit}
              options={['g', 'lbs']}
              withDropdownIcon={require('../../assets/icons/dropdown_arrow.png')}
              onChangeUnit={setMassUnit}
            />

            {/* Altitude Field with Dropdown */}
            <Dropdown
              icon={require('../../assets/dashboardicons/altitude.png')}
              label="Altitude"
              value={altitude}
              onChangeText={(text) => {
                setAltitude(text);
              }}
              unitWithDropdown={altitudeUnit}
              options={['m', 'ft']}
              withDropdownIcon={require('../../assets/icons/dropdown_arrow.png')}
              onChangeUnit={setAltitudeUnit}
            />

            {/* Angle Field */}
            <Dropdown
              icon={require('../../assets/addDroneicons/angle.png')}
              label="Angle"
              placeholder={angle}
              value={angle}
              onChangeText={(text) => {
                setAngle(text);
              }}
              unitWithoutDropdown="deg"
            />

            {/* Flight Time Field */}
            <Dropdown
              icon={require('../../assets/dashboardicons/flight-time.png')}
              label="Flight Time"
              placeholder={flightTime.toString()}
              value={flightTime.toString()}
              onChangeText={(text) => {
                setFlightTime(text);
              }}
              unitWithoutDropdown="sec"
            />

          </View>

          <View style={styles.weatherContainer}>
            {loadingWeather ? (
              <ActivityIndicator size="large" color={colors.primary} />
            ) : temperature !== undefined ? (
              <WeatherCard
                temperature={temperature}
                windSpeed={windSpeed}
                precipitation={precipitation}
                windGust={windGust ? windGust : "0"}
                pressure={pressure}
                windDirection={windDirection}
              />
            ) : (
              <Text style={{ color: colors.text, fontSize: 16 }}>
                No weather data available. Please enter location
              </Text>
            )}
          </View>

          <TouchableOpacity onPress={handleGetRecommendation} style={[styles.buttonContainer, { backgroundColor: colors.containerBackground }]}>
            <Text style={[styles.buttonText, { color: colors.text }]}>Get Pre-Flight AI Recommendation</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress = {handleGetRecommendation} style={[styles.buttonContainer, { backgroundColor: colors.containerBackground }]}>
            <Text style={[styles.buttonText, { color: colors.text }]}>Get Post-Flight AI Recommendation</Text>
          </TouchableOpacity>

          {/* Submit Button */}
        </ScrollView>
        <TouchableOpacity onPress={handleSave} style={[styles.submitButton, { backgroundColor: colors.submitBackground }]}>
          {updateLoader ? (
            <ActivityIndicator size="small" color={colors.submitText} />
          ) : (
            <Text style={[styles.submitButtonText, { color: colors.submitText }]}>Save</Text>
          )}
        </TouchableOpacity>
        <Toast />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  detailsContainer: {
    padding: 20,
    zIndex: 0,
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
    // fontWeight: 'bold',
  },
  inputWrapper: {
    flex: 0.6,
    height: 50,
    backgroundColor: '#E9E9E9',
    borderRadius: 10,
    paddingVertical: 5,
    paddingHorizontal: 15,
    marginLeft: 100,
  },
  input: {
    fontSize: 16,
    color: '#000',
    fontFamily: 'DMSans-Regular',
  },
  submitButton: {
    backgroundColor: 'white',
    paddingVertical: 15,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 18,
    fontFamily: 'DMSans-Regular',
    fontWeight: '600',
  },
  buttonContainer: {
    marginHorizontal: 20,
    backgroundColor: '#E9E9E9',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginTop: 20,
  },
  buttonText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
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
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: "57%"
  },
  weatherContainer: {
    marginHorizontal: 20,
  },
});

export default EditDetails;
