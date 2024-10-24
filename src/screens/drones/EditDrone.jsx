import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, KeyboardAvoidingView, ScrollView, Alert, Platform, ActivityIndicator } from 'react-native';
import { useNavigation, useRoute, useTheme } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { fetchDroneById } from '../../services/Firebase/FirebaseServices';
import database from '@react-native-firebase/database';
import Headers from '../../components/header/Headers';
import Toast from 'react-native-toast-message';

const EditDrone = () => {
    const [massUnit, setMassUnit] = useState('g');
    const [isMassDropdownVisible, setIsMassDropdownVisible] = useState(false);
    const [selectedDroneType, setSelectedDroneType] = useState('');
    const [selectedMotorType, setSelectedMotorType] = useState('');
    const [altitudeUnit, setAltitudeUnit] = useState('m');
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const [droneName, setDroneName] = useState('');
    const [altitude, setAltitude] = useState('');
    const [flightTime, setFlightTime] = useState('');
    const [mass, setMass] = useState('');
    const [launchAngle, setLaunchAngle] = useState('');
    const [loading, setLoading] = useState(true);
    const [updateLoader, setUpdateLoader] = useState(false);
    const { colors } = useTheme();
    const navigation = useNavigation();
    const route = useRoute();
    const user = useSelector((state) => state.auth.user);
    const { droneId, id } = route.params;

    const motorOptions = {
        Low: ['A', 'B', 'C', 'D', 'E'],
        Medium: ['F', 'G'],
        High: ['H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'],
    };

    useEffect(() => {
        // Fetch the drone details and set them to state
        const getDroneDetails = async () => {
            try {
                setLoading(true);
                const droneDetails = await fetchDroneById(droneId);
                console.log("Drone details:", droneDetails);

                if (droneDetails) {
                    setDroneName(droneDetails.droneName || '');
                    setSelectedDroneType(droneDetails.droneType || '');
                    setSelectedMotorType(droneDetails.motorType || '');
                    setAltitude(droneDetails.altitude.toString() || '');
                    setFlightTime(droneDetails.flightTime || '');
                    setMass(droneDetails.mass.toString() || '');
                    setLaunchAngle(droneDetails.launchAngle || '');
                    setAltitudeUnit(droneDetails.altitudeUnit || 'm');
                    setMassUnit(droneDetails.massUnit || 'g');
                } else {
                    Alert.alert('Error', 'Failed to fetch drone details.');
                }
            } catch (error) {
                console.error("Error fetching drone details:", error);
            } finally {
                setLoading(false);
            }
        };

        getDroneDetails();
    }, [droneId]);

    const handleSubmit = async () => {
        if (!user || !user.uid) {
            Alert.alert('Star Launch', 'No user is logged in.');
            return;
        }

        if (!droneName || !selectedDroneType || !selectedMotorType || !altitude || !flightTime || !mass || !launchAngle) {
            Alert.alert('Star Launch', 'Please fill in all fields.');
            return;
        }

        const droneData = {
            droneName,
            droneType: selectedDroneType,
            motorType: selectedMotorType,
            altitude,
            altitudeUnit,
            flightTime,
            mass,
            massUnit,
            launchAngle,
            createdAt: database.ServerValue.TIMESTAMP,
            userId: user.uid,
        };

        try {
            setUpdateLoader(true);
            await database().ref(`/drones/${id}`).update(droneData);
            Toast.show({
                type: 'success',
                text1: "Rocket Details edited successfully",
                position: 'top',
                topOffset: 100,
                text1Style: { fontSize: 16, fontWeight: 'bold' },
                onHide: () => { navigation.navigate('FlightDetails', { droneId: droneId }) }
            })
        } catch (error) {
            console.error('Error updating drone details:', error);
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
    console.log("selectedDroneType", altitude, mass);

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : null}>
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={[styles.container, { backgroundColor: colors.background }]}>
                    {/* Header */}
                    <Headers title="Edit Rocket" showBackButton={true} style={{ paddingHorizontal: 0 }} />
                    {/* Drone Name Input */}
                    <View style={styles.inputContainer}>
                        <Image source={require('../../assets/icons/rocket3.png')} style={[styles.icon]} />
                        <TextInput
                            placeholder="Rocket Name"
                            placeholderTextColor="grey"
                            style={styles.input}
                            value={droneName}
                            onChangeText={setDroneName}
                        />
                    </View>

                    {/* Select Drone Type */}
                    <Text style={[styles.label, { color: colors.text }]}>Select Rocket Type</Text>
                    <View style={styles.optionContainer}>
                        {['Low', 'Medium', 'High'].map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[styles.radioButtonContainer, selectedDroneType === type ? styles.selectedRadioButtonContainer : styles.radioButton]}
                                onPress={() => {
                                    setSelectedDroneType(type);
                                    setSelectedMotorType(''); // Reset motor type on type selection
                                }}
                            >
                                <View style={[styles.radioCircle, selectedDroneType === type ? styles.radioCircleSelected : {}]} />
                                <Text style={styles.optionText}>{type}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Select Motor Type */}
                    {selectedDroneType && (
                        <>
                            <View style={styles.inputHeading}>
                                <Text style={[styles.label, { color: colors.text }]}>Select Motor Type  </Text>
                                <Image source={require('../../assets/icons/motor.png')} style={[styles.headingIcon2, { tintColor: colors.icon }]} />
                            </View>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.optionContainer2]}>
                                {motorOptions[selectedDroneType].map((motor) => (
                                    <TouchableOpacity
                                        key={motor}
                                        style={[styles.radioButtonContainer1, selectedMotorType === motor ? styles.selectedRadioButtonContainer : styles.radioButton]}
                                        onPress={() => setSelectedMotorType(motor)}
                                    >
                                        <View style={[styles.radioCircle, selectedMotorType === motor ? styles.radioCircleSelected : {}]} />
                                        <Text style={styles.optionText}>{motor}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </>
                    )}

                    {/* Altitude Input */}
                    <View style={styles.row}>
                        {/* Altitude */}
                        <View style={styles.inputFieldContainer}>
                            <View style={styles.inputHeading}>
                                <Text style={[styles.headingText, { color: colors.text }]}>Altitude</Text>
                                <Image source={require('../../assets/dashboardicons/altitude.png')} style={[styles.headingIcon, { tintColor: colors.icon }]} />
                            </View>
                            <View style={styles.inputRow}>
                                <TextInput
                                    placeholder="Altitude"
                                    placeholderTextColor="grey"
                                    keyboardType="numeric"
                                    value={altitude}
                                    onChangeText={setAltitude}
                                    style={[styles.inputSmall, { color: colors.inputText }]}
                                />
                                <View style={styles.dropdownContainer}>
                                    <TouchableOpacity
                                        style={[styles.dropdownButton, { backgroundColor: colors.unitbackground }]}
                                        onPress={() => setIsDropdownVisible(!isDropdownVisible)}
                                    >
                                        <Text style={styles.unitText}>{altitudeUnit}</Text>
                                        <Image source={require('../../assets/icons/dropdown.png')} style={styles.dropdownIcon} />
                                    </TouchableOpacity>
                                    {isDropdownVisible && (
                                        <View style={styles.dropdown}>
                                            {['m', 'ft'].map((unit) => (
                                                <TouchableOpacity
                                                    key={unit}
                                                    style={styles.dropdownItem}
                                                    onPress={() => {
                                                        setAltitudeUnit(unit);
                                                        console.log(unit, "unit")
                                                        setIsDropdownVisible(false);
                                                    }}
                                                >
                                                    <Text style={[styles.dropdownItemText, { color: colors.text }]}>{unit}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>

                        {/* Flight Time */}
                        <View style={styles.inputFieldContainer}>
                            <View style={styles.inputHeading}>
                                <Text style={[styles.headingText, { color: colors.text }]}>Flight Time</Text>
                                <Image source={require('../../assets/dashboardicons/flight-time.png')} style={[styles.headingIcon, { tintColor: colors.icon }]} />
                            </View>
                            <View style={styles.inputRow}>
                                <TextInput
                                    placeholder="Time"
                                    placeholderTextColor="grey"
                                    value={flightTime}
                                    onChangeText={setFlightTime}
                                    style={[styles.inputSmall, { color: colors.inputText }]}
                                />
                                <View style={[styles.unitContainer, { backgroundColor: colors.unitbackground }]}>
                                    <Text style={styles.unitText}>S</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Mass Input */}
                    <View style={styles.row}>
                        {/* Mass */}
                        {/* Mass */}
                        <View style={styles.inputFieldContainer}>
                            <View style={styles.inputHeading}>
                                <Text style={[styles.headingText, { color: colors.text }]}>Mass</Text>
                                <Image source={require('../../assets/dashboardicons/mass.png')} style={[styles.headingIcon, { tintColor: colors.icon }]} />
                            </View>
                            <View style={styles.inputRow}>
                                <TextInput
                                    placeholder="Mass"
                                    placeholderTextColor="grey"
                                    keyboardType="numeric"
                                    value={mass}
                                    onChangeText={setMass}
                                    style={[styles.inputSmall, { color: colors.inputText }]}
                                />
                                <View style={styles.dropdownContainer}>
                                    <TouchableOpacity
                                        style={[styles.dropdownButton, { backgroundColor: colors.unitbackground }]}
                                        onPress={() => setIsMassDropdownVisible(!isMassDropdownVisible)}
                                    >
                                        <Text style={styles.unitText}>{massUnit}</Text>
                                        <Image source={require('../../assets/icons/dropdown.png')} style={styles.dropdownIcon} />
                                    </TouchableOpacity>
                                    {isMassDropdownVisible && (
                                        <View style={styles.dropdown}>
                                            {['g', 'lbs'].map((unit) => (
                                                <TouchableOpacity
                                                    key={unit}
                                                    style={styles.dropdownItem}
                                                    onPress={() => {
                                                        setMassUnit(unit);
                                                        setIsMassDropdownVisible(false);
                                                    }}
                                                >
                                                    <Text style={[styles.dropdownItemText, { color: colors.text }]}>{unit}</Text>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    )}
                                </View>
                            </View>
                        </View>


                        {/* Launch Angle */}
                        <View style={styles.inputFieldContainer}>
                            <View style={styles.inputHeading}>
                                <Text style={[styles.headingText, { color: colors.text }]}>Launch Angle</Text>
                                <Image source={require('../../assets/addDroneicons/angle.png')} style={[styles.headingIcon, { tintColor: colors.icon }]} />
                            </View>
                            <View style={styles.inputRow}>
                                <TextInput
                                    placeholder="Angle"
                                    placeholderTextColor="grey"
                                    value={launchAngle}
                                    onChangeText={setLaunchAngle}
                                    style={[styles.inputSmall, { color: colors.inputText }]}
                                />
                                <View style={[styles.unitContainer, { backgroundColor: colors.unitbackground }]}>
                                    <Text style={styles.unitText}>deg</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity onPress={handleSubmit} style={[styles.submitButton, { backgroundColor: colors.submitBackground }]} disabled={loading}>
                        {updateLoader ? (
                            <ActivityIndicator size="small" color={colors.submitText} />
                        ) : (
                            <Text style={[styles.submitButtonText, { color: colors.submitText }]}>Update</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </ScrollView>
            <Toast />
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        // flex: 1,
        backgroundColor: '#0F2452',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    headerButton: {
        width: 50,
        height: 50,
        backgroundColor: '#FFFFFF20',
        padding: 10,
        borderRadius: 10,
    },
    headerTitle: {
        color: 'white',
        fontSize: 20,
        fontFamily: 'DMSans-Regular',
        fontWeight: '600',
        textAlign: 'center',
        flex: 1,
        marginLeft: -30,
    },
    icon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
        tintColor: 'grey',
    },
    settingIcon: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
        borderRadius: 10
    },
    backIcon: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
        borderRadius: 10,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E4E4E4',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
        paddingVertical: -5,
        marginTop: 24,
    },
    input: {
        flex: 1,
        marginLeft: 10,
        fontSize: 16,
        fontFamily: 'DMSans-Regular',
        color: '#000',
    },
    label: {
        color: 'white',
        fontSize: 16,
        fontFamily: 'DMSans-Regular',
        fontWeight: '600',
        marginBottom: 10,
    },
    motorTypeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    engineIcon: {
        width: 24,
        height: 24,
        marginLeft: 10,
        marginBottom: 8,
    },
    optionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    optionContainer2: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    optionButton: {
        flex: 1,
        backgroundColor: '#E4E4E4',
        paddingVertical: 10,
        borderRadius: 10,
        alignItems: 'center',
        marginHorizontal: 5,
    },
    selectedOption: {
        backgroundColor: '#003BE2',
    },
    radioButtonContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E4E4E4',
        borderColor: '#FFFFFF50',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        marginHorizontal: 5,
    },
    radioButtonContainer1: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E4E4E4',
        borderColor: '#FFFFFF50',
        paddingVertical: 10,
        paddingHorizontal: 25,
        borderRadius: 10,
        marginHorizontal: 5,
    },
    selectedRadioButtonContainer: {
        borderColor: 'black',
        borderWidth: 2,
    },
    radioButton: {
        borderColor: '#0F2452',
        // borderWidth: 1,
    },
    selectedRadioButton: {
        backgroundColor: '#E4E4E4',
    },
    radioCircle: {
        height: 16,
        width: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#A9A9A9',
        marginRight: 4,
    },
    radioCircleSelected: {
        borderColor: 'black',
        borderWidth: 3,
    },
    optionText: {
        color: 'black',
        fontSize: 14,
        fontFamily: 'DMSans-Regular',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        gap: 16,
    },
    inputFieldContainer: {
        flex: 1,
        marginHorizontal: 2,
        gap: 4,
        marginVertical: -5,
        margin: 10,
    },
    inputHeading: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 5,
    },
    headingIcon: {
        width: 20,
        height: 20,
        marginRight: 10,
    },
    headingIcon2: {
        width: 20,
        height: 15,
        marginRight: 10,
        marginBottom: 5,
      },
    headingText: {
        color: 'white',
        fontFamily: 'DMSans-Regular',
        fontSize: 14,
        marginRight: 14,
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#E4E4E4',
        borderRadius: 10,
    },
    inputSmall: {
        flex: 1,
        fontFamily: 'DMSans-Regular',
        fontSize: 16,
        marginLeft: 10,
    },
    dropdownContainer: {
        position: 'relative',
        flex: 1,
    },
    dropdownButton: {
        flexDirection: 'row',
        height: 50,
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
        justifyContent: 'space-between',
    },
    dropdownIcon: {
        width: 18,
        height: 18,
        marginLeft: 5,
    },
    dropdown: {
        position: 'absolute',
        top: -45,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 8,
        zIndex: 10,
    },
    dropdownItem: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
    },
    dropdownItemText: {
        textAlign: 'center',
        fontSize: 16,
    },
    unitContainer: {
        backgroundColor: '#000000',
        paddingHorizontal: 18,
        paddingVertical: 16,
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
    },
    unitText: {
        color: 'white',
        fontSize: 17,
        fontFamily: 'DMSans-Regular',
        textAlign: 'center',
        marginBottom: 5,
    },
    submitButton: {
        backgroundColor: 'white',
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginBottom: 20,
        marginTop: 20,
    },
    submitButtonText: {
        color: '#000000CC',
        fontSize: 16,
        fontFamily: 'DMSans-Regular',
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: "50%"
    },
});

export default EditDrone;
