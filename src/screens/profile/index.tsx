import React, {FC, useCallback, useEffect, useState} from 'react';
import {
  Image,
  LogBox,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import CountDown from 'react-native-countdown-component';
import {TouchableOpacity} from 'react-native-gesture-handler';
import {getDBConnection, getPairLunch} from '../../core/storage/db-service';
import {useToggle} from '../home/helpers';
import {atomic_people_urls} from '../tracker/people_list';

LogBox.ignoreLogs(["EventEmitter.removeListener('appStateDidChange', ...):"]); // Ignore log notification by message

//@ts-ignore
export const AtomicPeopleView: FC = ({route}) => {
  const [ableToSchedule, toggleAbleToSchedule] = useToggle(false);
  const [pairLunch, setPairLunch] = useState(null);
  var lunchId = 0;

  if (route.params === undefined) {
    return null;
  }

  const atom_name = route.params.name;

  const getLunchId = () => {
    const tempId = lunchId;
    lunchId += 1;
    return tempId;
  };

  const loadDataCallback = useCallback(async () => {
    try {
      const db = await getDBConnection();
      const storedPairLunches = await getPairLunch(db, atom_name);
      if (storedPairLunches.length === 0) {
        toggleAbleToSchedule();
      }
      const sortedPairLunches = []
        .concat(storedPairLunches)
        .sort((a, b) =>
          calculateTotalSecondsComp(a.date) < calculateTotalSecondsComp(b.date)
            ? 1
            : -1,
        );
      setPairLunch(sortedPairLunches);
    } catch (error) {
      console.error(error);
    }
  }, []);

  useEffect(() => {
    loadDataCallback();
  }, []);

  const renderCanScheduleHeader = () => {
    if (ableToSchedule) {
      return <Text style={styles.subText}>You can schedule a Pair Lunch!</Text>;
    }
    if (calculateTimeUntilNextLunch(pairLunch[0].date) !== -1) {
      return (
        <>
          <Text style={styles.subText}>Schedule a pair lunch in:</Text>
          <CountDown
            until={calculateTimeUntilNextLunch(pairLunch[0].date)}
            onFinish={() => {
              toggleAbleToSchedule();
            }}
            size={20}
            digitStyle={{backgroundColor: '#fd4f57'}}
            timeToShow={['D', 'H', 'M']}
          />
        </>
      );
    }
    return (
      <Text style={styles.subText}>
        You already have a pair lunch scheduled!
      </Text>
    );
  };

  const splitPairLunchesPast = () => {
    const lunchPast = pairLunch.filter(lunch => {
      return (
        calculateTotalSecondsComp(lunch.date) <= calculateTotalSecondsNow()
      );
    });
    return lunchPast;
  };

  const splitPairLunchesUpcoming = () => {
    const lunchUpcoming = pairLunch.filter(lunch => {
      return calculateTotalSecondsComp(lunch.date) > calculateTotalSecondsNow();
    });
    return lunchUpcoming;
  };

  const renderSplitPairLunchesUpcoming = () => {
    if (splitPairLunchesUpcoming().length !== 0) {
      return (
        <>
          <Text style={styles.upcomingLunchText}>Upcoming Lunches</Text>
          {splitPairLunchesUpcoming().map((lunch, index) => (
            <View key={getLunchId()} style={{marginVertical: 5}}>
              <Text style={{fontWeight: 'bold', fontSize: 16}}>
                {lunch.restaurant}
              </Text>
              <Text>{lunch.date}</Text>
            </View>
          ))}
        </>
      );
    } else return <></>;
  };

  const renderSplitPairLunchesPast = () => {
    if (splitPairLunchesPast().length !== 0) {
      return (
        <>
          <Text style={styles.pastLunchText}>Past Lunches</Text>
          {splitPairLunchesPast().map((lunch, index) => (
            <View key={getLunchId()} style={{marginVertical: 5}}>
              <Text style={{fontWeight: 'bold', fontSize: 16}}>
                {lunch.restaurant}
              </Text>
              <Text>{lunch.date}</Text>
            </View>
          ))}
        </>
      );
    } else return <></>;
  };

  if (pairLunch === null) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        // contentContainerStyle={{ alignItems: "center" }}
      >
        <View style={styles.imageContainer}>
          <Image
            style={styles.imageStyle}
            source={atomic_people_urls[0][atom_name]}></Image>
          <Text style={styles.headerText}>{atom_name}</Text>
          {renderCanScheduleHeader()}
        </View>
        <View style={styles.pastLunchesContainer}>
          <View
            style={{
              alignContent: 'flex-start',
              width: '100%',
              paddingHorizontal: 5,
            }}>
            {renderSplitPairLunchesUpcoming()}
            {renderSplitPairLunchesPast()}
            {pairLunch.length === 0 && (
              <Text>
                You have no lunches with this atom. Please schedule one :)
              </Text>
            )}
          </View>
        </View>
        <View style={{height: 50}} />
      </ScrollView>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  imageStyle: {
    width: 250,
    height: 250,
    borderRadius: 250 / 2,
    borderWidth: 5,
    borderColor: 'white',
  },
  scrollContainer: {
    width: '100%',
    paddingTop: 15,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: 'white',
    backgroundColor: 'white',
    paddingHorizontal: 10,
  },
  imageContainer: {
    alignItems: 'center',
    backgroundColor: '#E5E5E5',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    width: '100%',
  },
  pastLunchesContainer: {
    alignItems: 'center',
    backgroundColor: '#E5E5E5',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    width: '100%',
    marginTop: 15,
  },
  headerText: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 5,
  },
  pastLunchText: {
    fontSize: 18,
    fontWeight: '400',
    marginBottom: 5,
    marginTop: 10,
    textAlign: 'center',
  },
  upcomingLunchText: {
    fontSize: 18,
    fontWeight: '400',
    marginBottom: 5,
    textAlign: 'center',
  },
  subText: {
    fontSize: 18,
    color: '#fd4f57',
    marginTop: 3,
    marginBottom: 10,
  },
});

