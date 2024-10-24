import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@react-navigation/native';
import Headers from '../../components/header/Headers'; // Assuming you're using a custom header component
import LinearGradient from 'react-native-linear-gradient'; // Ensure this is imported
import MapView, { Marker } from 'react-native-maps';

const LocationDetails = ({ route, navigation }) => {
  const { colors } = useTheme();
  const { locationData, latitude, longitude } = route.params;
  console.log('locationData:', locationData);
  

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Header */}
      <Headers title="Location Details" showBackButton={true} />

      <ScrollView contentContainerStyle={styles.content}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: latitude,
            longitude: longitude,
            latitudeDelta: 0.005, // Adjust for zoom level
            longitudeDelta: 0.005, // Adjust for zoom level
          }}
        >
          <Marker coordinate={{ latitude, longitude }} title={locationData.Name} />
        </MapView>
        {/* Display Location Details in a Card */}
        <LinearGradient
          colors={['#ffffff10', '#ffffff30', '#ffffff20', '#ffffff30']} // Customize gradient colors as needed
          style={[styles.gradientCard]}
          start={{ x: 0.3, y: 0.1 }}
          end={{ x: 1, y: 0.2 }}
        >
          <View style={[styles.card]}>
            {/* Display Location Name */}
            <Text style={[styles.name, { color: colors.text }]}>{locationData.Name}</Text>

            {/* Display Location Address */}
            <Text style={[styles.address, { color: colors.text }]}>Address: {locationData.Location}</Text>

            {/* Additional details in a card view */}
            <View style={styles.detailsContainer}>
              <Text style={[styles.detailLabel, { color: colors.text }]}>Phone Number:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{locationData['Phone Number'] || 'Not available'}</Text>
              <Text style={[styles.detailLabel, { color: colors.text }]}>Website:</Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>{locationData.Website || 'Not available'}</Text>
            </View>

            {/* Optional: Display more information if available */}
            {locationData.Description && (
              <View style={styles.additionalInfo}>
                <Text style={[styles.detailLabel, { color: colors.text }]}>Description:</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{locationData.Description}</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Map View */}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  gradientCard: {
    borderRadius: 10,
    marginVertical: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  card: {
    padding: 20,
    borderRadius: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  address: {
    fontSize: 18,
    marginBottom: 16,
  },
  detailsContainer: {
    marginVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  detailValue: {
    fontSize: 16,
    marginBottom: 8,
  },
  additionalInfo: {
    marginTop: 16,
  },
  map: {
    height: 300, // Set height for the map
    marginTop: 20, // Add margin for spacing
    marginHorizontal: 10,
  },
});

export default LocationDetails;
