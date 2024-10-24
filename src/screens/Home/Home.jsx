import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTheme } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import { fetchDroneData } from '../../services/Firebase/FirebaseServices';
import { useSelector } from 'react-redux'; 
import ShareWithMe from '../../components/actionButton/ShareWithMe';
import Headers from '../../components/header/Headers';

const Dashboard = () => {
  const navigation = useNavigation();
  const [activeButton, setActiveButton] = useState('myDrones');
  const [drones, setDrones] = useState([]);
  const { colors } = useTheme();
  const user = useSelector((state) => state.auth.user);
  console.log(drones, "drones");

  useFocusEffect(
    React.useCallback(() => {
      const getDrones = async () => {
        if (user && user.uid) {
          const droneArray = await fetchDroneData(user.uid);
          setDrones(droneArray);
        } else {
          Alert.alert('Star Launch', 'No user is logged in');
        }
      };

      getDrones();
    }, [user])
  );

  const renderDroneItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('FlightDetails', { droneId: item.id, displayId: item.displayId, shared: true })}>
      <LinearGradient
        colors={['#ffffff10', '#ffffff30', '#ffffff20', '#ffffff30']}
        style={[styles.droneCard, { backgroundColor: colors.containerBackground }]}
        start={{ x: 0.2, y: 0.1 }}
        end={{ x: 1, y: 0.2 }}
      >
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <Text style={[styles.droneId, { color: colors.text }]}>
            {item.displayId} <Image source={require('../../assets/dashboardicons/verified.png')} style={styles.verified} />
            <Text style={[styles.droneName, { color: colors.text }]}>  {item.droneName}</Text>
          </Text>
        </View>

        {/* Card Details */}
        <View style={styles.cardDetails}>
          {/* Left Column */}
          <View style={styles.detailColumn}>
            <View style={styles.detailRow}>
              <Image source={require('../../assets/dashboardicons/flight-time.png')} style={[styles.icon, { tintColor: colors.icon }]} />
              <Text style={[styles.detailText, { color: colors.text }]}>{item.flightTime} sec</Text>
            </View>
            <View style={styles.detailRow}>
              <Image source={require('../../assets/dashboardicons/engine.png')} style={[styles.icon, { tintColor: colors.icon }]} />
              <Text style={[styles.detailText, { color: colors.text }]}>{item.motorType}</Text>
            </View>
            <View style={styles.detailRow}>
              <Image source={require('../../assets/dashboardicons/altitude.png')} style={[styles.icon, { tintColor: colors.icon }]} />
              <Text style={[styles.detailText, { color: colors.text }]}>{item.altitude} {item.altitudeUnit}</Text>
            </View>
          </View>

          {/* Right Column */}
          <View style={styles.detailColumn}>
            <View style={styles.detailRow}>
              <Image source={require('../../assets/dashboardicons/last-flight-date.png')} style={[styles.icon, { tintColor: colors.icon }]} />
              <Text style={[styles.detailText, { color: colors.text }]}>
                {new Date(item.createdAt).getDate().toString().padStart(2, '0') + '-' +
                  (new Date(item.createdAt).getMonth() + 1).toString().padStart(2, '0') + '-' +
                  new Date(item.createdAt).getFullYear()}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Image source={require('../../assets/dashboardicons/mass.png')} style={[styles.icon, { tintColor: colors.icon }]} />
              <Text style={[styles.detailText, { color: colors.text }]}>{item.mass} {item.massUnit}</Text>
            </View>
            <View style={styles.detailRow}>
              <Image source={require('../../assets/addDroneicons/angle.png')} style={[styles.icon, { tintColor: colors.icon }]} />
              <Text style={[styles.detailText, { color: colors.text }]}>{item.launchAngle} deg</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <Headers title="STAR LAUNCH" />

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: activeButton === 'myDrones' ? colors.activeButtonBackground : colors.inactiveButtonBackground },
          ]}
          onPress={() => setActiveButton('myDrones')}
        >
          <Text style={{ color: activeButton === 'myDrones' ? colors.activeButtonText : colors.inactiveButtonText }}>
            Rocket
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            { backgroundColor: activeButton === 'shareWithMe' ? colors.activeButtonBackground : colors.inactiveButtonBackground },
          ]}
          onPress={() => setActiveButton('shareWithMe')}
        >
          <Text style={{ color: activeButton === 'shareWithMe' ? colors.activeButtonText : colors.inactiveButtonText }}>
            Share with me
          </Text>
        </TouchableOpacity>
      </View>

      {/* Drone List */}
      {activeButton === 'myDrones' ? (
        drones.length > 0 ? (
          <FlatList
            data={drones}
            renderItem={renderDroneItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.droneList}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.noDronesTextContainer}>
            <Text style={[styles.noDronesText, { color: colors.text }]}>No Rocket exist, add a new Rocket</Text>
          </View>
        )
      ) : (
        <ShareWithMe />
      )}


      {/* Floating Action Button */}
      <TouchableOpacity style={[styles.fab, { backgroundColor: colors.submitBackground }]} onPress={() => navigation.navigate('AddDrone')}>
        <Image source={require('../../assets/dashboardicons/plus.png')} style={[styles.plusicon, { tintColor: colors.plusColor }]} />
      </TouchableOpacity>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F2452',
    marginBottom: 100
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 40,
    borderRadius: 10
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    color: 'white',
    paddingTop: 10,
    fontSize: 24,
    fontFamily: 'DMSans-Regular',
    fontWeight: '700',
  },
  settingIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    borderRadius: 10
  },
  icon: {
    width: 26,
    height: 26,
    marginRight: 10,
  },
  plusicon: {
    width: 26,
    height: 26,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    marginTop: 16,
    paddingHorizontal: 20,
  },
  actionButton: {
    backgroundColor: 'white',
    paddingVertical: 10,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },

  shareButton: {
    backgroundColor: '#3A506B',
  },
  buttonText: {
    color: '#0F2452',
    fontSize: 16,
    fontFamily: 'DMSans-Regular',
  },
  activeButton: {
    backgroundColor: 'white',
    color: '#FFF',
  },
  inactiveButton: {
    backgroundColor: '#FFFFFF40',
    color: '#0F2452',
  },
  activeButtonText: {
    color: '#0F2452',
    fontFamily: 'DMSans-Regular',
  },
  inactiveButtonText: {
    color: 'white',
    fontFamily: 'DMSans-Regular',
  },
  verified: {
    height: 20,
    width: 20,
  },
  droneList: {
    paddingHorizontal: 20,
  },
  droneCard: {
    borderRadius: 15,
    padding: 16,
    paddingVertical: 6,
    marginVertical: 10,
    marginTop: 12,
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderWidth: 0.5,
    borderColor: 'white',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  droneId: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'DMSans-Regular',
    fontWeight: '300',
  },
  droneName: {
    color: 'white',
    fontSize: 18,
    fontFamily: 'DMSans-Regular',
    fontWeight: '500',
  },
  cardDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailColumn: {
    flexDirection: 'column',
  },
  droneDetails: {
    marginTop: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  detailText: {
    color: 'white',
    fontFamily: 'DMSans-Regular',
    fontSize: 18,
  },
  fab: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    backgroundColor: 'white',
    width: 65,
    height: 65,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#818589',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.9,
    shadowRadius: 3.84,
    elevation: 5,
  },
  noDronesTextContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  noDronesText: {
    fontSize: 18,
    textAlign: 'center',
  },
});

export default Dashboard;