const calculateTotalSecondsComp = (date: string) => {
  const splitComp = date.split(' ');
  const dateComp = splitComp[0];
  const splitDateComp = dateComp.split('/');

  const monthComp = splitDateComp[0];
  const dayComp = splitDateComp[1];
  const yearComp = splitDateComp[2];

  const timeComp = splitComp[2];
  const splitTimeComp = timeComp.split(':');
  const hourComp = splitTimeComp[0];
  const minutesComp = splitTimeComp[1].substring(0, 2);
  const am_pm_comp = splitTimeComp[1].substring(2);

  const totalSecondsComp =
    Number(yearComp) * 31536000 +
    Number(monthComp) * 2629746 +
    Number(dayComp) * 86400 +
    Number(convertStandardToMilitary(hourComp, am_pm_comp)) * 3600 +
    Number(minutesComp) * 60;

  return totalSecondsComp;
};

const calculateTotalSecondsNow = () => {
  const isoDate = new Date().toLocaleDateString();
  console.log(new Date().toLocaleDateString());
  const splitDate = isoDate.split('/');
  const monthNow = splitDate[0];
  const dayNow = splitDate[1];
  let yearNow = splitDate[2];
  if (yearNow.length === 2) {
    yearNow = '20' + yearNow;
  }

  const time = new Date().toLocaleTimeString();
  const splitTime = time.split(':');
  const hourNow = splitTime[0];
  const minutesNow = splitTime[1];
  console.log(
    'FDJSLFS',
    yearNow,
    ' ',
    monthNow,
    ' ',
    dayNow,
    ' ',
    hourNow,
    ' ',
    minutesNow,
  );
  let totalSecondsNow = 0;
  if (splitTime[2].split(' ')[1]) {
    const am_pm = splitTime[2].split(' ')[1].toLowerCase();
    totalSecondsNow =
      Number(yearNow) * 31536000 +
      Number(monthNow) * 2629746 +
      Number(dayNow) * 86400 +
      Number(convertStandardToMilitary(hourNow, am_pm)) * 3600 +
      Number(minutesNow) * 60;
  } else {
    console.log(hourNow);
    totalSecondsNow =
      Number(yearNow) * 31536000 +
      Number(monthNow) * 2629746 +
      Number(dayNow) * 86400 +
      Number(hourNow) * 3600 +
      Number(minutesNow) * 60;
  }

  console.log(totalSecondsNow);

  return totalSecondsNow;
};

const calculateTimeUntilNextLunch = (date: string) => {
  const totalSecondsComp = calculateTotalSecondsComp(date);

  const totalSecondsNow = calculateTotalSecondsNow();

  console.log('totalSecondsNow - totalSecondsComp', totalSecondsComp);

  if (totalSecondsNow - totalSecondsComp < 0) {
    return -1;
  }

  return 30 * 24 * 60 * 60 - (totalSecondsNow - totalSecondsComp);
};

const convertStandardToMilitary = (hour: string, am_pm: string) => {
  console.log(am_pm);
  if (am_pm === 'pm') {
    if (Number(hour) === 12) {
      return '12';
    }
    const newHour = (Number(hour) + 12).toString();
    return newHour;
  }
  if (Number(hour) === 12) {
    return '0';
  }
  return hour;
};
