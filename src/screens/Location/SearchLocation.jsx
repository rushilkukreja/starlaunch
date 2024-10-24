import React, { useState, useEffect } from 'react';
import { View, TextInput, Image, StyleSheet, TouchableOpacity, FlatList, Text, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme, useNavigation } from '@react-navigation/native';
import Headers from '../../components/header/Headers';
import database from '@react-native-firebase/database'; // Firebase Realtime Database
import Geocoder from 'react-native-geocoding'; // For converting location names to lat/long
import { getDistance } from 'geolib'; // For distance calculation
import GetLocation from 'react-native-get-location'; // For getting user's location

// Initialize Geocoder with your Google API Key
Geocoder.init('AIzaSyAzcg5qXAaIopGlZwLb4mEjd64SaFjGlWk'); // Replace with your Google API Key

const SearchLocation = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [allLocations, setAllLocations] = useState([]); // Store all locations for displaying without typing

  // Fetch user's current location
  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        const location = await GetLocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 15000,
        });
        console.log('User Location:', location);
        setUserLocation({
          latitude: location.latitude,
          longitude: location.longitude,
        });
      } catch (error) {
        console.error("Error fetching user location: ", error);
      }
    };

    fetchUserLocation();
  }, []);

  // Function to convert location names to lat/long using Geocoder
  const getLatLngFromLocation = async (locationName) => {
    setIsLoading(true);
    try {
      const geoResult = await Geocoder.from(locationName);
      console.log('Geocoder Result:', geoResult);
      const { lat, lng } = geoResult.results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    } catch (error) {
      console.log("Error converting location to lat/long:", error);
      return null;
    } finally {
      setIsLoading(false); // Hide loader after fetching
    }
  };

  // Fetch all locations once on component mount
  useEffect(() => {
    const fetchAllLocations = async () => {
      try {
        const snapshot = await database().ref('/locations').once('value');
        const data = snapshot.val();

        const locationsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key],
        }));

        console.log(locationsArray, 'All Locations:'); // Debugging
        setAllLocations(locationsArray); // Store all locations

        // Automatically fetch suggestions when all locations are loaded
        const dataSuggestions = await fetchLocationSuggestions(inputValue);
        setSuggestions(dataSuggestions);
      } catch (error) {
        console.error("Error fetching all locations:", error);
      }
    };

    fetchAllLocations();
  }, []);

  // Filter locations based on input value
  const fetchLocationSuggestions = async (query) => {
    try {
      if (query === '') {
        // If input is empty, show all locations
        return allLocations;
      }

      const filteredSuggestions = allLocations.filter(item =>
        item.Name.toLowerCase().startsWith(query.toLowerCase()) || // Check if Name starts with the query
        item.Location.toLowerCase().startsWith(query.toLowerCase()) // Check if Location starts with the query
      );

      console.log('Filtered Suggestions:', filteredSuggestions); // Debugging

      if (userLocation) {
        const nearbySuggestions = [];

        // Convert each filtered suggestion's location to lat/long
        for (const item of filteredSuggestions) {
          const latLng = await getLatLngFromLocation(item.Location); // Get lat/long using Geocoder
          if (latLng) {
            const distance = getDistance(
              { latitude: userLocation.latitude, longitude: userLocation.longitude },
              latLng
            );
            if (distance <= 500000000) { // 50km = 50000 meters
              nearbySuggestions.push(item); // Only add places within 50km
            }
          }
        }

        console.log('Nearby Suggestions:', nearbySuggestions); // Debugging
        return nearbySuggestions;
      }

      return filteredSuggestions;
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      return [];
    }
  };

  // Fetch suggestions based on input value
  useEffect(() => {
    const fetchSuggestions = async () => {
      setIsLoading(true); // Show loader while fetching
      const data = await fetchLocationSuggestions(inputValue);
      console.log('Suggestions:', data);
      setSuggestions(data);
      setIsLoading(false); // Hide loader after fetching
    };

    fetchSuggestions();
  }, [inputValue, userLocation]); // Re-run when user location or input changes

  // Handle suggestion selection
  // Handle suggestion selection
  const handleSelectSuggestion = async (item) => {
    const latLng = await getLatLngFromLocation(item.Location); // Get lat/long using Geocoder
   console.log('latLng:', latLng, 'item:', item,"jhhh");
   
    if (latLng) {
      const displayText = `${item.Name} (${item.Location})`;
      // setSuggestions([]); // Clear suggestions
      // Navigate to LocationDetails screen, passing the clicked item's data along with lat/long
      navigation.navigate('LocationDetails', {
        locationData: item,
        latitude: latLng.latitude,
        longitude: latLng.longitude,
      });
    }
  };


  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Fixed Header */}
      <Headers title="Search Location" showBackButton={true} />

      {/* Search Bar */}
      <TouchableOpacity>
        <View style={[styles.searchBar, { backgroundColor: colors.containerBackground }]}>
          <Image source={require('../../assets/icons/searchLocation.png')} style={[styles.searchIcon, { tintColor: colors.icon }]} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Type location"
            placeholderTextColor="#B0B0B0"
            value={inputValue}
            onChangeText={setInputValue}
            onFocus={() => setSuggestions(allLocations)} // Show all locations when search bar is focused
          />
        </View>
      </TouchableOpacity>

      {/* Suggestions List */}
      {inputValue.length >= 0 ? (
        isLoading ? (
          <ActivityIndicator
            size="large"
            color={colors.icon}
            style={styles.loader}
          />
        ) : (
          <LinearGradient
            colors={['#ffffff40', '#ffffff20']}
            style={[styles.suggestionsContainer, { backgroundColor: colors.containerBackground }]}
          >
            {suggestions.length > 0 ? (
              <FlatList
                data={suggestions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => handleSelectSuggestion(item)}>
                    <LinearGradient
                      colors={['#ffffff40', '#ffffff20']}
                      style={[styles.suggestionItem]}
                    >
                      <View style={styles.suggestionIconContainer}>
                        <Image
                          source={require('../../assets/icons/nearby.png')}
                          style={[styles.suggestionIcon, { tintColor: colors.icon }]}
                        />
                        <View style={styles.suggestionTextContainer}>
                          <Text style={[styles.suggestionText, { color: colors.text }]}>{item.Name}</Text>
                          <Text style={[styles.suggestionSubText, { color: colors.text }]}>{item.Location}</Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                )}
                style={styles.suggestionList}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <Text style={[styles.noSuggestionsText, { color: colors.text }]}>No locations found</Text>
            )}
          </LinearGradient>
        )
      ) : (
        <Text style={[styles.placeholderText, { color: colors.text }]}>Enter location</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F2452',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF30',
    borderRadius: 10,
    paddingLeft: 15,
    height: 50,
  },
  searchIcon: {
    width: 20,
    height: 26,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#FFFFFF',
  },
  suggestionsContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#FFFFFF10',
  },
  suggestionIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
    marginRight: 10,
    marginTop: 7,
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  suggestionList: {
    marginHorizontal: 20,
    marginTop: 10,
  },
  suggestionItem: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  suggestionIconContainer: {
    flexDirection: 'row',
  },
  suggestionTextContainer: {
    flex: 1,
  },
  suggestionText: {
    color: '#FFFFFF',
    fontFamily: 'DMSans-Regular',
    fontSize: 18,
    fontWeight: 'bold',
  },
  suggestionSubText: {
    color: '#FFFFFF',
    fontFamily: 'DMSans-Regular',
    fontSize: 14,
  },
  noSuggestionsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  placeholderText: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: "80%",
  },
});

export default SearchLocation;
