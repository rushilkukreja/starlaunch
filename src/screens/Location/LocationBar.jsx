import React from 'react';
import { View, TextInput, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, useNavigation } from '@react-navigation/native';

const LocationBar = ({placeholder}) => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  return (
    <TouchableOpacity>
      <View style={[styles.searchBar, { backgroundColor: colors.containerBackground }]}>
        <Image source={require('../../assets/icons/searchLocation.png')} style={[styles.searchIcon, { tintColor: colors.icon }]} />
        <TextInput 
          style={[styles.input, { color: colors.inputText }]}
          placeholder={placeholder}
          placeholderTextColor="#B0B0B0"
        />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF30',
    borderRadius: 10,
    paddingLeft: 15,
    height: 50,
  },
  searchIcon: {
    width: 20,
    height: 26,
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize : 18,
    color: '#FFFFFF',
  },
});

export default LocationBar;
