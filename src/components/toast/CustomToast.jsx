import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CustomToast = ({ text1, text2, props }) => (
  <View style={styles.container}>
    <Text style={styles.text}>{text1}</Text>
    <Text style={styles.subtext}>{text2}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#333',
    borderWidth: 2,
    borderColor: '#00f',
    width: '90%', 
    alignSelf: 'center',
    marginBottom: 20,
  },
  text: {
    color: '#fff', 
    fontWeight: 'bold',
  },
  subtext: {
    color: '#fff',
  },
});

export default CustomToast;
