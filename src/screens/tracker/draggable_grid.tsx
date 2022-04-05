import {useNavigation} from '@react-navigation/native';
import React, {FC, useCallback, useEffect, useState} from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  LogBox,
  Modal as RNModal,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
  Linking,
} from 'react-native';
import {Icon} from 'react-native-elements';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Modal from 'react-native-modal';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import AwesomeButton from 'react-native-really-awesome-button';
import {SceneMap, TabBar, TabView} from 'react-native-tab-view';
import ColorPicker from 'react-native-wheel-color-picker';
import {ToDoItem} from '../../core/models';
import {
  createTable,
  deletePairLunch,
  getDBConnection,
  getPairLunches,
  savePairLunches,
} from '../../core/storage/db-service';
import {Touchable} from '../../shared_components/touchable';
import {useToggle} from '../home/helpers';
import {DirectoryModal} from './directory_modal';
import {DirectoryModalPicker} from './directory_modal_picker';
import {atomicPeople} from './people_list';

LogBox.ignoreLogs([
  'BSON: For React Native please polyfill crypto.getRandomValues',
]);

type Props = {
  atomic_people: any;
  pre_restaurant?: any;
  reset_pre_restaurant?: () => void;
};

const COLUMN_WIDTH = Dimensions.get('window').width * 0.6;

