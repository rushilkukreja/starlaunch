import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, Linking, Modal } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setTheme } from '../../features/theme/themeSlice';
import { useTheme, useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Headers from '../../components/header/Headers';
import Share from 'react-native-share';
import { TextInput } from 'react-native-gesture-handler';

export default function SettingsScreen() {
  const dispatch = useDispatch();
  const { colors } = useTheme();
  const navigation = useNavigation();
  const selectedTheme = useSelector((state) => state.theme);
  const [isReviewModalVisible, setReviewModalVisible] = useState(false);
  const [reviewText, setReviewText] = useState('');


  const themes = [
    { name: 'Light', image: require('../../assets/settingicons/light.png'), themeKey: 'light' },
    { name: 'Midnight', image: require('../../assets/settingicons/midnight.png'), themeKey: 'blue' },
    { name: 'Dark', image: require('../../assets/settingicons/dark.png'), themeKey: 'dark' },
  ];

  useEffect(() => {
    const getStoredTheme = async () => {
      const storedTheme = await AsyncStorage.getItem('theme');
      if (storedTheme) {
        console.log(`Stored theme found: ${storedTheme}`);
        dispatch(setTheme(storedTheme));
      } else {
        console.log('No theme stored, using default or device theme.');
      }
    };
    getStoredTheme();
  }, [dispatch]);

  const handleThemeSelection = async (themeKey) => {
    dispatch(setTheme(themeKey));
    await AsyncStorage.setItem('theme', themeKey);
    console.log(`Theme selected and stored: ${themeKey}`);
  };

  const handleInstagramRedirect = () => {
    const url = 'https://www.instagram.com/starlaunch';
    Linking.openURL(url).catch((err) => {
      console.error('Failed to open URL:', err);
    });
  };

  // const handleReviewRedirect = () => {
  //   const url = 'https://play.google.com/store';
  //   Linking.openURL(url).catch((err) => {
  //     console.error('Failed to open URL:', err);
  //   });
  // };

  const handleReviewRedirect = () => {
    const url = 'https://play.google.com/store/apps/details?id=com.zawwar';
    Linking.openURL(url).catch((err) => {
      console.error('Failed to open URL:', err);
    });
  };

  const handleShareRedirect = async () => {
    try {
      const shareOptions = {
        title: 'StarLaunch App',
        message: 'Check out this amazing  App!',
        url: 'https://google.com',
      };
      const result = await Share.open(shareOptions);
  
      if (result && result.action === Share.sharedAction) {
        console.log('Shared successfully');
      } else if (result && result.action === Share.dismissedAction) {
        console.log('User dismissed the share dialog');
      }
    } catch (err) {
      console.log('Failed to share:', err);
    }
  };
  

  const handleWebsiteRedirect = () => {
    const url = 'https://starlaunch.ai';
    Linking.openURL(url).catch((err) => {
      console.log('Failed to open URL:', err);
    });
  };

  const handleTwitterRedirect = () => {
    const url = 'https://x.com/StarLaunchAI';
    Linking.openURL(url).catch((err) => {
      console.log('Failed to open URL:', err);
    });
  };

  const handleEmailRedirect = () => {
    const url = 'mailto:contact@starlaunch.ai';
    Linking.openURL(url).catch((err) => {
      console.log('Failed to open URL:', err);
    });
  };
  const handlePrivacyRedirect = () => {
    const url = 'https://starlaunch.ai/privacy-policy.html';
    Linking.openURL(url).catch((err) => {
      console.log('Failed to open URL:', err);
    });
  }
  const handleTermsRedirect = () => {
    const url = 'https://starlaunch.ai/terms-of-service.html';
    Linking.openURL(url).catch((err) => {
      console.log('Failed to open URL:', err);
    });
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Headers title="Settings" isHeader={true} />

      {/* Scrollable Content */}
      <ScrollView
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Theme</Text>

        <LinearGradient
          colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.3)']}
          style={[
            { backgroundColor: colors.containerBackground },
            styles.themeContainer,
          ]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        >
          {themes.map((theme) => (
            <View key={theme.name} style={styles.themeOption}>
              <Image source={theme.image} style={styles.themeImage} />
              <Text style={[styles.themeText, { color: colors.text }]}>{theme.name}</Text>
              <TouchableOpacity
                style={styles.radioButton}
                onPress={() => handleThemeSelection(theme.themeKey)}
              >
                <View
                  style={[
                    styles.radioIcon,
                    { borderColor: colors.radioActive },

                    selectedTheme === theme.themeKey && styles.radioIconSelected,
                  ]}
                />
              </TouchableOpacity>
            </View>
          ))}
        </LinearGradient>

        {/* Contribute Section */}
        <View style={styles.contributeSection}>
          <Text style={[styles.contributeTitle, { color: colors.text }]}>Contribute</Text>

          <View style={styles.contributeItem}>
            <TouchableOpacity style={styles.contributeButton} onPress={handleReviewRedirect}>
              <Text style={[styles.contributeText, { color: colors.text }]}>Write a Review</Text>
              <Image source={require('../../assets/settingicons/review.png')} style={[styles.contributeIcon, { tintColor: colors.icon }]} />
            </TouchableOpacity>
          </View>

          {/* <Modal
            transparent={true}
            visible={isReviewModalVisible}
            onRequestClose={() => {
              setReviewModalVisible(false);
              setReviewText(''); // Clear text when modal is closed
            }}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <Text style={styles.modalTitle}>Write a Review</Text>
                <TextInput
                  style={styles.reviewInput}
                  placeholder="Enter your review here"
                  value={reviewText}
                  onChangeText={setReviewText}
                  multiline
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    onPress={() => {
                      setReviewModalVisible(false);
                      setReviewText(''); // Clear text when cancel is pressed
                    }}
                  >
                    <Text style={styles.cancelButton}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => {
                      // Handle submit logic here
                      console.log('Review submitted:', reviewText);
                      setReviewModalVisible(false);
                      setReviewText(''); // Clear text after submitting the review
                    }}
                  >
                    <Text style={styles.submitButton}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal> */}
          
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.contributeItem}>
            <TouchableOpacity style={styles.contributeButton} onPress={handleShareRedirect}>
              <Text style={[styles.contributeText, { color: colors.text }]}>Share with friends</Text>
              <Image source={require('../../assets/settingicons/share.png')} style={[styles.contributeIcon, { tintColor: colors.icon }]} />
            </TouchableOpacity>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

        </View>

        {/* Reach Out Section */}
        <View style={styles.contributeSection}>
          <Text style={[styles.contributeTitle, { color: colors.text }]}>Reach Out</Text>

          <View style={styles.contributeItem} >
            <TouchableOpacity style={styles.contributeButton} onPress={handleInstagramRedirect}>
              <Text style={[styles.contributeText, { color: colors.text }]}>Follow on Instagram</Text>
              <Image source={require('../../assets/settingicons/instagram.png')} style={[styles.contributeIcon, { tintColor: colors.icon }]} />
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.contributeItem}>
            <TouchableOpacity style={styles.contributeButton} onPress={handleTwitterRedirect}>
              <Text style={[styles.contributeText, { color: colors.text }]}>Follow on X</Text>
              <Image source={require('../../assets/settingicons/twitter.png')} style={[styles.contributeIcon, { tintColor: colors.icon }]} />
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.contributeItem}>
            <TouchableOpacity style={styles.contributeButton} onPress={handleEmailRedirect}>
              <Text style={[styles.contributeText, { color: colors.text }]}>Email</Text>
              <Text style={[styles.emailIcon, { color: colors.text }]}>@</Text>
              {/* <Image source={require('../../assets/settingicons/twitter.png')} style={[styles.contributeIcon, { tintColor: colors.icon }]} /> */}
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

        </View>

        {/* About */}
        <View style={styles.contributeSection}>
          <Text style={[styles.contributeTitle, { color: colors.text }]}>About</Text>

          <View style={styles.contributeItem}>
            <TouchableOpacity style={styles.contributeButton} onPress={handleWebsiteRedirect}>
              <Text style={[styles.contributeText, { color: colors.text }]}>Website</Text>
              <Image source={require('../../assets/icons/website.png')} style={[styles.contributeIcon, { tintColor: colors.icon }]} />
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.contributeItem}>
            <TouchableOpacity style={styles.contributeButton} onPress={handleInstagramRedirect}>
              <Text style={[styles.contributeText, { color: colors.text }]}>Author</Text>
              <Image source={require('../../assets/icons/author.png')} style={[styles.contributeIcon, { tintColor: colors.icon }]} />
            </TouchableOpacity>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

        </View>

        {/* Other */}
        <View style={styles.contributeSection}>
          <Text style={[styles.contributeTitle, { color: colors.text }]}>Other</Text>

          <View style={styles.contributeItem}>
            <TouchableOpacity style={styles.contributeButton} onPress={handlePrivacyRedirect}>
              <Text style={[styles.contributeText, { color: colors.text }]}>Privacy Policy</Text>
              <Image source={require('../../assets/icons/privacy.png')} style={[styles.contributeIcon, { tintColor: colors.icon }]} />
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          <View style={styles.contributeItem}>
            <TouchableOpacity style={styles.contributeButton} onPress={handleTermsRedirect}>
              <Text style={[styles.contributeText, { color: colors.text }]}>Terms of Services</Text>
              <Image source={require('../../assets/icons/terms_of_services.png')} style={[styles.contributeIcon, { tintColor: colors.icon }]} />
            </TouchableOpacity>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

  },
  scrollViewContent: {
    paddingBottom: 20,
    flexGrow: 1,
    padding: 20,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'DMSans-Regular',
    marginBottom: 10,
  },
  themeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderRadius: 12,
    padding: 20,
  },
  themeOption: {
    alignItems: 'center',
    width: '30%',
  },
  themeImage: {
    width: 90,
    height: 60,
    marginBottom: 5,
  },
  themeText: {
    color: 'white',
    fontFamily: 'DMSans-Regular',
    marginTop: 5,
  },
  radioButton: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'transparent',
    borderWidth: 2,

  },
  radioIconSelected: {
    backgroundColor: '#0F2452',
  },

  contributeSection: {
    marginTop: 30,
    borderRadius: 12,
  },
  contributeTitle: {
    fontSize: 18,
    fontFamily: 'DMSans-Regular',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  contributeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  contributeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  contributeText: {
    fontSize: 16,
    fontFamily: 'DMSans-Regular',
  },
  emailIcon: {
    fontSize: 24,
    fontFamily: 'DMSans-Regular',
  },
  contributeIcon: {
    width: 24,
    height: 24,
    tintColor: 'white',
  },
  divider: {
    height: 1,
    backgroundColor: 'white',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  reviewInput: {
    height: 120,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    backgroundColor: '#FF6347',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#0F2452',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
