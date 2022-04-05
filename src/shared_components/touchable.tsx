import { Platform, TouchableOpacity } from "react-native";
import { TouchableOpacity as TouchableOpacityIOS } from "react-native-gesture-handler";

export const Touchable =
  Platform.OS === "ios" ? TouchableOpacityIOS : TouchableOpacity;
