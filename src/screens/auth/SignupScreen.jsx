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
import { signup } from '../../services/Firebase/FirebaseServices';
export default function SignupScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [userName, setUserName] = useState('');
  const [academics, setAcademics] = useState("");
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const dropdownOptions = ['School', 'University'];
  // Animated values
  const logoPosition = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      BackHandler.exitApp();
      return true;
    });

    return () => backHandler.remove();
  }, []);
  const handleSignUp = async () => {
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();


    // Email and password validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

    if (!userName || !trimmedEmail || !trimmedPassword || !trimmedConfirmPassword || !academics) {
      Alert.alert('Star Launch', 'Please enter all fields!');
      return;
    }

    if (!emailRegex.test(trimmedEmail)) {
      Alert.alert('Star Launch', 'Please enter a valid email address!');
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      Alert.alert('Star Launch', 'Passwords do not match!');
      return;
    }

    if (!passwordRegex.test(trimmedPassword)) {
      Alert.alert('Star Launch', 'Password must be at least 8 characters long, with at least one uppercase letter, one number, and one special character.');
      return;
    }

    setLoading(true);
    try {
      await signup(trimmedEmail, trimmedPassword, userName, academics, navigation);
      console.log(userName, academics, 'user created successfully--jlkjl');

      // navigation.navigate('Login');
    } catch (error) {
      console.log('Error during sign up:', error);
    } finally {
      setLoading(false);

    }
  };
  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoPosition, {
        toValue: -40,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(screenOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      })
    ]).start();
  }, [logoPosition, screenOpacity]);
  const handleSelectOption = (option) => {
    setAcademics(option);
    setDropdownVisible(false);
  };
  const handleTermsRedirect = () => {
    const url = 'https://starlaunch.ai/terms-of-service.html';
    Linking.openURL(url).catch((err) => {
      console.log('Failed to open URL:', err);
    });
  }
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ScrollView
        contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.Image
          source={require('../../assets/icons/logo.png')}
          style={[
            styles.logo,
            {
              transform: [{ translateY: logoPosition }],
            }
          ]}
        />
        <Animated.View style={{ opacity: screenOpacity, width: '100%' }}>
          <Text style={[styles.welcomeText, { color: colors.text }]}>Welcome! Let's get started.</Text>

          <View style={[styles.inputContainer, { backgroundColor: colors.containerBackground }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="User Name"
              placeholderTextColor={colors.text}
              value={userName}
              onChangeText={setUserName}
            />
            <Image source={require('../../assets/icons/user_icon.png')} style={[styles.icon, { tintColor: colors.icon }]} />
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.containerBackground }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Email"
              placeholderTextColor={colors.text}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Image source={require('../../assets/icons/email.png')} style={[styles.icon, { tintColor: colors.icon }]} />
          </View>
          <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)}>
          <View style={[styles.inputContainer, { backgroundColor: colors.containerBackground }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="school/university"
              placeholderTextColor={colors.text}
              value={academics}
              onChangeText={setAcademics}
              keyboardType="text"
              autoCapitalize="none"
              editable={false}
              onPress={() => setDropdownVisible(!dropdownVisible)}
            />
            <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)}>
              <Image source={require('../../assets/icons/dropdown_arrow.png')} style={[styles.icon, { tintColor: colors.icon }]} />
            </TouchableOpacity>
          </View>
          </TouchableOpacity>
          {/* Dropdown Menu */}
          {dropdownVisible && (
            <View style={[styles.dropdown, { backgroundColor: colors.containerBackground }]}>
              {dropdownOptions.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dropdownOption,
                    academics === option && styles.selectedOption, // Highlight selected option with background color
                  ]}
                  onPress={() => handleSelectOption(option)}
                >
                  <Text style={[styles.dropdownText, { color: colors.text }]}>{option}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <View style={[styles.inputContainer, { backgroundColor: colors.containerBackground }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Password"
              placeholderTextColor={colors.text}
              secureTextEntry={!passwordVisible}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
              <Image
                source={
                  passwordVisible
                    ? require('../../assets/icons/visible.png')
                    : require('../../assets/icons/password.png')
                }
                style={[styles.passwordIcon, { tintColor: colors.icon }]}  // Updated style
              />
            </TouchableOpacity>
          </View>

          <View style={[styles.inputContainer, { backgroundColor: colors.containerBackground }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Confirm Password"
              placeholderTextColor={colors.text}
              secureTextEntry={!confirmPasswordVisible}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}>
              <Image
                source={
                  confirmPasswordVisible
                    ? require('../../assets/icons/visible.png')
                    : require('../../assets/icons/password.png')
                }
                style={[styles.passwordIcon, { tintColor: colors.icon }]}  // Updated style
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleSignUp}
            style={[styles.signupButton, { backgroundColor: colors.background === '#FFFFFF' ? '#003BE2' : 'white' }]}
          >
            {loading ? (
              <ActivityIndicator size="small" color={colors.background} />
            ) : (
              <Text style={[styles.signupButtonText, { color: colors.background === '#FFFFFF' ? 'white' : 'black' }]}>
                Sign Up
              </Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={[styles.dontHaveText, { color: colors.text }]}>Already have an account? {' '}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={[styles.loginText, { color: colors.signupText }]}>Login</Text>
            </TouchableOpacity>
          </View>
          <View style={{ flex: 1 }} />
          <Text style={[styles.termsText, { color: colors.text }]}>
            By Signing In you are agreeing to all our{'\n'}
            <TouchableOpacity onPress={handleTermsRedirect}>
              <Text style={[styles.termsLink, { color: colors.termsLink }]}>Terms & Conditions.</Text>
            </TouchableOpacity>
          </Text>
        </Animated.View>
      </ScrollView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginTop: 60,
  },
  welcomeText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 22,
    marginVertical: 20,
    marginBottom: 40,
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
    flex: 1,
    fontSize: 18,
    fontFamily: 'DMSans-Regular',
    paddingVertical: 10,
  },
  icon: {
    width: 24,
    height: 20,
  },
  passwordIcon: {
    width: 26,
    height: 26,
    resizeMode: 'contain',
  },
  signupButton: {
    height: 50,
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  signupButtonText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    fontWeight: '700',
  },
  loginContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dontHaveText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    textAlign: 'center',
  },
  loginText: {
    fontFamily: 'DMSans-Regular',
    fontWeight: 'bold',
  },
  termsText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 30,
    marginTop: '10%',
  },
  termsLink: {
    fontFamily: 'DMSans-Regular',
    fontWeight: '600',
  },
  dropdown: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    width: '35%',
    marginBottom: 20,
    marginLeft: "auto",
    marginTop: -15,
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
