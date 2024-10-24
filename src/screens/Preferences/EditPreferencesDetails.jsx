import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme, useNavigation } from '@react-navigation/native';
import Headers from '../../components/header/Headers';
import LocationBar from '../Location/LocationBar';
import WeatherCard from '../../components/weatherCard/WeatherCard';

const EditPreferencesDetails = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  // State for the date picker
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formattedDate, setFormattedDate] = useState('    _ _ / _ _ / _ _ _ _');

  // State for the time picker
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [formattedTime, setFormattedTime] = useState('  _ _ : _ _');
  const [timeUnit, setTimeUnit] = useState('am');

  // Function to handle date selection
  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(false);
    setDate(currentDate);
    const formatted = `${('0' + currentDate.getDate()).slice(-2)}/${('0' + (currentDate.getMonth() + 1)).slice(-2)}/${currentDate.getFullYear()}`;
    setFormattedDate(formatted);
  };

  // Function to handle time selection
  const onTimeChange = (event, selectedTime) => {
    const currentTime = selectedTime || date;
    setShowTimePicker(false);
    const hours = ('0' + currentTime.getHours()).slice(-2);
    const minutes = ('0' + currentTime.getMinutes()).slice(-2);
    setFormattedTime(`${hours}:${minutes}`);
  };

  // Data array for dynamic mapping
  const detailsData = [
    {
      icon: require('../../assets/dashboardicons/last-flight-date.png'),
      label: 'Date',
      placeholder: formattedDate,
      unit: null,  // No unit for Date field  
      isDateField: true, // Add flag to identify the date field
    },
    {
      icon: require('../../assets/dashboardicons/flight-time.png'),
      label: 'Time',
      placeholder: formattedTime,
      unit: timeUnit,
      hasDropdown: true, // Time picker
      isTimeField: true, // Add flag to identify the time field
    },
    {
      icon: require('../../assets/dashboardicons/mass.png'),
      label: 'Drone Mass',
      placeholder: 'Mass',
      unit: 'g',
    },
    {
      icon: require('../../assets/dashboardicons/altitude.png'),
      label: 'Altitude',
      placeholder: 'Altitude',
      unit: 'm', 
    },
    {
      icon: require('../../assets/addDroneicons/angle.png'),
      label: 'Angle',
      placeholder: 'Angle',
      unit: 'deg',
    },
    {
      icon: require('../../assets/dashboardicons/flight-time.png'),
      label: 'Flight Time',
      placeholder: 'Time',
      unit: 'S',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Headers title="Edit Details" showBackButton={false} hideLeft={true} />
      <LocationBar placeholder={"Location"} />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.detailsContainer}>
          {detailsData.map((item, index) => (
            <View key={index} style={styles.row}>
              <View style={styles.iconLabelContainer}>
                <Image source={item.icon} style={[styles.icon, { tintColor: colors.icon }]} />
                <Text style={[styles.label, { color: colors.text }]}>{item.label}</Text>
              </View>

              <View style={!item.unit ? [styles.inputWrapper, { backgroundColor: colors.dateInputContainer }] : styles.inputUnitWrapper}>
                {item.isDateField ? (
                  <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateInput}>
                    <Text style={[styles.dateText, { color: colors.inputText }]}>{formattedDate}</Text>
                  </TouchableOpacity>
                ) : item.isTimeField ? (
                  <TouchableOpacity onPress={() => setShowTimePicker(true)} style={styles.dateInput}>
                    <Text style={[styles.dateText, { color: colors.inputText }]}>{formattedTime}</Text>
                  </TouchableOpacity>
                ) : (
                  <TextInput
                    placeholder={item.placeholder}
                    placeholderTextColor={colors.inputText}
                    style={[styles.input, { color: colors.inputText }]}
                  />
                )}

                {item.unit && (
                  <TouchableOpacity style={[styles.unitButton, { backgroundColor: colors.unitbackground }]}>
                    <Text style={styles.unitText}>{item.unit}</Text>
                    {item.hasDropdown && (
                      <Image
                        source={require('../../assets/icons/dropdown.png')}
                        style={styles.dropdownIcon}
                      />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>

        {/* Display the DateTimePicker when triggered */}
        {showDatePicker && (
          <DateTimePicker
            testID="dateTimePicker"
            value={date}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        {/* Display the TimePicker when triggered */}
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

        <WeatherCard />
      </ScrollView>

      {/* Submit Button */}
      <TouchableOpacity onPress={() => navigation.navigate('Preferences')} style={[styles.submitButton, { backgroundColor: colors.submitBackground }]}>
        <Text style={[styles.submitButtonText, { color: colors.submitText }]}>Save</Text>
      </TouchableOpacity>
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
    fontWeight: 'bold',
  },
  inputWrapper: {
    flex: 0.6,
    borderRadius: 10,
    marginLeft: 80,
    height: 50,
  },
  inputUnitWrapper: {
    flexDirection: 'row',
    flex: 0.6,
    backgroundColor: '#E9E9E9',
    borderRadius: 10,
    overflow: 'hidden',
    marginLeft: 80,
    height: 50,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
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
    fontFamily: 'DMSans-Regular',
    fontWeight: 'bold',
  },
  dropdownIcon: {
    width: 18,
    height: 18,
    marginLeft: 4,
    marginTop: 5,
  },
  dateInput: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    height: 50,
    backgroundColor: '#E9E9E9',
    borderRadius: 10,
  },
  dateText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
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
});

export default EditPreferencesDetails;
