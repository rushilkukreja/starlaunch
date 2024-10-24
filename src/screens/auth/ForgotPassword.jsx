import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';
import auth from '@react-native-firebase/auth';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();
  const [email, setEmail] = useState('');

  const showFlyDroneAlert = (message) => {
    Alert.alert('Star Launch', message);
  };

  const handlePasswordReset = async () => {
    if (!email) {
      showFlyDroneAlert('Please enter your email.');
      return;
    }

    try {
      await auth().sendPasswordResetEmail(email);
      showFlyDroneAlert('Password reset email sent!');
      navigation.goBack(); // Navigate back to login after email is sent
    } catch (error) {
      switch (error.code) {
        case 'auth/invalid-email':
          showFlyDroneAlert('Invalid email address format.');
          break;
        case 'auth/user-not-found':
          showFlyDroneAlert('No user found with this email.');
          break;
        default:
          showFlyDroneAlert('Something went wrong. Please try again later.');
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
          keyboardShouldPersistTaps="handled"
        >
          <TouchableOpacity style={styles.backContainer} onPress={() => navigation.goBack()}>
            <Image
              source={require('../../assets/addDroneicons/back.png')}
              style={[styles.backIcon, { backgroundColor: colors.settingBackground }]}
            />
          </TouchableOpacity>
          {/* Logo */}
          <Image source={require('../../assets/icons/logo.png')} style={styles.logo} />

          {/* Heading */}
          <Text style={[styles.headingText, { color: colors.text }]}>
            Reset Your Password
          </Text>

          {/* Email Input Field */}
          <View style={[styles.inputContainer, { backgroundColor: colors.containerBackground }]}>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter your email"
              placeholderTextColor={colors.text}
              value={email}
              onChangeText={(text) => setEmail(text)}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Image source={require('../../assets/icons/email.png')} style={[styles.icon, { tintColor: colors.icon }]} />
          </View>

          {/* Send Email Button */}
          <TouchableOpacity
            onPress={handlePasswordReset}
            style={[styles.sendButton, { backgroundColor: colors.background === '#FFFFFF' ? '#003BE2' : 'white' }]}
          >
            <Text style={[styles.sendButtonText, { color: colors.background === '#FFFFFF' ? 'white' : 'black' }]}>
              Send Email
            </Text>
          </TouchableOpacity>

          {/* Go Back Button */}
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.goBackText, { color: colors.text }]}>Go back to Login</Text>
          </TouchableOpacity>
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
  },
  backContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    top: 20,
    left: 20,
  },
  backIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    borderRadius: 10,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginTop: 80,
  },
  headingText: {
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
  sendButton: {
    height: 60,
    width: '100%',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  sendButtonText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    fontWeight: '700',
  },
  goBackText: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    marginTop: 20,
    textAlign: 'center',
  },
});
