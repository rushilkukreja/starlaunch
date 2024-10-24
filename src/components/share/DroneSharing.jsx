import { StyleSheet, Text, View, Image, TouchableOpacity, TextInput, Modal, FlatList, Alert } from 'react-native'
import React, { useState } from 'react'
import { useTheme } from '@react-navigation/native';
import database from '@react-native-firebase/database';

const DroneSharing = ({ modalVisible, setModalVisible, droneId, userId }) => {
    const { colors } = useTheme();
    const [email, setEmail] = useState('');
    const [accessType, setAccessType] = useState('Access');
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const accessOptions = ['Edit', 'View'];
    console.log(droneId, userId);

    const closeModal = () => {
        setModalVisible(false);
    };

    const handleAccessTypeSelect = (type) => {
        setAccessType(type);
        setDropdownVisible(false);
    };

    const handleShare = async () => {
        if (email.trim() === '' || accessType === 'Access') {
            Alert.alert("Star Launch", "Please enter an email and select an access type.");
            return;
        }

        try {
            // Check if the drone is already shared with this email
            const sharedDronesRef = database().ref('/sharedDrones');
            const snapshot = await sharedDronesRef
                .orderByChild('droneId')
                .equalTo(droneId)
                .once('value');

            if (snapshot.exists()) {
                const sharedDrones = snapshot.val();
                // Check if the email already exists in the shared records for this drone
                const alreadyShared = Object.values(sharedDrones).some(
                    (sharedDrone) => sharedDrone.sharedWith === email
                );

                if (alreadyShared) {
                    Alert.alert("Star Launch", "Rocket has already been shared with this email.");
                    return;
                }
            }

            // Proceed with sharing the drone if not already shared
            const sharedDroneRef = sharedDronesRef.push();
            await sharedDroneRef.set({
                droneId: droneId,
                sharedWith: email,
                accessType: accessType === 'Edit',
                sharedBy: userId,
            });
            Alert.alert("Star Launch", "Rocket shared successfully.");
            setModalVisible(false);
        } catch (error) {
            console.log("Error sharing drone:", error);
            Alert.alert("Star Launch", "Failed to share rocket. Please try again.");
        }
    };

    return (
        <Modal
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            statusBarTranslucent={true}
            onRequestClose={closeModal}
        >
            <View style={styles.centeredView}>
                <View style={[styles.modalView, { backgroundColor: colors.background }]}>
                    <Text style={[styles.modalText, { color: colors.text }]}>Share rocket details</Text>
                    <View style={[styles.box, { borderColor: colors.text }]}>
                        <TextInput
                            style={[styles.modalInput, { color: colors.text }]}
                            placeholder="Email.."
                            placeholderTextColor={colors.text}
                            keyboardType="email-address"
                            value={email}
                            onChangeText={(text) => setEmail(text)}
                        />
                        <TouchableOpacity
                            style={[styles.accessTypeButton, { borderColor: colors.text }]}
                            onPress={() => setDropdownVisible(!dropdownVisible)}
                        >
                            <Text style={[styles.accessTypeText, { color: colors.text }]}>{accessType}</Text>
                            <Image source={require('../../assets/icons/dropdown.png')} style={[styles.arrowIcon, { tintColor: colors.icon }]} />
                        </TouchableOpacity>
                    </View>
                    {dropdownVisible && (
                        <View style={[styles.dropdown, { borderColor: colors.text, backgroundColor: colors.background }]}>
                            <FlatList
                                data={accessOptions}
                                showsVerticalScrollIndicator={false}
                                keyExtractor={(item) => item}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.option,
                                            item === accessType && styles.selectedOption, // Apply selected option style
                                        ]}
                                        onPress={() => handleAccessTypeSelect(item)}
                                    >
                                        <Text style={[
                                            styles.optionText,{
                                                color: colors.text,},
                                            item === accessType && styles.selectedOptionText // Change text color if selected
                                        ]}>
                                            {item}
                                        </Text>
                                    </TouchableOpacity>
                                )}
                            />

                        </View>
                    )}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleShare}
                        >
                            <Text style={styles.buttonText}>Share</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.CancelButton}
                            onPress={closeModal}
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

export default DroneSharing;

const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        width: '100%',
    },
    selectedOption: {
        backgroundColor: '#9FE2BF', 
    },
    selectedOptionText: {
        color: 'black',
        fontWeight: 'bold',
    },
    
    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 25,
        alignItems: 'center',
        shadowColor: '#000',
        width: '90%',
        paddingVertical: 40,
    },
    modalText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    box: {
        width: '100%',
        height: 5,
        marginBottom: 10,
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 5,
        height: 50,
        flexDirection: 'row',
    },
    modalInput: {
        borderRadius: 5,
        padding: 10,
        marginBottom: 20,
        width: '70%',
        height: 50,
    },
    accessTypeButton: {
        width: '30%',
        padding: 15,
        borderWidth: 1,
        borderColor: 'black',
        borderRadius: 5,
        height: 48,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    arrowIcon: {
        width: 20,
        height: 10,
        marginLeft: 5,
        tintColor: 'black',
    },
    accessTypeText: {
        fontSize: 14,
        color: 'black',
        textAlign: 'center',
        height: 30,
        alignSelf: 'center',
        paddingTop: 4,
        paddingHorizontal: 4,
    },
    dropdown: {
        // width: '45%',
        borderRadius: 5,
        borderWidth: 1,
        borderColor: '#ccc',
        maxHeight: 100,
        elevation: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 'auto',
    },
    option: {
        borderBottomColor: '#ccc',
        borderBottomWidth: 1,
        paddingVertical: 10,
        paddingHorizontal: 52,
        width: '100%',
        height: 50,
    },
    selectedOption: {
        backgroundColor: '#9FE2BF',
    },
    selectedOptionText: {
        color: 'black',
        fontWeight: 'bold',
    },
    optionText: {
        fontSize: 16,
        color: 'white',
    },
    button: {
        width: '48%',
        height: 50,
        backgroundColor: '#50C878',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    CancelButton: {
        width: '48%',
        height: 50,
        backgroundColor: 'red',
        borderRadius: 5,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        paddingHorizontal: 20,
    },
    buttonContainer: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
});
