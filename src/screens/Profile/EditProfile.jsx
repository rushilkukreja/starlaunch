import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  TouchableWithoutFeedback,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  PermissionsAndroid,
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import Headers from '../../components/header/Headers';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';
import RNFS from 'react-native-fs';

const EditProfile = () => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const [profileImage, setProfileImage] = useState(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [academics, setAcademics] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const userId = auth().currentUser.uid;
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownOptions = ['School', 'University'];

  const userNameRef = useRef(null);
  const bioRef = useRef(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const snapshot = await database().ref(`/users/${userId}`).once('value');
        const userData = snapshot.val();
        console.log(userData, 'userData');

        if (userData) {
          setUsername(userData.displayName);
          setBio(userData.bio);
          setProfileImage(userData.photoURL ? { uri: userData.photoURL } : null);
          setAcademics(userData.academics);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId]);

  const requestCameraPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const requestGalleryPermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        {
          title: 'Gallery Permission',
          message: 'This app needs access to your gallery.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  };

  const openImagePicker = () => {
    Alert.alert(
      'Select Image Source',
      'Choose the source to select your image',
      [
        { text: 'Camera', onPress: openCamera },
        { text: 'Gallery', onPress: openGallery },
        { text: 'Cancel', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const openCamera = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      Alert.alert('Camera permission denied.');
      return;
    }
    const options = {
      mediaType: 'photo',
      quality: 1,
      saveToPhotos: true,
    };
    try {
      console.log('Opening camera...');
      const response = await launchCamera(options);
      console.log('Camera response:', response);
      if (!response.didCancel && response.assets && response.assets.length > 0) {
        const source = { uri: response.assets[0].uri };
        const base64Image = await convertToBase64(source.uri);
        setProfileImage(source);
      } else {
        console.log('User cancelled the camera operation.');
      }
    } catch (error) {
      console.error('Error launching camera: ', error);
      Alert.alert('Star Launch', 'Could not open camera.');
    }
  };

  const openGallery = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) {
      Alert.alert('Gallery permission denied.');
      return;
    }

    const options = {
      mediaType: 'photo',
      quality: 1,
    };
    try {
      const response = await launchImageLibrary(options);
      if (!response.didCancel && response.assets && response.assets.length > 0) {
        const source = { uri: response.assets[0].uri };
        const base64Image = await convertToBase64(source.uri);
        setProfileImage(source);
      }
    } catch (error) {
      console.error('Error launching gallery: ', error);
      Alert.alert('Star Launch', 'Could not open gallery.');
    }
  };

  const convertToBase64 = async (uri) => {
    try {
      const base64Data = await RNFS.readFile(uri, 'base64');
      return `data:image/jpeg;base64,${base64Data}`;
    } catch (error) {
      console.error('Error converting image to base64:', error);
    }
  };

  const updateProfile = async () => {
    try {
      setIsUpdating(true);

      let base64Image = null;

      if (profileImage && profileImage.uri) {
        if (!profileImage.uri.startsWith('data:image/') && !profileImage.uri.startsWith('http')) {
          base64Image = await convertToBase64(profileImage.uri);
        } else {
          base64Image = profileImage.uri;
        }
      }

      const updates = {
        displayName: username,
        bio: bio,
        academics: academics,
        ...(base64Image && { photoURL: base64Image }),
      };

      await database().ref(`/users/${userId}`).update(updates);

      setIsUpdating(false);
      Alert.alert(
        'Star Launch',
        'Your profile has been updated successfully.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('Profile', {
                updatedData: {
                  displayName: username,
                  bio: bio,
                  academics: academics,
                  photoURL: base64Image || null,
                },
              });
            },
          },
        ]
      );

    } catch (error) {
      setIsUpdating(false);
      console.log('Error updating profile:', error);
      Alert.alert('Star Launch', 'There was an error updating your profile.');
    }
  };

  const handleOutsidePress = () => {
    Keyboard.dismiss();
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="50%" color={colors.text} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 20}
      style={{ flex: 1 }}
    >
      <TouchableWithoutFeedback onPress={handleOutsidePress}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Headers title="Edit Profile" />

          <View style={styles.profileContainer}>
            <View style={styles.profileImageWrapper}>
              {profileImage ? (
                <Image source={profileImage} style={styles.profileImage} />
              ) : (
                <Image
                  source={require('../../assets/images/profile_image.png')}
                  style={styles.profileImage}
                />
              )}
              <TouchableOpacity
                style={styles.cameraIconContainer}
                onPress={openImagePicker}
              >
                <Image
                  source={require('../../assets/icons/camera.png')}
                  style={styles.cameraIcon}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.text }]}>User Name:</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.containerBackground }]}>
                  <View style={styles.inputBackground}>
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={username}
                      ref={userNameRef}
                      onChangeText={setUsername}
                      textAlignVertical="top"
                      scrollEnabled={false}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => userNameRef.current?.focus()}
                    style={styles.pencilIconContainer}>
                    <Image
                      source={require('../../assets/icons/pencil.png')}
                      style={[styles.pencilIcon, { tintColor: colors.icon }]}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.text }]}>Academics:</Text>
                <TouchableOpacity
                  style={[styles.inputWrapper, { backgroundColor: colors.containerBackground }]}
                  onPress={() => setDropdownVisible(!dropdownVisible)}
                >
                  <View style={styles.inputBackground}>
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={academics}
                      editable={false}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => setDropdownVisible(!dropdownVisible)}
                    style={styles.pencilIconContainer}
                  >
                    <Image
                      source={require('../../assets/icons/dropdown_arrow.png')}
                      style={[styles.pencilIcon, { tintColor: colors.icon }]}
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>

              {/* Dropdown Menu for Academics */}
              {dropdownVisible && (
                <View style={[styles.dropdown, { backgroundColor: colors.containerBackground }]}>
                  {dropdownOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.dropdownOption, academics === option && styles.selectedOption]}
                      onPress={() => {
                        setAcademics(option);
                        setDropdownVisible(false);
                      }}
                    >
                      <Text style={[styles.dropdownText, { color: colors.text }]}>{option}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              <View style={styles.row}>
                <Text style={[styles.label, { color: colors.text }]}>Bio:</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.containerBackground }]}>
                  <View style={styles.inputBackground1}>
                    <TextInput
                      style={[styles.input, { color: colors.text }]}
                      value={bio}
                      onChangeText={setBio}
                      ref={bioRef}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      scrollEnabled={false}
                    />
                  </View>
                  <TouchableOpacity
                    onPress={() => bioRef.current?.focus()}
                    style={styles.pencilIconContainer}>
                    <Image
                      source={require('../../assets/icons/pencil.png')}
                      style={[styles.pencilIcon, { tintColor: colors.icon }]}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

          </View>
          <TouchableOpacity style={styles.updateButton} onPress={updateProfile} disabled={isUpdating}>
            {isUpdating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.updateButtonText}>Update Profile</Text>
            )}
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  profileContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  profileImageWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 50,
  },
  profileImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  cameraIconContainer: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: '#FFFFFF90',
    borderRadius: 20,
    padding: 5,
  },
  cameraIcon: {
    width: 30,
    height: 30,
  },
  detailsContainer: {
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    fontFamily: 'DMSans-Regular',
    fontWeight: '500',
    width: '30%',
    marginTop: 5,
  },
  inputWrapper: {
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    width: '70%',
  },
  inputBackground: {
    borderRadius: 8,
    padding: 5,
    flex: 1,
    justifyContent: 'center',
    height: 35,
  },
  inputBackground1: {
    borderRadius: 8,
    padding: 5,
    flex: 1,
    height: 65,
  },
  input: {
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 10,
    paddingHorizontal: 10,
    fontFamily: 'DMSans-Regular',
    flex: 1,
    paddingVertical: 0,
    height: '100%',
    textAlignVertical: 'top',
    textAlign: 'left',
    marginTop: 2.5,
  },
  pencilIconContainer: {
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pencilIcon: {
    width: 20,
    height: 20,
  },
  updateButton: {
    backgroundColor: '#007BFF',
    borderRadius: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 80,
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    width: '70%',
    marginBottom: 20,
    alignSelf: 'flex-end',
    marginTop: -5,
  },
  dropdownOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: 'DMSans-Regular',
    textAlign: 'left',
  },
  selectedOption: {
    backgroundColor: 'lightgreen',
    borderRadius: 8,
  },
});

export default EditProfile;
