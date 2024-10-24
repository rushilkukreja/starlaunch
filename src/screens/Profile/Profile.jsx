import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import Headers from '../../components/header/Headers';
import { logout } from '../../features/auth/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

const Profile = ({ route }) => {
  const navigation = useNavigation();
  const { colors, dark } = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [profileImage, setProfileImage] = useState(require('../../assets/images/profile_image.png'));
  const [profileData, setProfileData] = useState({
    displayName: '',
    email: '',
    bio: '',
    photoURL: '',
    role: 'User',
    academics: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (user && user.uid) {
          const userId = user.uid;
          const snapshot = await database().ref(`/users/${userId}`).once('value');
          const userData = snapshot.val();
          console.log(userData,"usertData")

          if (userData) {
            setProfileData({
              displayName: userData.displayName || 'No Name Provided',
              email: userData.email || 'No Email Provided',
              bio: userData.bio || 'No bio available',
              photoURL: userData.photoURL || null,
              role: 'User',
              academics: userData.academics || 'No Academics Provided',
            });

            // Check if user has updated photoURL
            if (userData.photoURL) {
              console.log(userData.photoURL)
              setProfileImage({ uri: userData.photoURL });
            } else {
              setProfileImage(require('../../assets/images/profile_image.png'));
            }            
          }
        }
      } catch (error) {
        console.error('Error fetching user profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    // Check if there is updated data from navigation
    const updatedData = route.params?.updatedData || null;
    if (updatedData) {
      setProfileData((prevData) => ({
        ...prevData,
        displayName: updatedData.displayName || prevData.displayName,
        bio: updatedData.bio || prevData.bio,
        academics: updatedData.academics || prevData.academics,
      }));

      // Check if updatedData has a photoURL
      if (updatedData.photoURL) {
        setProfileImage({ uri: updatedData.photoURL });
      } else {
        setProfileImage(prevImage => prevImage.uri ? prevImage : require('../../assets/images/profile_image.png'));
      }
    } else {
      fetchUserProfile();
    }
  }, [user, route.params]);


  const handleLogout = async () => {
    Alert.alert(
      "Star Launch",
      "Are you sure you want to log out?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Logout",
          onPress: async () => {
            try {
              if (user) {
                await GoogleSignin.signOut(); // Await for Google sign-out
                await auth().signOut();       // Await for Firebase sign-out
                dispatch(logout());           // Dispatch logout after both sign-outs are complete
              } else {
                console.warn("User is already signed out or not logged in.");
              }
            } catch (error) {
              console.log("Error during logout: ", error);
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Star Launch",
      "Are you sure you want to delete your account?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          onPress: async () => {
            try {
              if (user && user.uid) {
                const currentUser = auth().currentUser;

                if (currentUser) {
                  await database().ref(`/users/${user.uid}`).remove();
                  await currentUser.delete();
                  dispatch(logout());
                }
              }
            } catch (error) {
              console.log("Error deleting user account: ", error);
              if (error.code === 'auth/requires-recent-login') {
                Alert.alert(
                  "Star Launch",
                  "You need to log in again to delete your account. Please log out and log in again.",
                  [{ text: "OK" }]
                );
              }
            }
          }
        }
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="50%" color={colors.text} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Headers title="My Account" />
      <TouchableOpacity
        style={styles.editProfile}
        onPress={() => navigation.navigate('EditProfile')}
      >
        <Image
          source={require('../../assets/icons/edit_profile.png')}
          style={[styles.editProfileIcon, { tintColor: colors.icon }]}
        />
      </TouchableOpacity>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.profileImageContainer}>
          <Image source={profileImage} style={styles.profileImage} />
        </View>

        <Text style={[styles.profileName, { color: colors.text }]}>{profileData.displayName}</Text>
        <Text style={[styles.profileEmail, { color: colors.text }]}>{profileData.email}</Text>
        <Text style={[styles.profileRole, { color: colors.text }]}>{profileData.academics}</Text>

        <View style={styles.bioContainer}>
          <Text style={[styles.bioTitle, { color: colors.text }]}>Bio :</Text>
          <Text style={[styles.bioText, { color: colors.text }]}>{profileData.bio}</Text>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.profileActionButton }]} onPress={handleLogout}>
            <Image source={require('../../assets/icons/logout.png')} style={styles.actionIcon} />
            <Text style={[styles.actionText,]}>Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteAccount} style={[styles.actionButton, { backgroundColor: colors.profileActionButton }]}>
            <Image source={require('../../assets/icons/delete.png')} style={styles.actionIcon} />
            <Text style={[styles.actionText]}>Delete Account</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: 'center',
    padding: 20,
  },
  editProfile: {
    position: 'absolute',
    top: 100,
    right: 25,
    zIndex: 1,
  },
  editProfileIcon: {
    width: 30,
    height: 30,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  profileImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 8,
    borderColor: '#FFFFFF90',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  profileEmail: {
    fontSize: 16,
    marginVertical: 5,
  },
  profileRole: {
    fontSize: 16,
    marginBottom: 15,
  },
  bioContainer: {
    width: '100%',
    alignItems: 'row',
    marginBottom: 20,
    justifyContent: 'flex-start',
  },
  bioTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    marginLeft: 20,
    alignSelf: 'flex-start',
  },
  bioText: {
    fontSize: 14,
    paddingHorizontal: 20,
    flexShrink: 1,
  },
  actionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    borderRadius: 10,
    padding: 10,
    marginVertical: 10,
    width: '48%',
  },
  actionIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  actionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Profile;
