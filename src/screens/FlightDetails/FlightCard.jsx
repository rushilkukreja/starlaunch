import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme, useNavigation } from '@react-navigation/native';

const FlightCard = ({ flightUid, droneId, angle, flightId, date, time, location, wind, duration, altitude, timeUnit, altitudeUnit, flightTime }) => {
    const { colors } = useTheme();
    const navigation = useNavigation();
    console.log(time)

    const convertTo12HourFormat = (time) => {
        const [hour, minute] = time.split(':').map(Number);
        const period = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12; // Convert to 12-hour format
        return `${formattedHour}:${minute < 10 ? '0' + minute : minute}`;
    };

    const formattedTime = convertTo12HourFormat(time);

    return (
        <TouchableOpacity onPress={() => navigation.navigate('EditDetails', { flightUid, droneId, angle, flightId, date, time, location, wind, duration, altitude, flightTime })}>
            <LinearGradient
                colors={['#ffffff10', '#ffffff30', '#ffffff20', '#ffffff30']}
                style={[styles.flightCard, { backgroundColor: colors.containerBackground }]}
                start={{ x: 0.3, y: 0.1 }}
                end={{ x: 1, y: 0.2 }}
            >
                <View style={styles.cardHeader}>
                    <Text style={[styles.flightId, { color: colors.text }]}>{flightId}</Text>
                    <Image source={require('../../assets/icons/edit.png')} style={[styles.editIcon, { tintColor: colors.icon }]} />
                </View>

                <View style={styles.cardDetails}>
                    <View style={styles.detailColumn}>
                        <View style={styles.detailRow}>
                            <Image source={require('../../assets/dashboardicons/last-flight-date.png')} style={[styles.icon, { tintColor: colors.icon }]} />
                            <Text style={[styles.detailText, { color: colors.text }]}>{date}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Image source={require('../../assets/icons/location.png')} style={[styles.icon, { tintColor: colors.icon }]} />
                            <Text
                                style={[styles.detailText, { color: colors.text }]}
                                numberOfLines={2}
                                ellipsizeMode="tail"
                            >
                                {location}
                            </Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Image source={require('../../assets/dashboardicons/flight-time.png')} style={[styles.icon, { tintColor: colors.icon }]} />
                            <Text style={[styles.detailText, { color: colors.text,marginTop: 2.5 }]}>{duration} sec</Text>
                        </View>
                    </View>

                    <View style={styles.detailColumn}>
                        <View style={styles.detailRow}>
                            <Image source={require('../../assets/icons/time.png')} style={[styles.icon, { tintColor: colors.icon }]} />
                            <Text style={[styles.detailText, { color: colors.text }]}>{time}{" "}{timeUnit}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Image source={require('../../assets/icons/wind.png')} style={[styles.icon, { tintColor: colors.icon }]} />
                            <Text style={[styles.detailText, { color: colors.text }]}>{wind || 'NA'}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Image source={require('../../assets/dashboardicons/altitude.png')} style={[styles.icon, { tintColor: colors.icon }]} />
                            <Text style={[styles.detailText, { color: colors.text }]}>{altitude} {" "}{altitudeUnit}</Text>
                        </View>

                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    flightCard: {
        borderRadius: 15,
        padding: 16,
        marginVertical: 10,
        marginHorizontal: 10,
        borderWidth: 0.5,
        borderColor: 'white',
        width: '90%',
        alignSelf: 'center',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    flightId: {
        fontFamily: 'DMSans-Regular',
        fontSize: 18,
        fontWeight: '300',
    },
    cardDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailColumn: {
        flexDirection: 'column',
        width: '35%',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'start',
        marginVertical: 6,
    },
    detailText: {
        fontFamily: 'DMSans-Regular',
        fontSize: 16,
    },
    icon: {
        width: 24,
        height: 24,
        marginRight: 10,
    },
    editIcon: {
        width: 22,
        height: 22,
    },
});

export default FlightCard;
