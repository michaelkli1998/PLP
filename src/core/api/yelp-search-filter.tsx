import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import React, {FC, useEffect, useRef, useState} from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  ImageBackground,
  Keyboard,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native-gesture-handler';
import LinearGradient from 'react-native-linear-gradient';
import SearchBar from 'react-native-search-bar';
import Spinner from 'react-native-spinkit';
import {getAddress, useToggle, useToggleTrue} from '../../screens/home/helpers';
import {
  filterCategories,
  FilterModal,
} from '../../shared_components/filter_modal';
import {Touchable} from '../../shared_components/touchable';

type Props = {location?: string};

export const YelpSearchFilter: FC<Props> = props => {
  const [isLoading, setLoading] = useState(true);
  var RandomNumber = Math.floor(Math.random() * 50 - 1) + 1;
  const [restaurants, setRestaurants] = useState([]);
  const SLIDER_WIDTH = Dimensions.get('window').width;
  const ITEM_WIDTH = Math.round(SLIDER_WIDTH * 0.8);
  const ITEM_HEIGHT = Math.round((ITEM_WIDTH * 3) / 4);
  const [searchQuery, setSearchQuery] = useState('');
  const [initialLoad, setInitialLoad] = useState(false);
  const [editable, setEditable] = useState(false);
  const {height} = useWindowDimensions();

  const [isModalVisible, setModalVisible] = useState(false);

  const fadeAnimation = useRef(new Animated.Value(0)).current;
  const slideAnimation = useRef(new Animated.Value(0)).current;

  const [displayFilter, setDisplayFilter] = useState(false);

  const [filterCategory, setFilterCategory] = useState(filterCategories.price);

  const [sortByCriteria, setSortByCriteria] = useState('Relevance');

  const [mappedSortBy, setMappedSortBy] = useState('best_match');

  const [priceRange, setPriceRange] = useState('Price');

  const [priceRangeList, setPriceRangeList] = useState('');

  const [visitedToggle, setVisitedToggle] = useToggle();

  const [openToggle, setOpenToggle] = useToggleTrue();

  const searchRef = useRef<SearchBar>();
  const textInputRef = useRef<TextInput>();

  const flatListRef = useRef<FlatList>();

  var tempConfig = {
    headers: {
      Authorization:
        'Bearer eu70nmGiCTtxJgzg5h3uL1M3rXa3YTsCpz92As8TQw4B5CJ7A0T37rnZ1n84OEvPgGZNNJi9BuYcjH1wj0Vql0P08jsYBEUjkjK0KPVDXUM4veb3jrZzSVwkQ9r4YHYx',
    },
    params: {
      term: 'restaurant',
      location: getAddress(props.location),
      radius: 1609,
      sort_by: mappedSortBy,
      open_now: openToggle,
      price: priceRangeList === '' ? '1,2,3,4' : priceRangeList,
    },
  };

  const fadeIn = () => {
    Animated.timing(fadeAnimation, {
      toValue: 1,
      duration: 400,
      useNativeDriver: false,
    }).start();
  };
  const slideDown = () => {
    Animated.timing(slideAnimation, {
      toValue: 1,
      duration: 400,
      useNativeDriver: false,
    }).start();
  };
  const slideUp = () => {
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 400,
      useNativeDriver: false,
    }).start();
  };

  const fadeOut = () => {
    Animated.timing(fadeAnimation, {
      toValue: 0,
      duration: 400,
      useNativeDriver: false,
    }).start();
  };

  const shrinkWidth = fadeAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [Platform.OS === 'ios' ? '100%' : '95%', '88%'],
  });

  const translateRight = fadeAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 23],
  });

  const translateUp = fadeAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0],
  });

  const translateDown = slideAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, height],
  });

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
    Keyboard.dismiss();
  };
  const navigation = useNavigation();

  const [config, setConfig] = useState(null);

  const handleResponse = (response: any) => {
    switch (filterCategory) {
      case filterCategories.sortBy: {
        setSortByCategory(response);
        break;
      }
      case filterCategories.price: {
        setSortByPrice(response);
      }
    }
  };

  const setSortByCategory = (index: number) => {
    switch (index) {
      case 0: {
        setSortByCriteria('Relevance');
        setMappedSortBy('best_match');
        break;
      }
      case 1:
        setSortByCriteria('Distance');
        setMappedSortBy('distance');
        break;
      case 2:
        setSortByCriteria('Rating');
        setMappedSortBy('rating');
        break;
      case 3:
        setSortByCriteria('Reviews');
        setMappedSortBy('review_count');
        break;
    }
  };

  const setSortByPrice = (priceRange: any) => {
    let priceString = '';
    const sortedPriceRange = priceRange.sort((a, b) => a > b);
    if (sortedPriceRange.length === 0) {
      priceString = 'Price';
      setPriceRange(priceString);
      setPriceRangeList('1,2,3,4');
      return;
    } else if (sortedPriceRange.length === 1) {
      priceString = getDollarSignByIndex(sortedPriceRange[0]) as string;
    } else if (listIsConsecutive(sortedPriceRange)) {
      priceString = ((getDollarSignByIndex(sortedPriceRange[0]) as string) +
        '-' +
        getDollarSignByIndex(
          sortedPriceRange[sortedPriceRange.length - 1],
        )) as string;
    } else {
      let i = 1;
      priceString += getDollarSignByIndex(sortedPriceRange[0]);
      for (i; i < sortedPriceRange.length; i++) {
        priceString += ',';
        priceString += getDollarSignByIndex(sortedPriceRange[i]);
      }
    }

    setPriceRange(priceString);
    let i = 1;
    let finalPriceString = '';
    finalPriceString += sortedPriceRange[0] + 1;
    for (i; i < priceRange.length; i++) {
      finalPriceString += ',';
      finalPriceString += sortedPriceRange[i] + 1;
    }
    setPriceRangeList(finalPriceString);
  };

  const getDollarSignByIndex = (index: number) => {
    switch (index) {
      case 0:
        return '$';
      case 1:
        return '$$';
      case 2:
        return '$$$';
      case 3:
        return '$$$$';
    }
  };

  const listIsConsecutive = (numList: any) => {
    let i = 0;
    for (i; i < numList.length - 1; i++) {
      if (numList[i + 1] - numList[i] != 1) {
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    if (config !== null) {
      axios
        .get('https://api.yelp.com/v3/businesses/search', config)
        .then(response => {
          setRestaurants(response.data.businesses);
          const tempRestaurants = response.data.businesses;
          if (tempRestaurants.length === 0) {
            setInitialLoad(false);
          } else {
            setInitialLoad(true);
          }
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    if (config !== null) {
      onSubmit();
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [props.location]);

  useEffect(() => {
    if (searchQuery === '') {
      setInitialLoad(false);
      setConfig(null);
    }
  }, [searchQuery]);

  useEffect(() => {
    if (searchQuery !== '') {
      onSubmit();
    }
  }, [openToggle, mappedSortBy, priceRangeList]);

  const onSubmit = () => {
    setInitialLoad(false);
    if (searchQuery === '') {
      setLoading(true);
      setConfig(null);
      setInitialLoad(false);
    } else {
      tempConfig.params.term = searchQuery;
      setLoading(true);
      setConfig(tempConfig);
    }
  };

  const _renderItem = ({item, index}) => {
    return (
      <TouchableOpacity
        onPress={() => {
          fadeIn();
          //@ts-ignore
          navigation.navigate('Detailed Restaurant View', {
            id: item.id,
            restaurant: item,
          });
        }}
        style={{marginBottom: 5}}>
        <ImageBackground
          imageStyle={styles.imageStyle}
          style={styles.itemContainer}
          source={{
            uri:
              item.image_url === ''
                ? 'https://st3.depositphotos.com/23594922/31822/v/600/depositphotos_318221368-stock-illustration-missing-picture-page-for-website.jpg'
                : item.image_url,
          }}>
          <LinearGradient
            style={styles.imageView}
            colors={['transparent', 'black']}>
            <Text style={styles.text}>{item.name}</Text>
            <Text style={styles.text}>
              {(item.distance / 1609.344).toFixed(2)} miles
            </Text>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  return (
    <View>
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          // searchRef.current.blur();
          textInputRef.current.blur();
        }}>
        <Animated.View
          style={[
            styles.searchContainer,
            {
              width: shrinkWidth,
              transform: [{translateX: translateRight}],
            },
          ]}>
          <Touchable
            onPress={() => {
              const a = new Promise((resolve, reject) => {
                setTimeout(() => resolve('timeout'), 0);
              });
              a.then(() => {
                // fadeInModal();
                // searchRef.current?.focus();
                textInputRef.current?.focus();
              });
              a.catch(console.log);
              fadeIn();
              slideDown();
              setDisplayFilter(true);
              setEditable(true);
            }}>
            {/* <SearchBar
              placeholder="Search"
              ref={searchRef}
              editable={editable}
              hideBackground={true}
              textFieldBackgroundColor={"white"}
              searchBarStyle={"default"}
              showsCancelButtonWhileEditing={false}
              text={searchQuery}
              onChangeText={setSearchQuery}
              onSearchButtonPress={() => {
                onSubmit();
                Keyboard.dismiss();
                searchRef.current.blur();
              }}
            /> */}
            <View style={styles.inputTextContainer}>
              <Icon
                size={22}
                name="search"
                type="material"
                color="grey"
                tvParallaxProperties={undefined}
                style={{marginRight: 6, marginBottom: 2, zIndex: 0}}
              />
              <TextInput
                ref={textInputRef}
                placeholder={'Search'}
                placeholderTextColor={'grey'}
                onChangeText={setSearchQuery}
                value={searchQuery}
                editable={editable}
                onSubmitEditing={() => {
                  onSubmit();
                  Keyboard.dismiss();
                  textInputRef.current.blur();
                }}
                style={[
                  {
                    fontSize: 18,
                  },
                  styles.inputText,
                ]}
              />
            </View>
          </Touchable>
        </Animated.View>
        <Animated.View
          style={{
            marginHorizontal: 10,
            opacity: fadeAnimation,
            display: displayFilter ? 'flex' : 'none',
          }}>
          <ScrollView horizontal={true}>
            <TouchableOpacity
              onPress={() => {
                setFilterCategory(filterCategories.sortBy);
                toggleModal();
              }}>
              <View style={styles.filterContainerSelected}>
                <Icon
                  size={16}
                  name="keyboard-arrow-down"
                  type="material"
                  color="black"
                  tvParallaxProperties={undefined}
                />
                <Text style={styles.filterTextCarrot}>{sortByCriteria}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setFilterCategory(filterCategories.price);
                toggleModal();
              }}>
              <View
                style={
                  priceRange !== 'Price'
                    ? styles.filterContainerSelected
                    : styles.filterContainer
                }>
                <Icon
                  size={16}
                  name="keyboard-arrow-down"
                  type="material"
                  color="black"
                  tvParallaxProperties={undefined}
                />
                <Text style={styles.filterTextCarrot}>{priceRange}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setOpenToggle();
                // onSubmit();
              }}>
              <View
                style={
                  openToggle
                    ? styles.filterContainerSelected
                    : styles.filterContainer
                }>
                <Text style={styles.filterText}>Open</Text>
              </View>
            </TouchableOpacity>
            {/* <TouchableOpacity
              onPress={() => {
                setVisitedToggle();
                // onSubmit();
              }}>
              <View
                style={
                  visitedToggle
                    ? styles.filterContainerSelected
                    : styles.filterContainer
                }>
                <Text style={styles.filterText}>Visited</Text>
              </View>
            </TouchableOpacity> */}
          </ScrollView>
        </Animated.View>
        <Animated.View
          style={[
            styles.listContainer,
            {
              height: height,
              opacity: fadeAnimation,
              display: displayFilter ? 'flex' : 'none',
            },
          ]}>
          {isLoading ? (
            <View style={styles.telescopeView}>
              <Spinner
                isVisible={true}
                size={40}
                type={'ThreeBounce'}
                color={'black'}
              />
            </View>
          ) : (
            <View
              style={[
                styles.telescopeView,
                {
                  display: initialLoad ? 'none' : 'flex',
                },
              ]}>
              <Image
                source={require('../../images/atomic_telescope.png')}
                style={styles.telescope}
              />
              {config !== null && restaurants.length === 0 ? (
                <Text style={styles.searchText}>No restaurants found...</Text>
              ) : (
                <Text style={styles.searchText}>
                  Search for a restaurant...
                </Text>
              )}
            </View>
          )}
          {initialLoad && (
            <View style={styles.searchCarousel}>
              <Text style={styles.resultText}>
                {restaurants.length + ' restaurants found'}
              </Text>
              <FlatList
                data={restaurants}
                ref={flatListRef}
                keyExtractor={({id}) => id.toString()}
                renderItem={_renderItem}
                ListFooterComponent={
                  <View
                    style={{
                      height: 350,
                      flexDirection: 'row',
                      justifyContent: 'center',
                    }}>
                    <TouchableOpacity
                      onPress={() => {
                        flatListRef.current.scrollToOffset({
                          animated: true,
                          offset: 0,
                        });
                      }}>
                      <Icon
                        size={25}
                        name="arrow-upward"
                        type="material"
                        color="black"
                        tvParallaxProperties={undefined}
                      />
                      <Text>Back to top</Text>
                    </TouchableOpacity>
                  </View>
                }
              />
            </View>
          )}
        </Animated.View>
        <Animated.View
          style={{
            position: 'absolute',
            justifyContent: 'center',
            paddingTop: 12,
            opacity: fadeAnimation,
          }}>
          <TouchableOpacity
            onPress={() => {
              fadeOut();
              slideUp();
              setEditable(false);
              setSearchQuery('');
              setDisplayFilter(false);
              // searchRef.current.blur();
              textInputRef.current.blur();
            }}>
            <Icon
              size={28}
              name="arrow-back"
              type="material"
              color="black"
              style={{marginRight: 10, marginLeft: 15}}
              tvParallaxProperties={undefined}
            />
          </TouchableOpacity>
        </Animated.View>
        <FilterModal
          isVisible={isModalVisible}
          toggleVisibility={toggleModal}
          category={filterCategory}
          handleResponse={handleResponse}
        />
      </TouchableWithoutFeedback>
    </View>
  );
};

const SLIDER_WIDTH = Dimensions.get('window').width;
const SLIDER_HEIGHT = Dimensions.get('window').height;
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
  view: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  searchContainer: {
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: 5,
    marginTop: 5,
    marginBottom: 10,
  },
  listContainer: {
    width: '100%',
    alignSelf: 'center',
  },
  searchContainerModal: {
    width: '100%',
    marginTop: Platform.OS === 'ios' ? 50 : 25,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageStyle: {
    width: '100%',
    height: '100%',
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
  },
  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    flex: 2,
    color: 'black',
  },
  inputTextContainer: {
    borderWidth: 1,
    padding: 8,
    minWidth: '100%',
    backgroundColor: 'white',
    borderColor: 'lightgrey',
    borderRadius: 5,
    height: 39,
    color: 'black',
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputText: {
    padding: 8,
    width: '90%',
    backgroundColor: 'white',
    height: 37,
    color: 'black',
    flexDirection: 'row',
    alignItems: 'center',
    textAlignVertical: 'center',
  },
  tempView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingRight: 10,
  },
  text: {
    color: 'white',
  },
  buttonStyle: {
    marginTop: 10,
    backgroundColor: '#fd4f57',
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
    borderRadius: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    marginBottom: 10,
  },
  searchCarousel: {
    paddingHorizontal: 15,
    marginTop: 15,
    flex: 1,
  },
  filterContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterContainerSelected: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginHorizontal: 5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterTextCarrot: {
    marginLeft: 5,
  },
  filterText: {
    margin: 0,
  },
  telescope: {
    height: 246.6,
    width: 165.4,
  },
  telescopeView: {
    alignItems: 'center',
    justifyContent: 'center',
    height: SLIDER_HEIGHT - ITEM_HEIGHT - 100,
  },
  searchText: {
    fontWeight: 'bold',
    marginHorizontal: 10,
    fontSize: 22,
  },
  resultText: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },
});
