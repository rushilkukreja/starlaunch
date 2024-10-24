import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import React , { useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import SettingsScreen from '../screens/module/SettingsScreen';
import Profile from '../screens/Profile/Profile'; 
import Chatbot from '../screens/Chatbot/Chatbot';
import Location from '../screens/Location/Location';
import Dashboard from '../screens/Home/Home';
import { useTheme } from '@react-navigation/native';
import { useDispatch } from 'react-redux';
import { setTheme } from '../features/theme/themeSlice';
import AsyncStorage from '@react-native-async-storage/async-storage';
const Tab = createBottomTabNavigator();

const MainNavigation = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const getStoredTheme = async () => {
          const storedTheme = await AsyncStorage.getItem('theme');
          if (storedTheme) {
            console.log(`Stored theme found: ${storedTheme}`);
            dispatch(setTheme(storedTheme));
          }else{
            console.log('No theme stored, using default or device theme.');
          }
        };
        getStoredTheme();
      }, [dispatch]);
    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarHideOnKeyboard: true,
            }}
            tabBar={(props) => <FlyDroneBottomTab {...props} />}
        >
            <Tab.Screen name={"Home"} component={Dashboard} />
            <Tab.Screen name={"Location"} component={Location} />
            <Tab.Screen name={"Chatbot"} component={Chatbot} />
            <Tab.Screen name={"Profile"} component={Profile} />
        </Tab.Navigator>
    );
};

const FlyDroneBottomTab = ({ state, descriptors, navigation }) => {
    const { colors } = useTheme();

    return (
        <View style={[styles.tabBar, { backgroundColor: colors.tabBarColor }]}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label = options.tabBarLabel !== undefined
                    ? options.tabBarLabel
                    : options.title !== undefined
                        ? options.title
                        : route.name;

                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name, route.params);
                    }
                };

                const onLongPress = () => {
                    navigation.emit({
                        type: 'tabLongPress',
                        target: route.key,
                    });
                };

                // Get different icons for focused and not focused states
                const getIcon = (routeName, isFocused) => {
                    switch (routeName) {
                        case 'Home':
                            return isFocused
                                ? require('../assets/dashboardicons/home-focused.png')
                                : require('../assets/dashboardicons/home.png');
                        case 'Location':
                            return isFocused
                                ? require('../assets/dashboardicons/location.png')
                                : require('../assets/dashboardicons/location.png');
                        case 'Chatbot':
                            return isFocused
                                ? require('../assets/dashboardicons/chatbot-focused.png')
                                : require('../assets/dashboardicons/chatbot.png');
                        case 'Profile':
                            return isFocused
                                ? require('../assets/dashboardicons/profile.png')
                                : require('../assets/dashboardicons/profile.png');
                        default:
                            return isFocused
                                ? require('../assets/dashboardicons/home-focused.png')
                                : require('../assets/dashboardicons/home.png');
                    }
                };

                return (
                    <TouchableOpacity
                        key={route.key}
                        accessibilityRole="button"
                        accessibilityState={isFocused ? { selected: true } : {}}
                        accessibilityLabel={options.tabBarAccessibilityLabel}
                        testID={options.tabBarTestID}
                        onPress={onPress}
                        onLongPress={onLongPress}
                        style={[styles.tabItem, isFocused && styles.focusedTab]}
                    >
                        <View style={[styles.iconWrapper, { backgroundColor: colors.tabBarColor }]}>
                            <View
                                style={[styles.iconContainer, { backgroundColor: isFocused ? '#FFFFFF' : 'transparent' }]}
                            >
                                <Image
                                    style={[styles.icon, { tintColor: isFocused ? '#003BE2' : '#000000' }]}
                                    source={getIcon(route.name, isFocused)}
                                />
                            </View>
                        </View>

                        <Text style={[styles.tabLabel, { color: isFocused ? '#003BE2' : '#000000' }]}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    tabBar: {
        position: 'absolute',
        bottom: 12,
        left: 20,
        right: 20,
        height: 80,
        backgroundColor: '#FFFFFF',
        borderRadius: 50,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainer: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
    },
    icon: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
    },
    tabLabel: {
        fontSize: 12,
    },
});

export default MainNavigation;
