import React from "react";

export function useToggle(
  initialValue: boolean = false
): [boolean, () => void] {
  const [value, setValue] = React.useState<boolean>(initialValue);
  const toggle = React.useCallback(() => {
    setValue((v) => !v);
  }, []);
  return [value, toggle];
}

export function useToggleTrue(
  initialValue: boolean = true
): [boolean, () => void] {
  const [value, setValue] = React.useState<boolean>(initialValue);
  const toggle = React.useCallback(() => {
    setValue((v) => !v);
  }, []);
  return [value, toggle];
}

export const getAddress = (location: string) => {
  if (location === "Ann Arbor") {
    return "206 S 5th Ave #300, Ann Arbor, MI 48104";
  } else if (location === "Grand Rapids") {
    return "1034 Wealthy St SE, Grand Rapids, MI 49506";
  } else if (location === "Chicago") {
    return "500 W Madison St Suite 1000, Chicago, IL 60661";
  } else if (location === "Troy") {
    return "2241 Radcliffe Dr, Troy, MI 48085";
  } else {
    return "206 S 5th Ave #300, Ann Arbor, MI 48104";
  }
};
