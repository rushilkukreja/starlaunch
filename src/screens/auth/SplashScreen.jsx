import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Animated, Easing } from 'react-native';
import { useNavigation, useTheme } from '@react-navigation/native';

export default function SplashScreen() {
  const navigation = useNavigation();
  const { colors } = useTheme();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const titlePosition = useRef(new Animated.Value(50)).current;

  const rocketPositionY = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const rocketPositionX = useRef(new Animated.Value(-Dimensions.get('window').width * 0.3)).current;

  const rocketRotation = useRef(new Animated.Value(0)).current;
  const rocketHover = useRef(new Animated.Value(0)).current;
  const rocketScale = useRef(new Animated.Value(1)).current;
  const footerOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rocketHover, {
          toValue: -10,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rocketHover, {
          toValue: 0,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(rocketScale, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(rocketScale, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(titlePosition, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(rocketPositionY, {
          toValue: -500,
          duration: 1500,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(rocketPositionX, {
          toValue: -50,
          duration: 1500,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
        Animated.timing(rocketRotation, {
          toValue: 1,
          duration: 1500,
          easing: Easing.out(Easing.exp),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(footerOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.navigate('Login');
    }, 4100);

    return () => clearTimeout(timer);
  }, [navigation, logoOpacity, logoScale, titlePosition, rocketPositionY, rocketPositionX, rocketRotation, rocketHover, rocketScale, footerOpacity]);

  const rocketRotationInterpolate = rocketRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['-45deg', '0deg'],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.rocketContainer,
          {
            transform: [
              { translateY: rocketPositionY },
              { translateX: rocketPositionX },
              { translateY: rocketHover },
              { rotate: rocketRotationInterpolate },
              { scale: rocketScale },
            ],
          },
        ]}
      >
        <Image
          source={require('../../assets/icons/rocket2.png')}
          style={styles.rocketImage}
        />
      </Animated.View>

      <View style={styles.logoContainer}>
        <Animated.Image
          source={require('../../assets/icons/logo.png')}
          style={[styles.logo, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
        />
        <Animated.Text
          style={[
            styles.title,
            { transform: [{ translateY: titlePosition }], color: colors.text },
          ]}
        >
          STAR LAUNCH
        </Animated.Text>
      </View>

      <Animated.Text
        style={[styles.footerText, { opacity: footerOpacity, color: colors.text }]}
      >
        By StarLaunch Technologies
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F2452',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  rocketContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  rocketImage: {
    width: 227.86,
    height: 302.43,
    resizeMode: 'contain',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  logo: {
    width: 160,
    height: 160,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginTop: 20,
  },
  footerText: {
    color: 'white',
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
  },
});
