import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import { useTheme, useNavigation } from '@react-navigation/native';

const Headers = ({ title, isHeader, showBackButton, hideLeft,style }) => {
  const { colors } = useTheme();
  const navigation = useNavigation();

  return (
    <View style={[styles.header,{...style,}]}>
      {!hideLeft ? (
        showBackButton ? (
          <TouchableOpacity style={styles.backContainer} onPress={() => navigation.goBack()}>
            <Image
              source={require('../../assets/addDroneicons/back.png')}
              style={[styles.backIcon, { backgroundColor: colors.settingBackground }]}
            />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => navigation.navigate('Home')}>
            <Image source={require('../../assets/icons/logo.png')} style={styles.logo} />
          </TouchableOpacity>
        )
      ) : (
        <View style={styles.placeholder} />  
      )}

      {/* Header Title */}
      <Text style={[styles.headerText, { color: colors.text } ]}>{title}</Text>

      {/* Settings Button */}
      <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Setting')}>
        <Image
          source={require('../../assets/icons/setting.png')}
          style={[
            styles.settingIcon,
            {
              backgroundColor: colors.settingBackground,
              ...isHeader && {
                tintColor: colors.settingIcon,
                backgroundColor: colors.settingActiveBackground,
              },
            },
          ]}
        />
      </TouchableOpacity>
    </View>
  );
};

export default Headers;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  logo: {
    width: 52,
    height: 52,
    resizeMode: 'contain',
    marginTop: -5,
  },
  backContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    borderRadius: 10,
  },
  headerText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'DMSans-Regular',
  },
  headerButton: {
    padding: 5,
  },
  settingIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
    color: '#0F2452',
    borderRadius: 12,
  },
  placeholder: {
    width: 50, 
    height: 50,
  },
});
