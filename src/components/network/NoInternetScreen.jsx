import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@react-navigation/native';


const NoInternetScreen = ({ onRetry }) => {
  const { colors } = useTheme();
  return (
    <View style={[styles.container,]}>
      <Text style={styles.text}>No Internet Connection</Text>
      <Text style={styles.subText}>Please check your connection and try again.</Text>
      <TouchableOpacity onPress={onRetry}>
        <Image source={require('../../assets/icons/network.png')} style={styles.refreshIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8d7da',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#721c24',
  },
  subText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#721c24',
  },
  refreshIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
});

export default NoInternetScreen;
