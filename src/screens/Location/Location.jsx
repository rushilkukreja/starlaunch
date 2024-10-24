import React, { useEffect, useState, } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  Dimensions,
  Alert,
  PermissionsAndroid,
  Platform,
  ActivityIndicator
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '@react-navigation/native';
import Headers from '../../components/header/Headers';
import GetLocation from 'react-native-get-location';
import MapView, { Marker } from 'react-native-maps';
import database from '@react-native-firebase/database';
import Geocoder from 'react-native-geocoding';
import { getDistance } from 'geolib';
import { useLocation } from '../../Context/LocationContext';
import { ScrollView } from 'react-native-gesture-handler';
import NoInternetScreen from '../../components/network/NoInternetScreen';

const screenWidth = Dimensions.get('window').width;

const Location = ({ navigation }) => {
  const { colors } = useTheme();
  const [locations, setLocations] = useState([]);
  const [region, setRegion] = useState(null);
  const [nearbyLocations, setNearbyLocations] = useState([]);
  const { userLocation, setUserLocation } = useLocation();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    Geocoder.init('AIzaSyAzcg5qXAaIopGlZwLb4mEjd64SaFjGlWk', { language: 'en' });
    requestLocationPermission().then(granted => {
      if (granted) {
        getCurrentLocation();
      }
    });
  }, []);
  useEffect(() => {
    if (userLocation.latitude && userLocation.longitude && locations.length === 0) {
      fetchLocations();
    }
  }, [userLocation]);

  const fetchLocations = async () => {
    if (locations.length > 0) {
      return;
    }
    // setIsLoading(true);
    try {
      const snapshot = await database().ref('/locations').once('value');
      const locationData = snapshot.val() || [];
      console.log(locationData)

      const processedLocations = await Promise.all(
        locationData.map(async (loc, index) => {
          let latitude = 0;
          let longitude = 0;

          const locationString = `${loc.Name || ''} ${loc.Location || ''}`;

          try {
            const geoResponse = await Geocoder.from(locationString);
            const { lat, lng } = geoResponse.results[0].geometry.location;
            latitude = lat;
            longitude = lng;
          } catch (error) {
            console.log(`Error geocoding ${locationString}:`, error);
          }
          setIsLoading(false)
          return {
            id: index,
            Code: loc.Code || 'Not applicable',
            Location: loc.Location || 'Not applicable',
            Name: loc.Name || 'Not applicable',
            PhoneNumber: loc['Phone Number'] || 'Not applicable',
            Website: loc.Website || 'Not applicable',
            latitude,
            longitude,
          };
        }),
      );

      setLocations(processedLocations);

      // Filter nearby locations within 5 kilometers
      const nearby = processedLocations.filter(location => {
        // setIsLoading(true);
        if (userLocation.latitude && userLocation.longitude) {
          const distance = getDistance(
            { latitude: userLocation.latitude, longitude: userLocation.longitude },
            { latitude: location.latitude, longitude: location.longitude }
          );
          return distance <= 90000;
        }
        return false;
      });

      setNearbyLocations(nearby);
      console.log(nearby, 'nearby');

      setIsLoading(false);

      // Set the region to include all markers
      if (processedLocations.length > 0) {
        const latitudes = processedLocations.map(location => location.latitude);
        const longitudes = processedLocations.map(location => location.longitude);

        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);
        const minLng = Math.min(...longitudes);
        const maxLng = Math.max(...longitudes);

        const centerLat = (minLat + maxLat) / 2;
        const centerLng = (minLng + maxLng) / 2;

        setRegion({
          latitude: centerLat,
          longitude: centerLng,
          latitudeDelta: (maxLat - minLat) * 1.5,
          longitudeDelta: (maxLng - minLng) * 1.5,
        });
      } else if (userLocation.latitude && userLocation.longitude) {
        setRegion({
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.log('Error fetching locations:', error);
    } finally {
      // setIsLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const location = await GetLocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
      });
      console.log(location, '@@@@@@@@@@@@@@@@@');
      setUserLocation({
        latitude: location.latitude,
        longitude: location.longitude,
      });

      // After getting user location, fetch the locations
      fetchLocations();
    } catch (error) {
      console.log('Error getting current location:', error);
      Alert.alert('Star Launch', 'Unable to fetch your location. Please try again.');
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

  console.log(isLoading, 'isLoading');
  // if (isLoading) {
  //   return <NoInternetScreen />;
  // }
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {isLoading ? (
        <ActivityIndicator size="large" color="red" style={styles.loadingIndicator} />
      ) : (
        <>
          <Headers title="Location" />
          <TouchableOpacity onPress={() => navigation.navigate('SearchLocation')}>
            <View
              style={[
                styles.searchBar,
                { backgroundColor: colors.containerBackground },
              ]}>
              <Image
                source={require('../../assets/icons/searchLocation.png')}
                style={[styles.searchIcon, { tintColor: colors.icon }]}
              />
              <TextInput
                onPress={() => navigation.navigate('SearchLocation')}
                style={[styles.input, { color: colors.inputText }]}
                placeholder="Enter Locations"
                placeholderTextColor="#B0B0B0"
                pointerEvents="box-none"
              />
            </View>
          </TouchableOpacity>
          <View style={styles.mapContainer}>
            <MapView
              style={styles.map}
              region={region}
              onRegionChangeComplete={(region) => setRegion(region)}>
              {userLocation.latitude && userLocation.longitude && (
                <Marker
                  coordinate={userLocation}
                  title="Your Location"
                  description="This is your current location"
                  pinColor="blue"
                />
              )}
              {locations.map((location) => (
                <Marker
                  key={location.id}
                  coordinate={{
                    latitude: location.latitude || 0,
                    longitude: location.longitude || 0,
                  }}
                  title={location.Name}
                  description={location.Website}
                />
              ))}
            </MapView>
          </View>
          <LinearGradient
            colors={['#ffffff40', '#ffffff20', '#ffffff40', '#ffffff30']}
            style={[
              styles.nearbyCard,
              { backgroundColor: colors.containerBackground },
            ]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.nearbyTitle, { color: colors.text }]}>Nearby</Text>
              {nearbyLocations.length > 0 ? (
                nearbyLocations.map((location) => (
                  <View key={location.id} style={styles.suggestionItem}>
                    <Image
                      source={require('../../assets/icons/nearby.png')}
                      style={[styles.suggestionIcon, { tintColor: colors.icon }]}
                    />
                    <Text style={[styles.suggestionText, { color: colors.text }]}>
                      {location.Name || 'Unknown Location'}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={[styles.suggestionText, { color: colors.text }]}>
                  No nearby locations found within 5 kilometers.
                </Text>
              )}
            </ScrollView>
          </LinearGradient>
        </>
      )}
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F2452',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  settingIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    tintColor: '#FFFFFF',
    borderRadius: 12,
  },
  headerText: {
    fontFamily: 'DMSans-Regular',
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    flex: 1,
    marginLeft: 10,
    marginRight: 10,
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
    fontFamily: 'DMSans-Regular',
    color: '#FFFFFF',
  },
  mapContainer: {
    width: '90%',
    height: 270,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    marginHorizontal: 20,
    overflow: 'hidden',
    borderRadius: 10,
  },
  map: {
    width: '100%',
    borderRadius: 10,
    height: 270,
    marginVertical: 20,
    marginHorizontal: 20,
    overflow: 'hidden',
    width: screenWidth - 40,
  },
  nearbyCard: {
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#FFFFFF10',
    paddingHorizontal: 30,
    height: 220,
    marginBottom: 60,
  },
  nearbyTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '600',
    fontFamily: 'DMSans-Regular',
    marginBottom: 10,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  suggestionIcon: {
    width: 20,
    height: 20,
    tintColor: '#FFFFFF',
    marginRight: 10,
  },
  suggestionText: {
    fontFamily: '',
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'DMSans-Regular',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent background
  },
});

export default Location;
