import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSelector } from 'react-redux';
import { useFocusEffect, useTheme } from '@react-navigation/native';
import Headers from '../../components/header/Headers';
import { useNavigation, useRoute } from '@react-navigation/native';
import FlightCard from './FlightCard';
// import { fetchDroneById, fetchUserById, fetchFlightsByDroneId } from '../../services/Firebase/FirebaseServices';
import DroneSharing from '../../components/share/DroneSharing';
import database from '@react-native-firebase/database';

const FlightDetails = () => {
  const user = useSelector((state) => state.auth.user);
  const { colors } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const { droneId, displayId, shared } = route.params;

  const [ownerName, setOwnerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [droneDetails, setDroneDetails] = useState(null);
  const [flights, setFlights] = useState([]);
  const [shareModalVisible, setShareModalVisible] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      const droneDetailsRef = database().ref(`/drones/${droneId}`);
      const onValueChange = droneDetailsRef.on('value', snapshot => {
        if (snapshot.exists()) {
          const drone = snapshot.val();
          setDroneDetails({id: droneId, ...drone});

          // Fetch and set owner name if available
          if (drone.userId) {
            fetchUserById(drone.userId).then(userDetails => {
              if (userDetails) {
                setOwnerName(userDetails.displayName || 'Unknown');
              }
            });
          }
        } else {
          setDroneDetails(null);
        }
        setLoading(false);
      });

      // Fetch flight details related to the drone
      const flightDetailsRef = database().ref(`/flights`);
      flightDetailsRef.on('value', snapshot => {
        if (snapshot.exists()) {
          const allFlights = snapshot.val() || {};
          const filteredFlights = Object.entries(allFlights)
            .filter(([_, flight]) => flight.droneId === droneId)
            .map(([id, flight]) => ({ id, ...flight }))
            .reverse();
      
          setFlights(filteredFlights);
        } else {
          setFlights([]);
        }
      });

      // Cleanup listeners
      return () => {
        droneDetailsRef.off('value', onValueChange);
        flightDetailsRef.off('value');
      };
    }, [droneId]),
  );

  const fetchUserById = async userId => {
    try {
      const snapshot = await database().ref(`/users/${userId}`).once('value');
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
      </View>
    );
  }

  if (!droneDetails) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={{ color: colors.text }}>No Drone Details Found</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with back button */}
      <Headers title="Flight Details" showBackButton={true} />

      {/* Main Top Card */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.mainCard, { backgroundColor: colors.submitBackground }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.droneId, { color: colors.submitText }]}>
              {displayId}
              <Image source={require('../../assets/dashboardicons/verified.png')} style={styles.verified} />
              <Text style={[styles.droneName, { color: colors.submitText }]} numberOfLines={1} ellipsizeMode="tail">
                {droneDetails.droneName.length > 15 ? `${droneDetails.droneName.substring(0, 15)}...` : droneDetails.droneName}
              </Text>
            </Text>
            <View style={styles.iconContainer}>
              {shared && (
                <TouchableOpacity onPress={() => navigation.navigate('EditDrone', { droneId: droneId, id: droneDetails.id })}>
                  <Image source={require('../../assets/icons/edit.png')} style={[styles.topIcon, { tintColor: colors.FlightDetailIcons }]} />
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={() => setShareModalVisible(true)}>
                <Image source={require('../../assets/icons/share.png')} style={[styles.topIcon, { tintColor: colors.FlightDetailIcons }]} />
              </TouchableOpacity>
              <DroneSharing
                modalVisible={shareModalVisible}
                setModalVisible={setShareModalVisible}
                droneId={droneId}
                userId={user.uid}
              />
            </View>
          </View>

          <View style={styles.cardDetails}>
            <View style={styles.detailColumn}>
              <View style={styles.detailRow}>
                <Image source={require('../../assets/shareWithMe/owner.png')} style={[styles.icon, { tintColor: colors.FlightDetailIcons }]} />
                <Text style={[styles.detailText, { color: colors.submitText }]} numberOfLines={1} ellipsizeMode="tail">
                  {ownerName.length > 15 ? `${ownerName.substring(0, 15)}...` : ownerName}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Image source={require('../../assets/dashboardicons/engine.png')} style={[styles.icon, { tintColor: colors.FlightDetailIcons }]} />
                <Text style={[styles.detailText, { color: colors.submitText }]}>{droneDetails.motorType || 'N/A'}</Text>
              </View>
              <View style={styles.detailRow}>
                <Image source={require('../../assets/dashboardicons/altitude.png')} style={[styles.icon, { tintColor: colors.FlightDetailIcons }]} />
                <Text style={[styles.detailText, { color: colors.submitText }]}>{droneDetails.altitude} {droneDetails.altitudeUnit}</Text>
              </View>
            </View>
            <View style={styles.detailColumn}>
              <View style={styles.detailRow}>
                <Image source={require('../../assets/dashboardicons/last-flight-date.png')} style={[styles.icon, { tintColor: colors.FlightDetailIcons }]} />
                <Text style={[styles.detailText, { color: colors.submitText }]}>
                  {new Date(droneDetails.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Image source={require('../../assets/dashboardicons/mass.png')} style={[styles.icon, { tintColor: colors.FlightDetailIcons }]} />
                <Text style={[styles.detailText, { color: colors.submitText }]}>{droneDetails.mass} {droneDetails.massUnit}</Text>
              </View>
              <View style={styles.detailRow}>
                <Image source={require('../../assets/dashboardicons/flight-time.png')} style={[styles.icon, { tintColor: colors.FlightDetailIcons }]} />
                <Text style={[styles.detailText, { color: colors.submitText }]}>{droneDetails.flightTime} sec</Text>
              </View>
            </View>
          </View>
        </View>

        {flights.length > 0 &&
          flights.map((flight, index) => (
            <FlightCard
              key={flight.id}
              flightId={`#${String(index + 1).padStart(2, '0')}`}
              date={flight.date}
              time={flight.time}
              location={flight.location}
              windSpeed={flight.weather?.wind?.speed}
              windDeg={flight.weather?.wind?.deg}
              duration={flight.flightTime}
              altitude={flight.altitude}
              timeUnit={flight.timeUnit}
              altitudeUnit={flight.altitudeUnit}
              weather={flight.weather}
              droneId={droneId}
              flightUid={flight.id}
              angle={flight.angle}
              flightTime={flight.flightTime}
            />
          ))}
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.submitBackground }]} onPress={() => navigation.navigate('AddFlight', { droneId: droneId, droneDetails })}>
        <Image source={require('../../assets/dashboardicons/plus.png')} style={[styles.plusicon, { tintColor: colors.plusColor }]} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loader: {
    marginTop: "80%"
  },
  mainCard: {
    borderRadius: 15,
    padding: 16,
    paddingVertical: 6,
    marginVertical: 10,
    marginTop: 12,
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderColor: 'white',
    margin: 20

  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  droneId: {
    fontSize: 18,
    fontWeight: '300',
    fontFamily: 'DMSans-Regular',
  },
  droneName: {
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'DMSans-Regular',
    numberOfLines: 1,
    ellipsizeMode: "tail"

  },
  iconContainer: {
    flexDirection: 'row',
  },
  topIcon: {
    width: 22,
    height: 22,
    margin: 10,
    marginLeft: 10,
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginRight: 10,
  },
  detailColumn: {
    flexDirection: 'column',
    width: "48%",
    marginHorizontal: "2%"
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  detailText: {
    fontSize: 18,
    fontFamily: 'DMSans-Regular',
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  verified: {
    width: 20,
    height: 20,
  },
  fab: {
    position: 'absolute',
    bottom: 60,
    right: 20,
    backgroundColor: 'white',
    width: 65,
    height: 65,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusicon: {
    width: 26,
    height: 26,
  },
});

export default FlightDetails;
