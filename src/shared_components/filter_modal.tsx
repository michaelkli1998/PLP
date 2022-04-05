import React, {FC, useState} from 'react';
import {View, Text, Button, StyleSheet, TouchableOpacity} from 'react-native';
import {Icon} from 'react-native-elements';
import Modal from 'react-native-modal';
import SegmentedControlTab from 'react-native-segmented-control-tab';

type Props = {
  toggleVisibility: () => void;
  isVisible: boolean;
  category: filterCategories;
  handleResponse: (response: any) => void;
};

export enum filterCategories {
  sortBy = 'sort by',
  price = 'price',
  distance = 'distance',
  rating = 'rating',
  visited = 'visited',
  open = 'open',
}

export const FilterModal: FC<Props> = props => {
  const [selectedPriceIndex, setSelectedPriceIndex] = useState([0]);

  const [selectedSortBy, setSelectedSortBy] = useState(0);

  const [selectedRating, setSelectedRating] = useState(0);

  const sendResponse = (category: any) => {
    if (category === filterCategories.price) {
      props.handleResponse(selectedPriceIndex);
    } else if (category === filterCategories.sortBy) {
      props.handleResponse(selectedSortBy);
    }
  };

  const priceList = ['$', '$$', '$$$', '$$$$'];

  const sortList = ['Relevance', 'Distance', 'Rating', 'Reviews'];

  const sortRating = ['All', '3.5', '4', '4.5'];

  const setSelectedIndices = (index: number) => {
    let tempList = [];
    if (selectedPriceIndex.includes(index)) {
      const newList = selectedPriceIndex.filter(item => item !== index);
      setSelectedPriceIndex(newList);
    } else {
      tempList.push(index);
      tempList = [...selectedPriceIndex, ...tempList];
      setSelectedPriceIndex(tempList);
    }
  };

  if (props.category === filterCategories.price) {
    return (
      <Modal
        isVisible={props.isVisible}
        onBackdropPress={props.toggleVisibility}
        onBackButtonPress={props.toggleVisibility}
        style={styles.view}
        backdropOpacity={0.3}>
        <View style={styles.content}>
          <Icon
            size={36}
            name="attach-money"
            type="material"
            color="#fd4f57"
            style={{marginBottom: 10}}
            tvParallaxProperties={undefined}
          />
          <Text style={styles.contentTitle}>Choose a price range</Text>
          <SegmentedControlTab
            multiple
            values={priceList}
            selectedIndices={selectedPriceIndex}
            onTabPress={setSelectedIndices}
            tabStyle={{borderColor: '#fd4f57', borderWidth: 2}}
            tabsContainerStyle={{height: 40}}
            activeTabStyle={{backgroundColor: '#fd4f57'}}
            tabTextStyle={{color: '#fd4f57', fontWeight: 'bold'}}
          />
          <TouchableOpacity
            onPress={() => {
              props.toggleVisibility();
              sendResponse(filterCategories.price);
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
    );
  } else if (props.category === filterCategories.sortBy) {
    return (
      <Modal
        isVisible={props.isVisible}
        onBackdropPress={props.toggleVisibility}
        onBackButtonPress={props.toggleVisibility}
        style={styles.view}
        backdropOpacity={0.3}>
        <View style={styles.content}>
          <Icon
            size={36}
            name="sort"
            type="material"
            color="#fd4f57"
            style={{marginBottom: 10}}
            tvParallaxProperties={undefined}
          />
          <Text style={styles.contentTitle}>Sort by</Text>
          <SegmentedControlTab
            values={sortList}
            selectedIndex={selectedSortBy}
            onTabPress={setSelectedSortBy}
            tabStyle={{borderColor: '#fd4f57', borderWidth: 2}}
            tabsContainerStyle={{height: 40}}
            activeTabStyle={{backgroundColor: '#fd4f57'}}
            tabTextStyle={{color: '#fd4f57', fontWeight: 'bold'}}
          />
          <TouchableOpacity
            onPress={() => {
              props.toggleVisibility();
              sendResponse(filterCategories.sortBy);
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
    );
  } else if (props.category === filterCategories.rating) {
    return (
      <Modal
        isVisible={props.isVisible}
        onBackdropPress={props.toggleVisibility}
        onBackButtonPress={props.toggleVisibility}
        style={styles.view}
        backdropOpacity={0.3}>
        <View style={styles.content}>
          <Icon
            size={36}
            name="star"
            type="material"
            color="#fd4f57"
            style={{marginBottom: 10}}
            tvParallaxProperties={undefined}
          />
          <Text style={styles.contentTitle}>Rating</Text>
          <SegmentedControlTab
            values={sortRating}
            selectedIndex={selectedRating}
            onTabPress={setSelectedRating}
            tabStyle={{borderColor: '#fd4f57', borderWidth: 2}}
            tabsContainerStyle={{height: 40}}
            activeTabStyle={{backgroundColor: '#fd4f57'}}
            tabTextStyle={{color: '#fd4f57', fontWeight: 'bold'}}
          />
          <TouchableOpacity
            onPress={() => {
              props.toggleVisibility();
              sendResponse(filterCategories.rating);
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
    );
  } else {
    return (
      <View style={styles.content}>
        <Text style={styles.contentTitle}>We Broke!!!</Text>
      </View>
    );
  }
};

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
});
