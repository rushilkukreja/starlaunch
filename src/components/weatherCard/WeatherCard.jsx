import React from 'react';
import { View, Text, Image, StyleSheet, ActivityIndicator } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '@react-navigation/native';

const WeatherCard = ({ loading, temperature, windSpeed, precipitation, windGust, pressure, windDirection }) => {
  const { colors } = useTheme();

  const getWindDirection = (deg) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round((deg % 360) / 45);
    return directions[index];
  };

  return (
    <LinearGradient
      colors={['#ffffff10', '#ffffff30', '#ffffff20', '#ffffff30']}
      style={[styles.weatherCard, { backgroundColor: colors.containerBackground }]}
      start={{ x: 0.3, y: 0.1 }}
      end={{ x: 1, y: 0.2 }}
    >
      {/* Header */}
      <View style={styles.header}>
        <Image source={require('../../assets/icons/weather.png')} style={[styles.headerIcon, { tintColor: colors.icon }]} />
        <Text style={[styles.headerText, { color: colors.text }]}>Weather Details</Text>
      </View>

      {/* Weather Details or Loader */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : (
        <View style={styles.detailsContainer}>
          {/* Left Column */}
          <View style={styles.detailColumn}>
            <View style={styles.detailRow}>
              <Image source={require('../../assets/icons/temperature.png')} style={[styles.detailIcon, { tintColor: colors.icon }]} />
              <View style={styles.labelContainer}>
                <Text style={[styles.detailText, { color: colors.text }]}>Temperature</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{temperature}°C</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Image source={require('../../assets/icons/windgusts.png')} style={[styles.detailIcon, { tintColor: colors.icon }]} />
              <View style={styles.labelContainer}>
                <Text style={[styles.detailText, { color: colors.text }]}>Wind Gusts</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{windGust} mph</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Image source={require('../../assets/icons/precipitation.png')} style={[styles.detailIcon, { tintColor: colors.icon }]} />
              <View style={styles.labelContainer}>
                <Text style={[styles.detailText, { color: colors.text }]}>Precipitation</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{precipitation}"</Text>
              </View>
            </View>
          </View>

          {/* Right Column */}
          <View style={styles.detailColumn}>
            <View style={styles.detailRow}>
              <Image source={require('../../assets/icons/wind.png')} style={[styles.detailIcon, { tintColor: colors.icon }]} />
              <View style={styles.labelContainer}>
                <Text style={[styles.detailText, { color: colors.text }]}>Wind</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{windSpeed} mph {getWindDirection(windDirection)}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Image source={require('../../assets/icons/air_pressure.png')} style={[styles.detailIcon, { tintColor: colors.icon }]} />
              <View style={styles.labelContainer}>
                <Text style={[styles.detailText, { color: colors.text }]}>Air Pressure</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{pressure} Hg</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  weatherCard: {
    borderRadius: 15,
    padding: 18,
    // margin: 10,
    paddingBottom: 10,
    borderWidth: 0.5,
    borderColor: '#FFFFFF50',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: '500',
    fontFamily: 'DMSans-Regular',
  },
  detailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailColumn: {
    flex: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailIcon: {
    width: 30,
    height: 30,
    marginRight: 10,
  },
  labelContainer: {
    flexDirection: 'column',
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'DMSans-Regular',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'DMSans-Regular',
  },
});

export default WeatherCard;
