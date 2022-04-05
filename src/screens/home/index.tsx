import {useNavigation} from '@react-navigation/core';
import React, {FC, useEffect, useState} from 'react';
import {
  Dimensions,
  Keyboard,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {ScrollView} from 'react-native-gesture-handler';
import Modal from 'react-native-modal';
import SegmentedControlTab from 'react-native-segmented-control-tab';
import {Yelp} from '../../core/api/yelp';
import {YelpCarouselCheapEats} from '../../core/api/yelp-carousel-cheap-eats';
import {YelpCarouselDiscover} from '../../core/api/yelp-carousel-discover';
import {YelpCarouselHot} from '../../core/api/yelp-carousel-hot';
import {YelpCarouselNearMe} from '../../core/api/yelp-carousel-near-me';
import {YelpSearchFilter} from '../../core/api/yelp-search-filter';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-google-signin/google-signin';
// import auth from "@react-native-firebase/auth";

export const HomeScreen: FC = () => {
  const navigation = useNavigation();
  const backgroundStyle = {
    backgroundColor: '#fd4f57',
  };
  const SLIDER_WIDTH = Dimensions.get('window').width;
  const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.8);
  const ITEM_HEIGHT = Math.round((ITEM_WIDTH * 3) / 4);
  const [location, setLocation] = useState('Ann Arbor');

  const [isModalVisible, setModalVisible] = useState(false);

  const [isOpenClosed, setIsOpenClosed] = useState(0);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const [value, setValue] = useState(true);

  const cities = ['Ann Arbor', 'Grand Rapids', 'Chicago'];

  const openClosedOptions = ['All', 'Open Only'];

  const [loggedIn, setloggedIn] = useState(false);
  const [userInfo, setuserInfo] = useState(null);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    Keyboard.dismiss();
  };

  SystemNavigationBar.setNavigationColor('#fd4f57');

  const signIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const tokens = await GoogleSignin.signIn();
      console.log(tokens);
      setloggedIn(true);
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
        alert('Cancel');
      } else if (error.code === statusCodes.IN_PROGRESS) {
        alert('Signin in progress');
        // operation (f.e. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        alert('PLAY_SERVICES_NOT_AVAILABLE');
        // play services not available or outdated
      } else {
        alert(error);
        // some other error happened
      }
    }
  };

  const signOut = async () => {
    try {
      await GoogleSignin.revokeAccess();
      await GoogleSignin.signOut();
      // auth()
      //   .signOut()
      //   .then(() => alert("Your are signed out!"));
      setloggedIn(false);
      setuserInfo([]);
    } catch (error) {
      console.error(error);
    }
  };

  const onAuthStateChanged = user => {
    setuserInfo(user);
  };

  useEffect(() => {
    GoogleSignin.configure({
      scopes: ['email'], // what API you want to access on behalf of the user, default is email and profile
      webClientId:
        '862454311308-89tjf9m0607d4t3uh3joic2h61lr27a8.apps.googleusercontent.com', // client ID of type WEB for your server (needed to verify user ID and offline access)
      offlineAccess: true, // if you want to access Google API on behalf of the user FROM YOUR SERVER
    });
  }, []);

  // const toggleOpenClosed = () => {
  //   setIsOpenClosed(!isOpenClosed);
  // };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar animated={true} backgroundColor="#fd4f57" />
      <View style={styles.contentView}>
        <View style={styles.locationContainer}>
          <View style={styles.changeLocationContainer}>
            <TouchableOpacity
              onPress={toggleModal}
              style={styles.changeLocationText}>
              <Icon
                size={22}
                name="location-pin"
                type="material"
                color="black"
                style={{marginRight: 10}}
                tvParallaxProperties={undefined}
              />
              <Text style={styles.locationTitle}>Location: {location}</Text>
              <Icon
                size={20}
                name="keyboard-arrow-down"
                type="material"
                color="black"
                tvParallaxProperties={undefined}
              />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.searchContainer}>
          <YelpSearchFilter location={location} />
        </View>
        <View style={{alignItems: 'center'}}>
          {/* {!loggedIn ? (
            <GoogleSigninButton
              style={{width: 192, height: 48}}
              size={GoogleSigninButton.Size.Wide}
              color={GoogleSigninButton.Color.Dark}
              onPress={signIn}
            />
          ) : (
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 6,
              }}>
              <Text>Welcome {userInfo ? userInfo.displayName : ''}</Text>
              <TouchableOpacity onPress={signOut}>
                <Text>Sign Out</Text>
              </TouchableOpacity>
            </View>
          )} */}
        </View>
        <ScrollView style={styles.bottomModal}>
          <Text style={styles.title}>Our Pick</Text>
          <View style={styles.scrollContentContainer}>
            <Yelp location={location} />
          </View>
          <View
            style={{
              height: 6,
              marginTop: 10,
              backgroundColor: '#F0F0F0',
            }}
          />
          <Text style={styles.title}>Discover Restaurants</Text>
          <YelpCarouselDiscover location={location} />
          <View
            style={{
              height: 6,
              marginTop: 15,
              backgroundColor: '#F0F0F0',
            }}
          />
          <Text style={styles.title}>Restaurants Near Me</Text>
          <YelpCarouselNearMe location={location} />
          <View
            style={{
              height: 6,
              marginTop: 15,
              backgroundColor: '#F0F0F0',
            }}
          />
          <Text style={styles.title}>Cheap Eats</Text>
          <YelpCarouselCheapEats location={location} />
          <View
            style={{
              height: 6,
              marginTop: 15,
              backgroundColor: '#F0F0F0',
            }}
          />
          <Text style={styles.title}>Highly Rated</Text>
          <YelpCarouselHot location={location} />
          <View style={{height: 100}} />
        </ScrollView>
      </View>
      <Modal
        testID={'modal'}
        isVisible={isModalVisible}
        onBackdropPress={toggleModal}
        onBackButtonPress={toggleModal}
        style={styles.view}
        backdropOpacity={0.3}>
        <View style={styles.content}>
          <Icon
            size={32}
            name="map"
            type="material"
            color="#fd4f57"
            style={{marginBottom: 10}}
            tvParallaxProperties={undefined}
          />
          <Text style={styles.contentTitle}>Choose a location</Text>
          <SegmentedControlTab
            values={cities}
            selectedIndex={selectedIndex}
            onTabPress={setSelectedIndex}
            tabStyle={{borderColor: '#fd4f57', borderWidth: 2}}
            tabsContainerStyle={{height: 40}}
            activeTabStyle={{backgroundColor: '#fd4f57'}}
            tabTextStyle={{color: '#fd4f57', fontWeight: 'bold'}}
          />
          <TouchableOpacity
            onPress={() => {
              toggleModal();
              setLocation(cities[selectedIndex]);
            }}
            style={styles.checkButton}>
            <Icon
              size={32}
              name="check"
              type="material"
              color="white"
              tvParallaxProperties={undefined}
            />
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const SLIDER_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.9);
const ITEM_HEIGHT = Math.round((ITEM_WIDTH * 3) / 4);
const styles = StyleSheet.create({
  content: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  contentTitle: {
    fontSize: 20,
    marginBottom: 12,
  },
  contentText: {
    fontSize: 16,
    marginBottom: 12,
  },
  applyButton: {
    color: '#fd4f57',
    fontWeight: 'bold',
    fontSize: 18,
    marginVertical: 10,
  },
  view: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  randomContainer: {
    backgroundColor: 'white',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  randomOuter: {
    backgroundColor: '#E7E7E7',
  },
  pickContainer: {
    backgroundColor: 'white',
    borderTopRightRadius: 10,
    borderTopLeftRadius: 10,
  },
  pickOuter: {
    backgroundColor: '#fd4f57',
  },
  bottomModal: {
    marginBottom: 50,
    backgroundColor: 'white',
  },
  scrollContentContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginHorizontal: 15,
  },
  sectionContainer: {
    width: '100%',
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
  },
  locationContainer: {
    backgroundColor: '#fd4f57',
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    marginLeft: -(SLIDER_WIDTH - ITEM_WIDTH - (SLIDER_WIDTH - ITEM_WIDTH) / 2),
    marginRight: SLIDER_WIDTH - ITEM_WIDTH - (SLIDER_WIDTH - ITEM_WIDTH) / 2,
    justifyContent: 'center',
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'row',
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    backgroundColor: '#fd4f57',
    padding: 10,
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 25,
    fontWeight: '500',
    textAlign: 'center',
    color: 'white',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'left',
    marginLeft: 15,
    color: 'black',
    marginTop: 10,
    marginBottom: 5,
  },
  titleBot: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
    color: 'black',
    marginTop: 20,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '500',
    textAlign: 'center',
    color: 'black',
    paddingVertical: 5,
    paddingRight: 10,
  },
  contentView: {
    borderTopColor: '#4c4845',
    justifyContent: 'center',
  },
  image: {
    flex: 1,
    justifyContent: 'center',
  },
  rotdContainer: {
    backgroundColor: 'black',
    justifyContent: 'center',
    borderBottomColor: '#C0C0C0',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    flex: 1,
    marginVertical: 0,
  },
  searchContainer: {
    backgroundColor: '#fd4f57',
  },
  highlight: {
    fontWeight: '700',
  },
  changeLocationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeLocationText: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  checkButton: {
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    backgroundColor: '#fd4f57',
    width: 100,
    height: 50,
    borderRadius: 50 / 2,
    justifyContent: 'center',
    margin: 15,
  },
  addButton: {
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    backgroundColor: '#fd4f57',
    width: 50,
    height: 50,
    margin: 10,
    borderRadius: 50 / 2,
    justifyContent: 'center',
    position: 'absolute',
    bottom: 50,
    right: 0,
  },
});
