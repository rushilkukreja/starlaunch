import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Image, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import database from '@react-native-firebase/database';
import { fetchSharedDroneDetails } from '../../services/Firebase/FirebaseServices';

const ShareWithMe = () => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    const [sharedDrones, setSharedDrones] = useState([]);
    const userEmail = useSelector((state) => state.auth.user.email);
    console.log(userEmail, 'userEmail');

    useEffect(() => {
        const fetchSharedDrones = async () => {
            try {
                const sharedDronesRef = database().ref('/sharedDrones');
                sharedDronesRef.on('value', async (snapshot) => {
                    if (snapshot.exists()) {
                        const allSharedDrones = snapshot.val();
                        const filteredSharedDrones = Object.values(allSharedDrones).filter(
                            (sharedDrone) => sharedDrone.sharedWith === userEmail
                        );
                        const detailedDrones = await fetchSharedDroneDetails(filteredSharedDrones, userEmail);
                        setSharedDrones(detailedDrones);
                    } else {
                        setSharedDrones([]);
                    }
                });

                return () => sharedDronesRef.off('value');
            } catch (error) {
                console.log('Error fetching shared drones:', error);
            }
        };

        fetchSharedDrones();
    }, [userEmail]);


    console.log(sharedDrones, 'sharedDrones');


    const renderDroneItem = ({ item }) => (
        <TouchableOpacity onPress={() => navigation.navigate('FlightDetails', { droneId: item.id, displayId: item.displayId, shared: item.accessType })} >
            <LinearGradient
                colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.3)']}
                style={[
                    styles.droneCard,
                    { backgroundColor: colors.containerBackground }
                ]}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
            >
                <View style={styles.cardHeader}>
                    <Text style={[styles.droneId, { color: colors.text }]}>
                        {item.displayId}
                        <Image source={require('../../assets/shareWithMe/star.png')} style={styles.verifiedIcon} />
                        <Text style={[styles.droneName, { color: colors.text }]}>  {item.droneName}</Text>
                    </Text>
                </View>

                {/* Card Details */}
                <View style={styles.cardDetails}>
                    {/* Left Column */}
                    <View style={styles.detailColumn}>
                        <View style={styles.detailRow}>
                            <Image source={require('../../assets/shareWithMe/owner.png')} style={[styles.icon, { tintColor: colors.icon }]} />
                            <Text style={[styles.detailText, { color: colors.text }]}>{item.ownerName}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Image source={require('../../assets/dashboardicons/engine.png')} style={[styles.icon, { tintColor: colors.icon }]} />
                            <Text style={[styles.detailText, { color: colors.text }]}>{item.motorType}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Image source={require('../../assets/dashboardicons/altitude.png')} style={[styles.icon, { tintColor: colors.icon }]} />
                            <Text style={[styles.detailText, { color: colors.text }]}>{item.altitude}{" "}{item.altitudeUnit}</Text>
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
                            <Text style={[styles.detailText, { color: colors.text }]}>{item.mass}{" "}{item.massUnit}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Image source={require('../../assets/dashboardicons/flight-time.png')} style={[styles.icon, { tintColor: colors.icon }]} />
                            <Text style={[styles.detailText, { color: colors.text }]}>{item.flightTime} sec</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {sharedDrones.length === 0 ? (
                <Text style={[styles.emptyMessage, { color: colors.text }]}>
                    Currently, you don't have any shared Rocket.
                </Text>
            ) : (
                <FlatList
                    data={sharedDrones}
                    renderItem={renderDroneItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.droneList}
                    showsVerticalScrollIndicator={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,    
    },
    droneList: {
        paddingHorizontal: 20,
    },

    droneCard: {
        borderRadius: 15,
        padding: 16,
        paddingVertical: 6,
        marginVertical: 10,
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderWidth: 0.5,
        borderColor: 'white',
    },
    emptyMessage: {
        fontSize: 18,
        fontFamily: 'DMSans-Regular',
        textAlign: 'center',
        marginTop: '50%',
        paddingHorizontal: 20,
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
    },
    verifiedIcon: {
        height: 20,
        width: 20,
        start: 10
    },
    cardDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailColumn: {
        flexDirection: 'column',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 6,
    },
    icon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    detailText: {
        fontSize: 18,
        fontFamily: 'DMSans-Regular',
    },
});

export default ShareWithMe;
