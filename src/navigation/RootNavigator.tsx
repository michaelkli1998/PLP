import { createStackNavigator } from "@react-navigation/stack";
import * as React from "react";
import { HomeScreen } from "../screens/home";
import { DetailedRestaurantView } from "../screens/drv";
import { TabNavigator } from "./BottomTabNavigator";
import { AtomicPeopleView } from "../screens/profile";

const RootStack = createStackNavigator();

export const RootNavigator: React.FC = () => {
  return (
    <RootStack.Navigator>
      <RootStack.Screen
        name={"Back"}
        component={TabNavigator}
        options={{
          headerShown: false,
        }}
      />
      <RootStack.Screen
        name={"Launch"}
        component={HomeScreen}
        options={{
          title: "",
          headerStyle: {
            backgroundColor: "#fd4f57",
          },
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 20,
          },
          headerShown: false,
        }}
      />
      <RootStack.Screen
        name={"Detailed Restaurant View"}
        component={DetailedRestaurantView}
        options={{
          title: "Let's Eat!",
          headerStyle: {
            backgroundColor: "#fd4f57",
          },
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 20,
          },
        }}
      />
      <RootStack.Screen
        name={"Atomic People View"}
        component={AtomicPeopleView}
        options={{
          title: "Atom Info",
          headerStyle: {
            backgroundColor: "#fd4f57",
          },
          headerTitleStyle: {
            fontWeight: "bold",
            fontSize: 20,
          },
        }}
      />
    </RootStack.Navigator>
  );
};
