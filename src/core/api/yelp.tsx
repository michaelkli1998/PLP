import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import React, {FC, useEffect, useState} from 'react';
import {
  AppState,
  Dimensions,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Spinner from 'react-native-spinkit';
import {getAddress} from '../../screens/home/helpers';
import {getData, storeData} from './helpers';

type Props = {location?: string};

export const Yelp: FC<Props> = props => {
  const [isLoading, setLoading] = useState(true);
  const navigation = useNavigation();
  const [todaysRestaurant, setTodaysRestaurant] = useState(null);

  const [appState, setAppState] = useState('');

  const config = {
    headers: {
      Authorization:
        'Bearer eu70nmGiCTtxJgzg5h3uL1M3rXa3YTsCpz92As8TQw4B5CJ7A0T37rnZ1n84OEvPgGZNNJi9BuYcjH1wj0Vql0P08jsYBEUjkjK0KPVDXUM4veb3jrZzSVwkQ9r4YHYx',
    },
    params: {
      term: 'Restaurants',
      location: getAddress(props.location),
      limit: 50,
      radius: 2000,
    },
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      setAppState(nextAppState);
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const today = getCurrentDate();

  useEffect(() => {
    axios
      .get('https://api.yelp.com/v3/businesses/search', config)
      .then(response => {
        const indexedRestaurants = response.data.businesses.reduce(
          (accumulator, restaurant) => ({
            ...accumulator,
            [restaurant.id]: restaurant,
          }),
        );
        const restaurants = indexedRestaurants;

        getData().then((restaurantDateMap = {}) => {
          const currentRestaurant = restaurantDateMap[today];
          if (currentRestaurant && currentRestaurant[props.location]) {
            const restaurant =
              indexedRestaurants[currentRestaurant[props.location]];
            if (restaurant) {
              setTodaysRestaurant(restaurant);
              return;
            }
          }
          while (1) {
            const randomNumber = Math.floor(
              Math.random() * (Object.keys(restaurants).length - 16 + 1) + 16,
            );

            const potentialRestaurantId =
              Object.keys(restaurants)[randomNumber];
            const isAlreadyShown = !!Object.values(restaurantDateMap).filter(
              location => location[props.location] == potentialRestaurantId,
            )[0];
            if (!isAlreadyShown) {
              setTodaysRestaurant(restaurants[potentialRestaurantId]);
              storeData({
                ...restaurantDateMap,
                [today]: {
                  ...restaurantDateMap[today],
                  [props.location]: restaurants[potentialRestaurantId].id,
                },
              }).catch(e => console.log(e));
              break;
            }
          }
        });

        setLoading(false);
      });
  }, [props.location, today]);

  if (!todaysRestaurant) {
    return (
      <Spinner
        isVisible={true}
        size={40}
        type={'ThreeBounce'}
        color={'#fd4f57'}
      />
    );
  }
  return (
    <TouchableOpacity
      style={styles.touchableContainer}
      onPress={() => {
        //@ts-ignore
        navigation.navigate('Detailed Restaurant View', {
          id: todaysRestaurant.id,
          restaurant: todaysRestaurant,
        });
      }}>
      <ImageBackground
        imageStyle={styles.imageStyle}
        style={styles.itemContainer}
        source={{uri: todaysRestaurant.image_url}}>
        <LinearGradient
          style={styles.imageView}
          colors={['transparent', 'black']}>
          <Text style={styles.text}>{todaysRestaurant.name}</Text>
          <Text style={styles.text}>
            {(todaysRestaurant.distance / 1609.344).toFixed(2)} miles
          </Text>
        </LinearGradient>
      </ImageBackground>
    </TouchableOpacity>
  );
};

const SLIDER_WIDTH = Dimensions.get('window').width;
const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.8);
const ITEM_HEIGHT = Math.round((ITEM_WIDTH * 3) / 4);
const styles = StyleSheet.create({
  itemContainer: {
    height: ITEM_HEIGHT,
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    width: '100%',
  },
  touchableContainer: {
    width: '100%',
    height: ITEM_HEIGHT,
  },
  imageStyle: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
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
});

export const getCurrentDate = () => {
  return new Date().toISOString().split('T')[0];
};
