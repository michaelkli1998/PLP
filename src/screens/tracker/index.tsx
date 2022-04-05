import React, { FC, useState } from "react";
import { LogBox, SafeAreaView, StatusBar, StyleSheet } from "react-native";
import { DnDBoard } from "./draggable_grid";
LogBox.ignoreLogs(["Animated: `useNativeDriver` was not specified."]); // Ignore log notification by message
LogBox.ignoreLogs(["Module RNBubbleSelectNodeViewManager"]); // Ignore log notification by message

export const Tracker: FC = ({ route }) => {
  const backgroundStyle = {
    backgroundColor: "#fd4f57",
  };
  const [data, setData] = useState([]);

  // TODO:
  // 1. Implement draggable grid https://github.com/SHISME/react-native-draggable-grid
  // 2. Implement long press and hold to reveal edit and delete. Different atom list view that I can edit the name?
  // 3. Change date to days remaining until next pair lunch.
  // 4. Search the grid functionality by editing the array?

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar animated={true} backgroundColor="#fd4f57" />
      <DnDBoard
        atomic_people={data}
        pre_restaurant={route.params ? route.params.restaurant : null}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
