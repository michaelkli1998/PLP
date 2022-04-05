import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import React, {FC, useEffect, useState} from 'react';
import {
  Dimensions,
  ImageBackground,
  Linking,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import Spinner from 'react-native-spinkit';
import Swiper from 'react-native-swiper';
import SystemNavigationBar from 'react-native-system-navigation-bar';
import {yelpBusinessResponse, yelpReviewResponse} from '../../types';

SystemNavigationBar.setNavigationColor('#fd4f57');

const config = {
  headers: {
    Authorization:
      'Bearer eu70nmGiCTtxJgzg5h3uL1M3rXa3YTsCpz92As8TQw4B5CJ7A0T37rnZ1n84OEvPgGZNNJi9BuYcjH1wj0Vql0P08jsYBEUjkjK0KPVDXUM4veb3jrZzSVwkQ9r4YHYx',
  },
  params: {
    term: 'Restaurants',
    location: '206 S 5th Ave #300, Ann Arbor, MI 48104',
  },
};

var now = new Date();

const dayPlusOne = (day: number) => {
  if (day === 0) {
    return 6;
  }
  return day - 1;
};

const getTodayOrTomorrow = () => {
  if (now.getHours() > 12) {
    return 'tomorrow';
  }
  return 'today';
};

const addColonToTime = (time: string) => {
  if (parseInt(time.substring(0, 2)) > 12) {
    return (
      (parseInt(time.substring(0, 2)) - 12).toString() +
      ':' +
      time.substring(2) +
      'pm'
    );
  } else if (parseInt(time.substring(0, 2)) === 12) {
    return (
      parseInt(time.substring(0, 2)).toString() + ':' + time.substring(2) + 'pm'
    );
  }
  if (time.substring(0, 2) === '00') {
    return '12:00am';
  }
  if (time.substring(0, 1) === '0') {
    return time.substring(1, 2) + ':' + time.substring(2) + 'am';
  }
  return time.substring(0, 2) + ':' + time.substring(2) + 'am';
};

//@ts-ignore
export const DetailedRestaurantView: FC = ({route}) => {
  const [restaurant, setRestaurants] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isLoadingBus, setLoadingBus] = useState(true);
  const [isLoadingRev, setLoadingRev] = useState(true);

  const [isModalVisible, setModalVisible] = useState(false);

  const [busImages, setBusImages] = useState([]);

  const BannerWidth = Dimensions.get('window').width;
  // const SLIDER_WIDTH = Dimensions.get("window").width;
  // const SLIDER_HEIGHT = Dimensions.get("window").height;
  // const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.9);
  // const ITEM_HEIGHT = Math.round((ITEM_WIDTH * 3) / 4);
  const BannerHeight = Dimensions.get('window').height / 3 - 15;

  const navigation = useNavigation();

  useEffect(() => {
    axios
      .get('https://api.yelp.com/v3/businesses/' + route.params.id, config)
      .then(response => {
        setRestaurants(response.data);
        let tempList = [];
        tempList.push(response.data.image_url);
        tempList = [...response.data.photos];
        if (tempList.length === 0) {
          tempList.push(
            'https://st3.depositphotos.com/23594922/31822/v/600/depositphotos_318221368-stock-illustration-missing-picture-page-for-website.jpg',
          );
        }
        setBusImages(tempList);
        setLoadingBus(false);
      });
  }, []);

  useEffect(() => {
    axios
      .get(
        'https://api.yelp.com/v3/businesses/' + route.params.id + '/reviews',
        config,
      )
      .then(response => {
        setReviews(response.data);
        setLoadingRev(false);
      });
  }, []);

  const business: yelpBusinessResponse =
    restaurant as unknown as yelpBusinessResponse;

  const openMaps = () => {
    const latitude = business.coordinates.latitude;
    const longitude = business.coordinates.longitude;
    const label = business.name;

    const url = Platform.select({
      ios: 'maps:' + latitude + ',' + longitude + '?q=' + label,
      android: 'geo:' + latitude + ',' + longitude + '?q=' + label,
    });

    Linking.openURL(url);
  };

  const callNumber = phone => {
    Linking.openURL(`tel:${phone}`).catch(e => console.warn(e));
  };

  const ratings: yelpReviewResponse = reviews as unknown as yelpReviewResponse;

  if (isLoadingBus || isLoadingRev) {
    return (
      <Spinner
        isVisible={true}
        size={40}
        type={'ThreeBounce'}
        color={'#fd4f57'}
        style={{alignSelf: 'center'}}
      />
    );
  }

  const renderStars = (numStars: number) => {
    var finalStarString = '';
    console.log(numStars);
    var i = 0;
    for (i = 0; i < 5; i++) {
      if (i < numStars) {
        finalStarString += '★';
      } else {
        finalStarString += '☆';
      }
    }
    return finalStarString;
  };

  const renderRatings = () => {
    var i = 0;
    var rows = [];
    if (ratings.reviews) {
      for (i = 0; i < ratings.total; i++) {
        if (ratings.reviews[i]) {
          rows.push(
            <View>
              <Text key={'name' + i * 1.24} style={styles.nameLeftSmall}>
                {ratings.reviews[i].user.name}
              </Text>
              <Text key={'star' + i * 1.25} style={styles.starLeftSmall}>
                {renderStars(ratings.reviews[i].rating)}
              </Text>
              <Text key={i * 1.26} style={styles.reviewsLeftSmall}>
                {ratings.reviews[i].text}
              </Text>
            </View>,
          );
        } else {
          break;
        }
      }
    }
    return rows;
  };

  const renderPage = (image, index) => {
    return (
      <View key={index}>
        <ImageBackground
          style={{
            width: BannerWidth,
            height: BannerHeight,
            opacity: 1,
          }}
          source={{uri: image}}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={{flex: 1}}>
      <View style={styles.contentView}>
        <ScrollView style={styles.bottomModal}>
          {/* <ImageBackground
            imageStyle={styles.imageStyle}
            style={styles.itemContainer}
            source={{
              uri: business.image_url
                ? business.image_url
                : "https://st3.depositphotos.com/23594922/31822/v/600/depositphotos_318221368-stock-illustration-missing-picture-page-for-website.jpg",
            }}
          ></ImageBackground> */}
          <Swiper
            style={styles.wrapper}
            showsButtons={false}
            autoplay={true}
            autoplayTimeout={5}
            dot={
              <View
                style={{
                  backgroundColor: 'rgba(255,255,255,1)',
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginLeft: 3,
                  marginRight: 3,
                  marginTop: 3,
                  marginBottom: 3,
                }}
              />
            }
            activeDot={
              <View
                style={{
                  backgroundColor: '#fd4f57',
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginLeft: 3,
                  marginRight: 3,
                  marginTop: 3,
                  marginBottom: 3,
                }}
              />
            }>
            {busImages.map((image, index) => renderPage(image, index))}
          </Swiper>
          <Text style={styles.titleName}>{business.name}</Text>
          <View style={styles.flexRowContainer}>
            <Text style={styles.titleLeftSmall}>★ {business.rating}/5</Text>
            <Text style={styles.titleLeftSmall}>
              ({business.review_count} reviews)
            </Text>
            {business.price && (
              <>
                <Text style={styles.titleLeftSmall}>•</Text>
                <Text style={styles.titleLeftSmall}>{business.price}</Text>
              </>
            )}
            {business.categories && (
              <>
                <Text style={styles.titleLeftSmall}>•</Text>
                <Text style={styles.titleLeftSmall}>
                  {business.categories[0].title}
                </Text>
              </>
            )}
          </View>
          {business.hours && business.hours[0].is_open_now ? (
            <View style={styles.flexRowContainer}>
              {business.hours &&
                business.hours[0].is_open_now &&
                business.hours[0].open[dayPlusOne(now.getDay())] && (
                  <Text style={styles.openSmall}>
                    Opens until{' '}
                    {addColonToTime(
                      business.hours[0].open[dayPlusOne(now.getDay())].end,
                    )}
                  </Text>
                )}
            </View>
          ) : (
            <View style={styles.flexRowContainer}>
              {business.hours &&
                !business.hours[0].is_open_now &&
                business.hours[0].open[dayPlusOne(now.getDay())] && (
                  <Text style={styles.closedSmall}>
                    Opens at{' '}
                    {addColonToTime(
                      business.hours[0].open[dayPlusOne(now.getDay())].start,
                    )}{' '}
                    {getTodayOrTomorrow()}
                  </Text>
                )}
            </View>
          )}
          {business.phone !== '' && (
            <TouchableOpacity
              onPress={() => callNumber(business.phone)}
              style={styles.flexRowContainer}>
              <Icon
                size={24}
                name="phone"
                type="material"
                color="#fd4f57"
                style={{marginTop: 10, marginRight: 8}}
                tvParallaxProperties={undefined}
              />
              <Text style={styles.title}>{business.display_phone}</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity onPress={openMaps} style={styles.flexRowContainer}>
            <Icon
              size={24}
              name="location-pin"
              type="material"
              color="#fd4f57"
              style={{marginTop: 10, marginRight: 8}}
              tvParallaxProperties={undefined}
            />
            <Text style={styles.title}>
              {route.params.restaurant.location.address1}.
            </Text>
          </TouchableOpacity>
          <View style={styles.flexRowContainer}>
            <Text style={styles.titleLeftSmall}>
              {(route.params.restaurant.distance / 1609.344).toFixed(2)} miles
              away
            </Text>
          </View>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('Pair Lunch Tracker', {
                restaurant: route.params.restaurant,
              })
            }>
            <View
              style={{
                borderWidth: 1.5,
                borderRadius: 20,
                marginHorizontal: 15,
                borderColor: 'black',
                alignItems: 'center',
                marginTop: 10,
                backgroundColor: '#fd4f57',
                paddingVertical: 5,
                flexDirection: 'row',
                justifyContent: 'center',
              }}>
              <Icon
                size={24}
                name="calendar-today"
                type="material"
                color="black"
                style={{marginRight: 8}}
                tvParallaxProperties={undefined}
              />
              <Text style={styles.titleLeftSchedule}>
                Go on a pair lunch here!
              </Text>
            </View>
          </TouchableOpacity>
          <View
            style={{
              height: 6,
              marginTop: 15,
              backgroundColor: '#F0F0F0',
            }}
          />
          <Text style={styles.titleReviews}>Reviews</Text>
          <View style={styles.ratingsContainer}>{renderRatings()}</View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const SLIDER_WIDTH = Dimensions.get('window').width;
const SLIDER_HEIGHT = Dimensions.get('window').height;
const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.9);
const ITEM_HEIGHT = Math.round((ITEM_WIDTH * 3) / 4);
const styles = StyleSheet.create({
  view: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    color: 'black',
    marginTop: 10,
  },
  titleSmall: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    color: 'black',
    marginTop: 10,
  },
  titleLeft: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    color: 'black',
    marginTop: 10,
    marginRight: 20,
  },
  titleLeftSchedule: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    color: 'black',
    marginRight: 5,
    paddingVertical: 5,
  },
  titleLeftSmall: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    color: 'black',
    marginTop: 10,
    marginRight: 5,
  },
  nameLeftSmall: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'left',
    color: 'black',
    marginTop: 10,
    marginLeft: 15,
    marginRight: 5,
  },
  reviewsLeftSmall: {
    fontSize: 15,
    fontWeight: '400',
    textAlign: 'left',
    color: 'black',
    marginVertical: 5,
    marginHorizontal: 15,
  },
  starLeftSmall: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'left',
    color: '#fd4f57',
    marginTop: 5,
    marginLeft: 13,
    marginRight: 5,
  },
  titleName: {
    fontSize: 30,
    fontWeight: '600',
    textAlign: 'left',
    marginHorizontal: 15,
    marginTop: -5,
    color: 'black',
  },
  titleReviews: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'left',
    marginLeft: 15,
    color: 'black',
    marginTop: 15,
  },
  contentView: {
    borderTopColor: 'black',
  },
  imageStyle: {
    width: '100%',
    height: '100%',
  },
  text: {
    color: 'white',
  },
  imageView: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    paddingLeft: 5,
    paddingBottom: 5,
    paddingTop: 5,
  },
  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#F5F5F5',
    width: '100%',
  },
  bottomModal: {
    height: '100%',
    backgroundColor: 'white',
  },
  modalUp: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F1F1',
  },
  openSmall: {
    color: 'green',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 10,
    marginRight: 5,
  },
  closedSmall: {
    color: '#fd4f57',
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 10,
    marginRight: 5,
  },
  flexRowContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    paddingHorizontal: 15,
    flexWrap: 'wrap',
  },
  flexColContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    paddingHorizontal: 15,
    height: 200,
    backgroundColor: 'red',
  },
  ratingsContainer: {},
  wrapper: {
    height: SLIDER_HEIGHT / 3,
  },
});
