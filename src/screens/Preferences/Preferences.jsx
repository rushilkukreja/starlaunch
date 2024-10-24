import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import Headers from '../../components/header/Headers';
import { useNavigation } from '@react-navigation/native';
import { useRoute } from '@react-navigation/native';
import database from '@react-native-firebase/database';
import Dropdown from '../../components/dropdown/Dropdown';
import Toast from 'react-native-toast-message';

const Preferences = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();

  const [altitudeUnit, setAltitudeUnit] = useState('m');
  const [angleUnit, setAngleUnit] = useState('deg');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [altitude, setAltitude] = useState('');
  const [angle, setAngle] = useState('');
  const [flightTime, setFlightTime] = useState(0);
  const [flightDetails, setFlightDetails] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const flightTimeInSeconds = route.params?.flightTime || 0;
    const details = route.params?.flightDetails || {};
    setFlightTime(flightTimeInSeconds);
    setFlightDetails(details);
  }, [route.params?.flightTime]);

  // Data array for the cards
  const preferencesData = [
    {
      icon: require('../../assets/icons/stopwatch.png'),
      label: 'Stopwatch',
      screen: 'Stopwatch',
    },
    {
      icon: require('../../assets/icons/video_stopwatch.png'),
      label: 'Video & Stopwatch',
      screen: 'VideoStopwatch',
    },
    {
      icon: require('../../assets/icons/compass.png'),
      label: 'Compass',
      url: 'https://play.google.com/store/apps/details?id=com.vincentlee.compass',
    },
    {
      icon: require('../../assets/icons/adjust_level.png'),
      label: 'Adjust Level',
      url: 'https://play.google.com/store/apps/details?id=com.map.measure2',
    },
  ];

  // Data array for the additional UI (Altitude, Angle, Flight Time)
  const additionalData = [
    {
      icon: require('../../assets/dashboardicons/altitude.png'),
      label: 'Altitude',
      placeholder: 'Altitude',
      unit: 'm',
      hasDropdown: true, // Enable dropdown for altitude
    },
    {
      icon: require('../../assets/addDroneicons/angle.png'),
      label: 'Angle',
      placeholder: 'Angle',
      unit: 'deg',
    },
    {
      icon: require('../../assets/icons/stopwatch.png'),
      label: 'Flight Time',
      placeholder: 'Time',
      unit: 'sec',
    },
  ];

  const handlePress = async (screen, url, label) => {
    if (screen) {
      navigation.navigate(screen, { flightDetails });
    } else if (Platform.OS === 'ios') {
      if (label === 'Compass') {
        const canOpen = await Linking.canOpenURL('compass://');
        if (canOpen) {
          Linking.openURL('compass://');
        } else {
          Alert.alert(
            'Compass Not Found',
            'Please open the native Compass app manually from your home screen.',
            [{ text: 'OK' }]
          );
        }
      } else if (label === 'Adjust Level') {
        const canOpen = await Linking.canOpenURL('measures://');
        if (canOpen) {
          Linking.openURL('measures://');
        } else {
          Alert.alert(
            'Measure Not Found',
            'Please open the native Measure app manually from your home screen.',
            [{ text: 'OK' }]
          );
        }
      }
    } else {
      Linking.openURL(url).catch((err) => {
        console.error("Couldn't load page", err);
        Alert.alert('Star Launch', 'Unable to open the link.');
      });
    }
  };

  // const handleUnitChange = newUnit => {
  //   setAltitudeUnit(newUnit);
  //   setDropdownVisible(false);
  // };

  // const handleAngleUnitChange = newUnit => {
  //   setAngleUnit(newUnit);
  // };

  const handleSave = async () => {
    // Validate the fields
    if (!altitude || !angle || flightTime <= 0 || !flightDetails?.date || !flightDetails?.time || !flightDetails?.location) {
      Alert.alert(
        'Star Launch',
        'All fields are mandatory. Please make sure to fill in the altitude, angle, flight time, date, time, location',
        [{ text: 'OK' }]
      );
      return;
    }

    setLoading(true);

    try {
      const dataToSave = {
        date: flightDetails?.date,
        time: flightDetails?.time,
        location: flightDetails?.location,
        weather: flightDetails?.weather,
        droneId: flightDetails?.droneId,
        timeUnit: flightDetails?.timeUnit,
        droneMass: flightDetails?.droneMass,
        droneMassUnit: flightDetails?.droneMassUnit,
        flightTime,
        altitude,
        altitudeUnit,
        angle,
        angleUnit,
      };

      await database().ref('flights').push(dataToSave);
      Toast.show({
        type: 'success',
        text1: 'Flight details submitted successfully',
        position: 'top',
        topOffset: 100,
        text1Style: { fontSize: 16, fontWeight: 'bold' },
        onHide: () => { navigation.navigate('FlightDetails', { droneId: flightDetails.droneId }) }
      });
    } catch (error) {
      console.error('Error saving flight details:', error);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Headers
        title="Preference"
        showBackButton={true}
        showSettingsButton={true}
      />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Card Section */}
        <View style={styles.cardContainer}>
          {preferencesData.map((item, index) => (
            <View key={index} style={[styles.card, { backgroundColor: colors.containerBackground }]}>
              <TouchableOpacity
                style={styles.cardContent}
                onPress={() => handlePress(item.screen, item.url, item.label)}
              >
                <Image
                  source={item.icon}
                  style={[styles.cardIcon, { tintColor: colors.icon }]}
                />
                <Text style={[styles.cardLabel, { color: colors.text }]}>{item.label}</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* Altitude Field */}
        <View style={styles.detailsContainer}>
            <Dropdown
              icon={require('../../assets/dashboardicons/altitude.png')}
              label="Altitude"
              placeholder="Altitude"
              value={altitude}
              keyboardType="numeric"
              onChangeText={(text) => {
                console.log("text:", text);
                setAltitude(text);
              }}
              // keyboardType="numeric"
              unitWithDropdown={altitudeUnit}
              withDropdownIcon={require('../../assets/icons/dropdown_arrow.png')}
              options={['m', 'ft']}
              onChangeUnit={setAltitudeUnit}
            />
          {/* Angle Field */}
          <View style={styles.row}>
            <View style={styles.iconLabelContainer}>
              <Image
                source={require('../../assets/addDroneicons/angle.png')}
                style={[styles.icon, { tintColor: colors.icon }]}
              />
              <Text style={[styles.label, { color: colors.text }]}>Angle</Text>
            </View>
            <View style={styles.inputUnitWrapper}>
              <TextInput
                placeholder="Angle"
                placeholderTextColor={colors.inputText}
                value={angle}
                onChangeText={(text) => setAngle(text)}
                style={[styles.input, { color: colors.inputText }]}
                keyboardType="numeric"
              />
              <View>
                <Dropdown
                  // value={angleUnit}
                  unitWithDropdown={angleUnit}
                />
              </View>
            </View>
          </View>


          {/* Flight Time Field */}
          <View style={styles.row}>
            <View style={styles.iconLabelContainer}>
              <Image
                source={require('../../assets/icons/stopwatch.png')}
                style={[styles.icon, { tintColor: colors.icon }]}
              />
              <Text style={[styles.label, { color: colors.text }]}>Flight Time</Text>
            </View>
            <View style={styles.inputUnitWrapper}>
              <TextInput
                placeholder="Time"
                placeholderTextColor={colors.inputText}
                value={flightTime.toString()}
                onChangeText={(text) => setFlightTime(Number(text))}
                style={[styles.input, { color: colors.inputText }]}
                keyboardType="numeric"
              />
              <View>
                <Dropdown
                  unitWithDropdown="sec"

                />
              </View>
            </View>
          </View>

        </View>
      </ScrollView>
      <TouchableOpacity
        onPress={handleSave}
        style={[
          styles.submitButton,
          { backgroundColor: colors.submitBackground },
        ]}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.submitText} />
        ) : (
          <Text style={[styles.submitButtonText, { color: colors.submitText }]}>
            Save
          </Text>
        )}
      </TouchableOpacity>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 20,
  },
  cardContainer: {
    padding: 20,
    paddingTop: -10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '43%',
    height: 150,
    borderRadius: 15,
    marginBottom: 40,
    borderWidth: 0.5,
    borderColor: '#FFFFFF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardIcon: {
    width: 70,
    height: 70,
    marginBottom: 10,
  },
  cardLabel: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'DMSans-Regular',
    textAlign: 'center',
  },
  additionalContainer: {
    paddingHorizontal: 20,
    marginTop: -30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'DMSans-Regular',
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
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
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'DMSans-Regular',
  },
  inputUnitWrapper: {
    flexDirection: 'row',
    flex: 0.6,
    backgroundColor: '#E9E9E9',
    borderRadius: 10,
    overflow: 'visible',
    marginLeft: 80,
    height: 50,
    zIndex: 50
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: 'DMSans-Regular',
  },
  unitButton: {
    flexDirection: 'row',
    width: 60,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'DMSans-Regular',
  },
  dropdownIcon: {
    width: 18,
    height: 18,
    marginLeft: 4,
    marginTop: 5,
  },
  dropdown: {
    position: 'absolute',
    top: 50,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    zIndex: 1,
  },
  dropdownItem: {
    padding: 10,
    fontSize: 16,
    fontFamily: 'DMSans-Regular',
    color: '#000',
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
    paddingVertical: 20,
    marginTop: 20,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: 'DMSans-Regular',
  },
  buttonIcon: {
    width: 20,
    height: 20,
  },
  submitButton: {
    backgroundColor: 'white',
    paddingVertical: 15,
    margin: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButtonText: {
    color: '#000000CC',
    fontSize: 18,
    fontFamily: 'DMSans-Regular',
    fontWeight: '600',
  },
  loader: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -50 }, { translateY: -50 }],
  },
  detailsContainer: {
    padding: 20,
    zIndex: 0,
  },
});

export default Preferences;
