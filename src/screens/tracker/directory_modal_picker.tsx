import {useNavigation} from '@react-navigation/native';
import React, {FC, useEffect, useRef, useState} from 'react';
import {
  Keyboard,
  SafeAreaView,
  SectionList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import Modal from 'react-native-modal';
import SearchBar from 'react-native-search-bar';
import {atomicDirectory, atomic_people} from './people_list';

type Props = {
  toggleVisibility: () => void;
  isVisible: boolean;
  sendAtom: (response: any) => void;
};

export const DirectoryModalPicker: FC<Props> = props => {
  const searchRef = useRef<SearchBar>();
  const textInputRef = useRef<TextInput>();
  const [searchQuery, setSearchQuery] = useState('');
  const [aD, setAD] = useState(atomicDirectory);

  const navigation = useNavigation();

  useEffect(() => {
    textInputRef.current?.focus();
  }, []);

  const onTextChange = (text: string) => {
    setSearchQuery(text);
    const directory = atomic_people.filter(person => {
      const personLower = person.toLowerCase();
      const textLower = text.toLowerCase();
      return personLower.indexOf(textLower) > -1;
    });
    let dictionary = directory.reduce(
      (a, x) => ({
        ...a,
        [x[0].toUpperCase()]:
          a[x[0].toUpperCase()] === undefined
            ? x
            : a[x[0].toUpperCase()] + '/' + x,
      }),
      {},
    );

    const finDictionary = Object.keys(dictionary).map((key, index) => {
      return {title: key, data: dictionary[key].split('/') as string[]};
    });
    setAD(finDictionary.sort((a, b) => (a.title > b.title ? 1 : -1)));
  };
  return (
    <Modal
      isVisible={props.isVisible}
      onBackdropPress={props.toggleVisibility}
      onBackButtonPress={props.toggleVisibility}
      style={styles.view}
      backdropOpacity={0.3}
      animationIn={'slideInUp'}
      animationOut={'slideOutDown'}>
      <SafeAreaView
        style={[
          styles.container,
          {
            maxHeight: '85%',
            flex: 1,
            backgroundColor: 'white',
          },
        ]}>
        <View
          style={{
            flexDirection: 'row',
            paddingBottom: 12,
            alignItems: 'center',
            marginTop: 12,
          }}>
          <View style={styles.inputTextContainer}>
            <Icon
              size={18}
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
              onChangeText={onTextChange}
              value={searchQuery}
              editable={true}
              onSubmitEditing={() => {
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
          <TouchableOpacity
            onPress={() => {
              props.toggleVisibility();
              Keyboard.dismiss();
              textInputRef.current.blur();
            }}
            style={{padding: 5, marginRight: 5}}>
            <Icon
              size={30}
              name="close"
              type="material"
              color="#fd4f57"
              tvParallaxProperties={undefined}
            />
          </TouchableOpacity>
        </View>
        <SectionList
          sections={aD}
          renderItem={({item}) => (
            <TouchableOpacity
              onPress={() => {
                //@ts-ignore
                props.sendAtom(item);
                props.toggleVisibility();
              }}>
              <Text style={styles.item}>{item}</Text>
            </TouchableOpacity>
          )}
          onScroll={() => {
            Keyboard.dismiss();
            textInputRef.current.blur();
          }}
          renderSectionHeader={({section}) => (
            <Text style={styles.sectionHeader}>{section.title}</Text>
          )}
          //@ts-ignore
          keyExtractor={(item, index) => index}
        />
      </SafeAreaView>
    </Modal>
  );
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
  container: {
    flex: 1,
    paddingTop: 22,
    backgroundColor: 'white',
  },
  sectionHeader: {
    paddingTop: 2,
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 2,
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: 'rgba(240,240,240,1.0)',
  },
  item: {
    padding: 10,
    fontSize: 18,
    height: 44,
  },
  inputTextContainer: {
    borderWidth: 1,
    padding: 8,
    backgroundColor: 'white',
    borderColor: 'lightgrey',
    borderRadius: 5,
    height: 39,
    color: 'black',
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 7,
  },
  inputText: {
    padding: 8,
    backgroundColor: 'white',
    height: 37,
    color: 'black',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    minWidth: '70%',
  },
});
