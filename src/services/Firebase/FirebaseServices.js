import database from '@react-native-firebase/database';
import { Alert } from 'react-native';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const loginWithEmail = async (email, password, rememberMe) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    const serializedUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      phoneNumber: user.phoneNumber,
      photoURL: user.photoURL,
    };

    // Get ID Token and store in AsyncStorage
    const idToken = await user.getIdToken();
    await AsyncStorage.setItem('idToken', idToken);

    // Save user email and password if "Remember Me" is checked
    if (rememberMe) {
      await AsyncStorage.setItem('rememberedEmail', email);
      await AsyncStorage.setItem('rememberedPassword', password);
    } else {
      await AsyncStorage.removeItem('rememberedEmail');
      await AsyncStorage.removeItem('rememberedPassword');
    }

    return serializedUser;
  } catch (error) {
    throw error;
 
  }
};
// signup function
export const signup = async (trimmedEmail, trimmedPassword, userName, academics, navigation) => {
  try {
    // Create user with email and password
    const userCredential = await auth().createUserWithEmailAndPassword(trimmedEmail, trimmedPassword);
    const userId = userCredential.user.uid;
    console.log(userId,academics, 'user created successfully--');
    console.log(academics,"8888");
    
    const user = userCredential.user;
    await user.updateProfile({
      displayName: userName,
      photoURL: 'https://picsum.photos/200/300'  // You can use a default image URL or allow the user to upload one
    });
    // Store additional user data in Firebase Realtime Database
    await database()
      .ref(`/users/${userId}`)
      .set({
        displayName: userName,
        email: trimmedEmail,
        photoURL: 'https://picsum.photos/200/300',
        bio: 'Hey there! I am using Star Launch.',
        academics: academics
      });

    console.log('User account created and user data stored successfully!');
    navigation.navigate('Login');
  } catch (error) {
    console.log('Error during sign up:', error);
      // Alert.alert('Star Launch', 'An error occurred during sign up. Please try again.');
    if (error.code === 'auth/email-already-in-use') {
      Alert.alert('Star Launch', 'That email address is already in use!');
    } else if (error.code === 'auth/invalid-email') {
      Alert.alert('Star Launch', 'That email address is invalid!');
    } else {
      Alert.alert('Star Launch', error.message);
    } 
  }
}
// Function to fetch drone data from Firebase
export const fetchDroneData = async (userId) => {
  try {
    const snapshot = await database()
      .ref('/drones')
      .orderByChild('userId') // Order by the 'userId' field in the database
      .equalTo(userId) // Only fetch drones that match the current user's ID
      .once('value');

    if (snapshot.exists()) {
      const droneData = snapshot.val();
      // Convert the fetched data into an array
      const droneArray = Object.keys(droneData).map((key, index) => ({
        id: key, // Firebase key
        displayId: `#${String(index + 1).padStart(2, '0')}`, // Display ID like #01, #02, etc.
        ...droneData[key],
      }));
      return droneArray;
    } else {
      return [];
    }
  } catch (error) {
    console.error('Error fetching drones: ', error);
    Alert.alert('Star Launch', 'Failed to fetch drones from Firebase.');
    return [];
  }
};

// Function to fetch a single drone's data by ID
export const fetchDroneById = async (droneId) => {
  try {
    const snapshot = await database().ref(`/drones/${droneId}`).once('value');
    if (snapshot.exists()) {
      return snapshot.val();
      
      

    } else {
      return null;
    }


  } catch (error) {
    console.error('Error fetching drone details: ', error);
    Alert.alert('Star Launch', 'Failed to fetch drone details.');
    return null;
  }
  
};


export const fetchSharedDroneDetails = async (sharedDrones, userEmail) => {
  try {
    const droneDetailsPromises = sharedDrones.map(async (sharedDrone, index) => {
      // Fetch the drone details using droneId
      const droneData = await fetchDroneById(sharedDrone.droneId);

      if (droneData) {
        // Fetch the owner details using the userId from the drone data
        const ownerSnapshot = await database().ref(`/users/${droneData.userId}`).once('value');
        const ownerName = ownerSnapshot.exists() ? ownerSnapshot.val().displayName : 'Unknown';

        return {
          id: sharedDrone.droneId,
          displayId: `#${String(index + 1).padStart(2, '0')}`,
          ownerName,
          sharedWith: sharedDrone.sharedWith,
          accessType: sharedDrone.accessType,
          ...droneData,
        };
      } else {
        return null;
      }
    });

    const fetchedDrones = await Promise.all(droneDetailsPromises);
    console.log(fetchedDrones, "fetchedDrones");
    
    return fetchedDrones.filter((drone) => drone !== null);
  } catch (error) {
    console.error('Error fetching shared drone details:', error);
    return [];
  }
}; 

export const fetchUserById = async (userId) => {
  try {
    const snapshot = await database().ref(`/users/${userId}`).once('value');
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
};

export const fetchFlightsByDroneId = async (droneId) => {
  try {
    const snapshot = await database().ref(`/flights`).once('value');
    if (snapshot.exists()) {
      const allFlights = snapshot.val() || {};
      return Object.entries(allFlights)
        .filter(([_, flight]) => flight.droneId === droneId)
        .map(([id, flight]) => ({ id, ...flight }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching flights:', error);
    return [];
  }
};