const DnDBoard: FC<Props> = props => {
  const [currentId, setCurrentId] = useState(0);

  const [isModalVisible, setModalVisible] = useState(false);
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };
  const [dateText, setDateText] = useState('');
  const [timeText, setTimeText] = useState('');
  const [restaurant, setRestaurant] = useState('');
  const [selectedItem, setSelectedItems] = useState('');
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);

  const [colorWheelOpen, setColorWheelOpen] = useToggle(false);
  const [infoMenuOpen, setInfoMenuOpen] = useToggle(false);

  const [color, setColor] = useState('#ffffff');

  const [pairLunchListUpcoming, setPairLunchListUpcoming] = useState([]);
  const [pairLunchListPast, setPairLunchListPast] = useState([]);

  const [initPairLunchListUpcoming, setInitPairLunchListUpcoming] = useState(
    [],
  );
  const [initPairLunchListPast, setInitPairLunchListPast] = useState([]);

  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const [isContactModalVisible, setContactModalVisible] = useState(false);
  const toggleContactModal = () => {
    setContactModalVisible(!isContactModalVisible);
  };
  const [isContactPickerModalVisible, setContactPickerModalVisible] =
    useState(false);
  const toggleContactPickerModal = () => {
    setContactPickerModalVisible(!isContactPickerModalVisible);
  };

  const [todos, setTodos] = useState<ToDoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');

  const {width} = useWindowDimensions();

  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    {key: 'upcoming', title: 'Upcoming'},
    {key: 'past', title: 'Past'},
  ]);

  const navigation = useNavigation();

  const loadDataCallback = useCallback(async () => {
    try {
      const initPairLunches = [];
      const db = await getDBConnection();
      await createTable(db);
      const storedPairLunches = await getPairLunches(db);
      if (storedPairLunches.length) {
        const upcomingLunches = storedPairLunches.filter(lunch => {
          if (compareDates(lunch.date.split(' ')[0]) === 'after') {
            return true;
          }
          if (compareDates(lunch.date.split(' ')[0]) === 'afterSame') {
            if (compareTime(lunch.date) === 'after') {
              return true;
            }
            return false;
          }
          return false;
        });
        const previousLunches = storedPairLunches.filter(lunch => {
          if (compareDates(lunch.date.split(' ')[0]) === 'after') {
            return false;
          }
          if (compareDates(lunch.date.split(' ')[0]) === 'afterSame') {
            if (compareTime(lunch.date) === 'after') {
              return false;
            }
            return true;
          }
          return true;
        });
        setPairLunchListUpcoming(upcomingLunches);
        setPairLunchListPast(previousLunches);
      } else {
        // await savePairLunches(db, initPairLunches);
        setPairLunchListUpcoming(initPairLunches);
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    loadDataCallback();
    if (props.pre_restaurant !== null) {
      setTimeout(() => {
        toggleModal();
        setRestaurant(props.pre_restaurant.name);
      }, 100);
    }
  }, [props]);

  const sendAtom = (response: any) => {
    setSelectedItems(response);
  };

  const atomic_people = atomicPeople;
  atomic_people.sort((a, b) => (a.name > b.name ? 1 : -1));

  const addPairLunch = async () => {
    const atom = atomic_people
      .filter(item => {
        return item.name === selectedItem;
      })
      .map(({name}) => {
        return name;
      });
    const cardCol = compareDates(dateText);
    let colNum = 0;

    if (cardCol === 'after' || cardCol === 'afterSame') {
      colNum = 1;
    } else {
      colNum = 2;
    }
    try {
      if (compareDates(timeText.split(' ')[0]) === 'after') {
        const newPairLunchList = [
          ...pairLunchListUpcoming,
          {
            id: new Date().toISOString(),
            atom: atom[0],
            date: timeText,
            restaurant: restaurant,
            color: color,
            column: colNum,
          },
        ];
        setPairLunchListUpcoming(newPairLunchList);
      } else if (compareDates(timeText.split(' ')[0]) === 'afterSame') {
        if (compareTime(timeText) === 'after') {
          const newPairLunchList = [
            ...pairLunchListUpcoming,
            {
              id: new Date().toISOString(),
              atom: atom[0],
              date: timeText,
              restaurant: restaurant,
              color: color,
              column: colNum,
            },
          ];
          setPairLunchListUpcoming(newPairLunchList);
        } else {
          const newPairLunchList = [
            ...pairLunchListPast,
            {
              id: new Date().toISOString(),
              atom: atom[0],
              date: timeText,
              restaurant: restaurant,
              color: color,
              column: colNum,
            },
          ];
          setPairLunchListPast(newPairLunchList);
        }
      } else {
        const newPairLunchList = [
          ...pairLunchListPast,
          {
            id: new Date().toISOString(),
            atom: atom[0],
            date: timeText,
            restaurant: restaurant,
            color: color,
            column: colNum,
          },
        ];
        setPairLunchListPast(newPairLunchList);
      }
      const db = await getDBConnection();
      const storedPairLunches = await getPairLunches(db);
      const newPairLunchList = [
        ...storedPairLunches,
        {
          id: new Date().toISOString(),
          atom: atom[0],
          date: timeText,
          restaurant: restaurant,
          color: color,
          column: colNum,
        },
      ];
      await savePairLunches(db, newPairLunchList);
      setCurrentId(currentId + 1);

      setDateText('');
      setTimeText('');
      setRestaurant('');
      setIsFirstLoad(false);
      setSelectedItems('');
    } catch (error) {
      console.error(error);
    }
  };
  const deleteItem = async (id: number) => {
    try {
      const db = await getDBConnection();
      await deletePairLunch(db, id);
      todos.splice(id, 1);
      setTodos(todos.slice(0));
    } catch (error) {
      console.error(error);
    }
  };

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirmDate = date => {
    console.log(date);
    setDateText(
      date.toISOString().split('T')[0].split('-')[1] +
        '/' +
        date.toISOString().split('T')[0].split('-')[2] +
        '/' +
        date.toISOString().split('T')[0].split('-')[0],
    );
    hideDatePicker();
    setTimeout(() => {
      showTimePicker();
    }, 500);
  };

  const showTimePicker = () => {
    setTimePickerVisibility(true);
  };

  const hideTimePicker = () => {
    setTimePickerVisibility(false);
  };

  const handleConfirmTime = date => {
    let hours = date.getHours();
    let minutes = makeTwoDigits(date.getMinutes());
    let time = '';
    if (hours > 12) {
      hours = hours - 12;
      time = hours + ':' + minutes + 'pm';
    } else if (hours === 0) {
      time = 12 + ':' + minutes + 'am';
    } else if (hours === 12) {
      time = 12 + ':' + minutes + 'pm';
    } else {
      time = hours + ':' + minutes + 'am';
    }

    setTimeText(dateText + ' at ' + time);

    hideTimePicker();
  };

  const checkFieldsFilled = () => {
    return dateText !== '' && restaurant !== '' && selectedItem !== ''
      ? false
      : true;
  };

  const renderCard = ({item}) => {
    return (
      <TouchableOpacity
        onLongPress={() => {
          setInfoMenuOpen();
        }}
        onPress={() => {
          //@ts-ignore
          navigation.navigate('Atomic People View', {
            name: item.atom,
          });
        }}>
        <View
          style={{
            borderRightColor: '#F6F7FB',
            borderTopColor: '#F6F7FB',
            borderBottomColor: '#F6F7FB',
            borderRightWidth: 1,
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderLeftColor: item.color,
            borderLeftWidth: 10,
            backgroundColor: '#FFFFFF',
            paddingRight: 24,
            paddingLeft: 12,
            paddingVertical: 10,
            marginVertical: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View style={{flexDirection: 'row'}}>
            <View
              style={{
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Icon
                size={16}
                name="supervised-user-circle"
                type="material"
                color="black"
                style={styles.nameIcons}
                tvParallaxProperties={undefined}
              />
              <Icon
                size={16}
                name="calendar-today"
                type="material"
                color="black"
                style={styles.nameIcons}
                tvParallaxProperties={undefined}
              />
              <Icon
                size={16}
                name="location-pin"
                type="material"
                color="black"
                style={styles.nameIcons}
                tvParallaxProperties={undefined}
              />
            </View>
            <View
              style={{
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
              }}>
              <Text style={[{fontWeight: 'bold'}, styles.cardText]}>
                {item.atom}
              </Text>
              <Text style={styles.cardText}>{item.date}</Text>
              <Text style={styles.cardText}>{item.restaurant}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const handleScroll = e => {
    const paddingToBottom = 20;
    const isBottom =
      e.nativeEvent.layoutMeasurement.height + e.nativeEvent.contentOffset.y >=
      e.nativeEvent.contentSize.height - paddingToBottom;
    if (
      e.nativeEvent.layoutMeasurement.height < e.nativeEvent.contentSize.height
    ) {
      if (isBottom) {
      }
    }
  };

  const FirstRouteInit = () => {
    return (
      <View style={{height: '100%'}}>
        <FlatList
          data={initPairLunchListUpcoming}
          renderItem={renderCard}
          style={{width: '100%', marginTop: 2}}
          onScroll={handleScroll}
        />
      </View>
    );
  };
  const SecondRouteInit = () => {
    return (
      <View style={{height: '100%'}}>
        <FlatList
          data={initPairLunchListPast}
          renderItem={renderCard}
          style={{width: '100%', marginTop: 2}}
          onScroll={handleScroll}
        />
      </View>
    );
  };
  const FirstRoute = () => {
    return (
      <View style={{height: '100%'}}>
        <FlatList
          data={pairLunchListUpcoming}
          renderItem={renderCard}
          style={{width: '100%', marginTop: 2}}
          onScroll={handleScroll}
        />
      </View>
    );
  };
  const SecondRoute = () => {
    return (
      <View style={{height: '100%'}}>
        <FlatList
          data={pairLunchListPast}
          renderItem={renderCard}
          style={{
            width: '100%',
            marginTop: 2,
          }}
          onScroll={handleScroll}
        />
      </View>
    );
  };

  const renderSceneInit: any = SceneMap({
    upcoming: FirstRouteInit,
    past: SecondRouteInit,
  });

  const renderSceneAdd: any = SceneMap({
    upcoming: FirstRoute,
    past: SecondRoute,
  });

  const renderTabBar = props => (
    <TabBar
      {...props}
      indicatorStyle={{backgroundColor: 'black'}}
      style={{backgroundColor: '#fd4f57'}}
      renderLabel={({route, focused}) => (
        <Text style={{color: 'black', margin: 3, fontWeight: 'bold'}}>
          {route.title}
        </Text>
      )}
    />
  );

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          paddingHorizontal: 12,
          alignItems: 'center',
          borderBottomColor: 'black',
          borderBottomWidth: 0.3,
        }}>
        <Text style={styles.pairLunchTitle}>Pair Lunch Tracker</Text>
        <TouchableOpacity
          onPress={() => {
            toggleContactModal();
          }}
          style={{
            position: 'absolute',
            right: 0,
            marginRight: 12,
            padding: 5,
          }}>
          <Icon
            size={24}
            name="contacts"
            type="material"
            color="black"
            tvParallaxProperties={undefined}
          />
        </TouchableOpacity>
      </View>
      <DirectoryModal
        isVisible={isContactModalVisible}
        toggleVisibility={toggleContactModal}
      />
      <TabView
        navigationState={{index, routes}}
        renderScene={renderSceneAdd}
        onIndexChange={setIndex}
        initialLayout={{width: width}}
        renderTabBar={renderTabBar}
        style={{backgroundColor: '#f5f5f5'}}
      />

      <TouchableOpacity style={styles.addButton} onPress={toggleModal}>
        <Icon
          size={32}
          name="add"
          type="material"
          color="white"
          tvParallaxProperties={undefined}
        />
      </TouchableOpacity>
      <Modal
        isVisible={infoMenuOpen}
        onBackdropPress={setInfoMenuOpen}
        onBackButtonPress={setInfoMenuOpen}
        style={styles.infoMenu}
        backdropOpacity={0.3}
        animationIn={'slideInUp'}
        animationOut={'slideOutDown'}>
        <View
          style={{
            paddingBottom: 40,
            paddingHorizontal: 30,
            maxHeight: '30%',
            flex: 1,
            backgroundColor: 'white',
            justifyContent: 'space-evenly',
          }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 10,
            }}>
            <TouchableOpacity style={styles.infoButton}>
              <Icon
                size={32}
                name="supervised-user-circle"
                type="material"
                color="white"
                tvParallaxProperties={undefined}
              />
              <Text style={styles.infoText}>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.infoButton}>
              <Icon
                size={32}
                name="edit"
                type="material"
                color="white"
                tvParallaxProperties={undefined}
              />
              <Text style={styles.infoText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.infoButton}>
              <Icon
                size={32}
                name="close"
                type="material"
                color="white"
                tvParallaxProperties={undefined}
              />
              <Text style={styles.infoText}>Delete</Text>
            </TouchableOpacity>
          </View>
          <View style={{alignItems: 'center'}}>
            <TouchableOpacity
              style={styles.checkButton}
              onPress={() => {
                setInfoMenuOpen();
              }}>
              <Icon
                size={32}
                name="close"
                type="material"
                color="white"
                tvParallaxProperties={undefined}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <RNModal
        visible={isModalVisible}
        style={styles.view}
        animationType={'fade'}>
        <SafeAreaView style={styles.content}>
          <KeyboardAwareScrollView
            contentContainerStyle={{
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}>
            <Text style={styles.contentTitle}>Add a pair lunch</Text>
            <Image
              source={require('../../images/twopeoplelunch.png')}
              style={styles.pairLunchLogo}
            />
            <Touchable
              style={{
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={setColorWheelOpen}>
              <View
                style={[
                  {
                    marginTop: 15,
                    width: 200,
                    borderRadius: 40 / 2,
                    height: 40,
                    borderColor: 'lightgrey',
                    borderWidth: 1,
                    justifyContent: 'center',
                    backgroundColor: 'white',
                    shadowColor: '#171717',
                    shadowOffset: {width: -2, height: 4},
                    shadowOpacity: 0.2,
                    shadowRadius: 3,
                    alignItems: 'center',
                    flexDirection: 'row',
                  },
                ]}>
                <View
                  style={{
                    backgroundColor: color,
                    width: 25,
                    height: 25,
                    borderRadius: 25 / 2,
                    marginRight: 10,
                    borderWidth: 1,
                    borderColor: 'black',
                  }}></View>
                <Text style={styles.headerText}>Choose a color</Text>
              </View>
            </Touchable>
            <View style={styles.selectContainer}>
              <Text style={styles.headerText}>Atom</Text>
              <Touchable
                onPress={() => {
                  toggleContactPickerModal();
                }}>
                <TextInput
                  style={styles.input}
                  placeholder={'Select an Atom'}
                  placeholderTextColor={'grey'}
                  value={selectedItem}
                  editable={false}
                />
              </Touchable>
            </View>
            <View style={styles.selectContainer}>
              <Text style={styles.headerText}>Date/Time</Text>
              <Touchable onPress={showDatePicker}>
                <TextInput
                  style={styles.input}
                  placeholder={'Choose a date and time'}
                  placeholderTextColor={'grey'}
                  onChangeText={setTimeText}
                  value={timeText}
                  editable={false}
                />
              </Touchable>
              <DateTimePickerModal
                isVisible={isDatePickerVisible}
                mode="date"
                onConfirm={handleConfirmDate}
                onCancel={hideDatePicker}
              />
              <DateTimePickerModal
                isVisible={isTimePickerVisible}
                mode="time"
                onConfirm={handleConfirmTime}
                onCancel={hideTimePicker}
              />
            </View>
            <View style={styles.selectContainer}>
              <View style={{flexDirection: 'row'}}>
                <Text style={styles.headerText}>Restaurant</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder={'Enter a restaurant'}
                placeholderTextColor={'grey'}
                onChangeText={setRestaurant}
                value={restaurant}
                editable={true}
              />
            </View>
            <AwesomeButton
              progress
              //@ts-ignore
              progressLoadingTime={1000}
              onPress={() => {
                setTimeout(() => {
                  toggleModal();
                  addPairLunch();
                }, 1000);
              }}
              stretch
              style={styles.button}
              type="primary"
              height={55}
              backgroundColor={checkFieldsFilled() ? '#faa849' : '#ffcd6a'}
              backgroundDarker={'#faa849'}
              textColor={'black'}
              textSize={16}
              borderRadius={5}
              disabled={checkFieldsFilled()}>
              Add Pair Lunch
            </AwesomeButton>
            <Touchable
              style={{
                height: 30,
                width: 60,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={toggleModal}>
              <Text style={{fontWeight: 'bold'}}>Cancel</Text>
            </Touchable>
            <DirectoryModalPicker
              isVisible={isContactPickerModalVisible}
              toggleVisibility={toggleContactPickerModal}
              sendAtom={sendAtom}
            />
          </KeyboardAwareScrollView>
        </SafeAreaView>
        <Modal
          isVisible={colorWheelOpen}
          onBackdropPress={setColorWheelOpen}
          onBackButtonPress={setColorWheelOpen}
          style={styles.colorWheelView}
          backdropOpacity={0.3}>
          <View
            style={{
              paddingBottom: 40,
              paddingHorizontal: 30,
              maxHeight: '55%',
              flex: 1,
              backgroundColor: 'white',
            }}>
            <View style={{alignItems: 'center', marginTop: 10}}>
              <TouchableOpacity
                style={styles.checkButton}
                onPress={() => {
                  setColorWheelOpen();
                }}>
                <Icon
                  size={32}
                  name="check"
                  type="material"
                  color="white"
                  tvParallaxProperties={undefined}
                />
              </TouchableOpacity>
            </View>
            <ColorPicker
              color={color}
              thumbSize={40}
              sliderSize={40}
              noSnap={true}
              //@ts-ignore
              onColorChangeComplete={setColor}
              row={false}
              swatchesLast
              swatches
              discrete={false}
            />
          </View>
        </Modal>
      </RNModal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  header: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  hederName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  board: {
    paddingVertical: 16,
    backgroundColor: '#E0E8EF',
  },
  column: {
    backgroundColor: '#F8FAFB',
    marginHorizontal: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 4,
  },
  columnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  columnName: {
    fontWeight: 'bold',
  },
  addColumn: {
    marginRight: 12,
    padding: 12,
    minWidth: COLUMN_WIDTH,
  },
  card: {
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#F6F7FB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  addCard: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgb(233, 233, 233)',
    borderRadius: 4,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#F5F6F8',
  },
  button: {
    marginTop: 20,
    marginBottom: 20,
    paddingRight: 20,
    paddingLeft: 20,
    marginLeft: 40,
  },
  input: {
    borderWidth: 1,
    padding: 14,
    minWidth: '100%',
    backgroundColor: 'white',
    borderColor: 'lightgrey',
    borderRadius: 5,
    height: 45,
    color: 'black',
  },
  selectContainer: {
    paddingHorizontal: 20,
    marginVertical: 5,
  },
  flexRow: {
    flexDirection: 'row',
  },
  logo: {
    width: 170,
    height: 170,
  },
  pairLunchLogo: {
    width: 315,
    height: 300,
  },
  trackText: {
    fontWeight: 'bold',
    marginHorizontal: 10,
    fontSize: 22,
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
    bottom: 0,
    right: 0,
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
    marginTop: 12,
  },
  infoButton: {
    shadowColor: '#171717',
    shadowOffset: {width: -2, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 3,
    backgroundColor: '#fd4f57',
    width: 80,
    height: 80,
    borderRadius: 80 / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#fd4f57',
    padding: 22,
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    height: '100%',
  },
  contentTitle: {
    fontSize: 24,
    marginVertical: 16,
    fontWeight: 'bold',
  },
  pairLunchTitle: {
    fontSize: 20,
    marginVertical: 10,
    fontWeight: 'bold',
  },
  contentText: {
    fontSize: 16,
    marginBottom: 12,
    marginHorizontal: 12,
    flex: 1,
  },
  headerText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  view: {
    justifyContent: 'center',
  },
  colorWheelView: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  infoMenu: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  infoText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalText: {
    fontWeight: 'bold',
    color: 'black',
  },
  cardText: {
    marginVertical: 2,
    marginLeft: 8,
    fontSize: 14,
  },
  nameIcons: {
    marginVertical: 2,
  },
});

const compareDates = date => {
  const dateNow = new Date();
  const compDate =
    dateNow.toISOString().split('T')[0].split('-')[1] +
    '-' +
    dateNow.toISOString().split('T')[0].split('-')[2] +
    '-' +
    dateNow.toISOString().split('T')[0].split('-')[0];

  const monthComp = date.split('/')[0];
  const dayComp = date.split('/')[1];
  const yearComp = date.split('/')[2];

  const monthNow = compDate.split('-')[0];
  const dayNow = compDate.split('-')[1];
  const yearNow = compDate.split('-')[2];

  if (yearComp > yearNow) {
    return 'after';
  }

  if (yearComp < yearNow) {
    return 'before';
  }

  if (monthComp > monthNow) {
    return 'after';
  }

  if (monthComp < monthNow) {
    return 'before';
  }

  if (dayComp > dayNow) {
    return 'after';
  }

  if (dayComp < dayNow) {
    return 'before';
  }

  if (yearComp === yearNow && monthComp === monthNow && dayComp === dayNow) {
    return 'afterSame';
  }

  return 'before';
};

const compareTime = lunch => {
  const timeLunch = lunch.split(' ')[2] as string;
  const date = new Date();
  let hours = date.getHours();
  let minutes = makeTwoDigits(date.getMinutes());
  const isAMPM = timeLunch.slice(timeLunch.length - 2, timeLunch.length - 1);
  let newHours = 0;
  let newMinutes = parseInt(timeLunch.split(':')[1].substr(0, 2));
  if (isAMPM === 'pm') {
    newHours = parseInt(timeLunch.split(':')[0]) + 12;
  } else {
    newHours = parseInt(timeLunch.split(':')[0]);
  }

  if (newHours > hours) {
    return 'after';
  }

  if (newHours < hours) {
    return 'before';
  }

  if (newMinutes > minutes) {
    return 'after';
  }

  if (newMinutes < minutes) {
    return 'before';
  }

  return 'after';
};

const makeTwoDigits = time => {
  const timeString = `${time}`;
  if (timeString.length === 2) return time;
  return `0${time}`;
};

export {DnDBoard};
