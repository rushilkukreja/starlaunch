import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  BackHandler,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
  ActivityIndicator,
  Animated,
  Linking
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { login } from '../../features/auth/authSlice';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import database from '@react-native-firebase/database';
import { loginWithEmail } from '../../services/Firebase/FirebaseServices';
export default function LoginScreen() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { colors } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  // Animated values
  const logoPosition = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      BackHandler.exitApp();
      return true;
    });

    // Check for saved email and password
    const checkRememberedCredentials = async () => {
      try {
        const savedEmail = await AsyncStorage.getItem('rememberedEmail');
        const savedPassword = await AsyncStorage.getItem('rememberedPassword');
        if (savedEmail && savedPassword) {
          setEmail(savedEmail);
          setPassword(savedPassword);
          setRememberMe(true);
        }
      } catch (error) {
        console.log('Failed to load saved credentials:', error);
      }
    };

    checkRememberedCredentials();

    return () => backHandler.remove();
  }, []);



  const showFlyDroneAlert = (message) => {
    Alert.alert("Star Launch", message);
  };

  const handleLogin = async () => {
    if (!email) {
      showFlyDroneAlert('Please enter your email.');
      return;
    }
    if (!password) {
      showFlyDroneAlert('Please enter your password.');
      return;
    }
    setLoading(true);
    try {
      const serializedUser = await loginWithEmail(email, password, rememberMe);
      dispatch(login({ user: serializedUser }));
    } catch (error) {
      // Handle different Firebase login errors with specific alerts
      console.log(error);

      switch (error.code) {
        case 'auth/invalid-email':
          showFlyDroneAlert('Invalid email address format.');
          break;
        case 'auth/user-not-found':
          showFlyDroneAlert('No user found with this email.');
          break;
        case 'auth/invalid-credential':
          showFlyDroneAlert('Incorrect password or email address.');
          break;
        default:
          showFlyDroneAlert('Login failed. Please try again later.');
      }
      setLoading(false);
    }
  };


  // google login setup

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      // Check if Google Play Services are available
      await GoogleSignin.hasPlayServices();

      // Start Google Sign-In process
      const userInfo = await GoogleSignin.signIn();
      console.log('userInfo:', userInfo);

      const idToken = userInfo.data.idToken; // Access idToken properly
      console.log('idToken:', idToken);

      if (!idToken) {
        throw new Error("No idToken received from Google Sign-In");
      }

      // Use idToken to create Google credential for Firebase Auth
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);

      // Sign in with Google credentials to Firebase
      const firebaseUserCredential = await auth().signInWithCredential(googleCredential);

      // Access user information from the credential
      const user = firebaseUserCredential.user;
      const userId = user.uid;

      // Check if user exists in the Realtime Database
      const snapshot = await database().ref(`/users/${userId}`).once('value');
      if (!snapshot.exists()) {
        // If the user doesn't exist, store user data in the Realtime Database
        await database()
          .ref(`/users/${userId}`)
          .set({
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL || 'default_profile_image_url', // Use a default image URL if no photo is provided
            bio: 'Hey there! I am using Star Launch.',
          });

        console.log('User account created and user data stored successfully!');
      } else {
        console.log('User already exists in the database.');
      }

      // Serialize user for Redux or local storage
      const serializedUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        emailVerified: user.emailVerified,
        phoneNumber: user.phoneNumber,
        photoURL: user.photoURL,
      };

      // Dispatch user information to Redux
      dispatch(login({ user: serializedUser }));
      console.log('User signed in to Firebase:', firebaseUserCredential.user);
    } catch (error) {
      console.log('Error during Google Sign-In:', error);

      // Handle different error cases
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow.');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        console.log('Sign-In in progress.');
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        console.log('Play services are not available or outdated.');
      } else {
        console.log('Some other error occurred:', error);
      }
    } finally {
      setLoading(false);

    }
  };

  useEffect(() => {
    // Start the animation when the component mounts
    Animated.sequence([
      // First, animate the logo's position
      Animated.timing(logoPosition, {
        toValue: -40, // Move the logo up (final position)
        duration: 1000, // 1 second animation
        useNativeDriver: true,
      }),
      // Then, animate the opacity of the rest of the screen
      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 500, // Half a second animation
        useNativeDriver: true,
      })
    ]).start();
  }, [logoPosition, screenOpacity]);
  const handleTermsRedirect = () => {
    const url = 'https://starlaunch.ai/terms-of-service.html';
    Linking.openURL(url).catch((err) => {
      console.log('Failed to open URL:', err);
    });
  }
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background }]} keyboardShouldPersistTaps="handled">
          <Animated.Image
            source={require('../../assets/icons/logo.png')}
            style={[
              styles.logo,
              {
                transform: [{ translateY: logoPosition }], // Animate vertical position
              }
            ]}
          />
          <Animated.View style={{ opacity: screenOpacity, width: '100%' }}>
            <Text style={[styles.welcomeText, { color: colors.text }]}>Welcome! Let's get started.</Text>

            <View style={[styles.inputContainer, { backgroundColor: colors.containerBackground }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Email"
                placeholderTextColor={colors.text}
                value={email}
                onChangeText={(text) => setEmail(text)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Image source={require('../../assets/icons/email.png')} style={[styles.icon, { tintColor: colors.icon }]} />
            </View>

            <View style={[styles.inputContainer, { backgroundColor: colors.containerBackground }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Password"
                placeholderTextColor={colors.text}
                secureTextEntry={!passwordVisible}
                value={password}
                onChangeText={(text) => setPassword(text)}
              />
              <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
                <Image
                  source={passwordVisible
                    ? require('../../assets/icons/password_visible.png')
                    : require('../../assets/icons/password.png')
                  }
                  style={[styles.passwordicon, { tintColor: colors.icon }]}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <View style={styles.rememberMeContainer}>
                <TouchableOpacity onPress={() => setRememberMe(!rememberMe)}>
                  <Image
                    source={rememberMe
                      ? require('../../assets/icons/check.png')
                      : require('../../assets/icons/uncheck.png')}
                    style={[styles.checkboxImage, { tintColor: colors.icon }]}
                  />
                </TouchableOpacity>
                <Text style={[styles.rememberMeText, { color: colors.text }]}>Remember me</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                <Text style={[styles.forgotText, { color: colors.text }]}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              style={[styles.loginButton, { backgroundColor: colors.background === '#FFFFFF' ? '#003BE2' : 'white' }]} // Check light mode and apply appropriate color
            >
              {loading ? (<ActivityIndicator size="small" color={colors.background} />) : (<Text style={[styles.loginButtonText, { color: colors.background === '#FFFFFF' ? 'white' : 'black' }]}>
                Login
              </Text>)}

            </TouchableOpacity>

            <View style={styles.orContainer}>
              <View style={[styles.line, { backgroundColor: colors.divider }]} />
              <Text style={[styles.orText, { color: colors.text }]}>Or login with</Text>
              <View style={[styles.line, { backgroundColor: colors.divider }]} />
            </View>

            <View style={styles.socialContainer}>
              <TouchableOpacity onPress={() => handleGoogleLogin()}>
                <Image source={require('../../assets/icons/google.png')} style={styles.socialIcon} />
              </TouchableOpacity>
              {/* <Image source={require('../../assets/icons/facebook.png')} style={styles.socialIcon} />
            <Image source={require('../../assets/icons/apple.png')} style={styles.socialIcon} /> */}
            </View>

            <View style={styles.signupContainer}>
              <Text style={[styles.dontHaveText, { color: colors.text }]}>Don't have an account? {' '}</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                <Text style={[styles.signUpText, { color: colors.signupText }]}>Sign Up</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flex: 1 }} />

            <Text style={[styles.termsText, { color: colors.text }]}>
              By Signing In you are agreeing to all our{'\n'}
              <TouchableOpacity  onPress={handleTermsRedirect}>
                <Text style={[styles.termsLink, { color: colors.termsLink }]}>Terms & Conditions.</Text>
              </TouchableOpacity>
            </Text>
          </Animated.View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginTop: 60,
  },
  welcomeText: {
    fontSize: 22,
    marginVertical: 20,
    marginBottom: 40,
    fontFamily: 'DMSans-Regular',
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    height: 50,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    margin: 4,
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  input: {
    fontFamily: 'DMSans-Regular',
    flex: 1,
    fontSize: 18,
    paddingVertical: 10,
    fontWeight: '300',
  },
  icon: {
    width: 24,
    height: 20,
  },
  passwordicon: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxImage: {
    width: 24,
    height: 24,
    marginRight: 5,
  },
  rememberMeText: {
    fontFamily: 'DMSans-Regular',
    marginLeft: 5,
  },
  forgotText: {
    fontFamily: 'DMSans-Regular',
    color: 'white',
  },
  loginButton: {
    height: 60,
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  loginButtonText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    fontWeight: '700',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
    marginTop: 10,
  },
  line: {
    height: 1,
    flex: 1,
    backgroundColor: 'white',
    marginHorizontal: 10,
  },
  orText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    marginBottom: 20,
    alignSelf: 'center',
  },
  socialIcon: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
  },
  signupContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dontHaveText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
  },
  signUpText: {
    fontFamily: 'DMSans-Regular',
    color: 'white',
    fontWeight: 'bold',
  },
  termsText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 30,
    marginTop: 'auto',
  },
  termsLink: {
    fontFamily: 'DMSans-Regular',
    fontWeight: '700',
  },
});
