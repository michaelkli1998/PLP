import Realm from "realm";
import {
  PairLunchListSchema,
  PAIRLUNCHLIST_SCHEMA,
  PairLunchSchema,
} from "./schema";

export const databaseOptions = {
  schema: [PairLunchListSchema, PairLunchSchema],
  schemaVersion: 0,
};

export const getRealm = async () => {
  const realm = await Realm.open({
    path: "pairLunchPicker.realm",
    schema: [PairLunchListSchema, PairLunchSchema],
    schemaVersion: 0,
  });
  return realm;
};

export const getRealmLunches = async () => {
  const realm = await getRealm();
  const allPairLunchLists: any = realm.objects(PAIRLUNCHLIST_SCHEMA);
  if (allPairLunchLists[0] !== undefined) {
    return allPairLunchLists[0].lunches;
  }
  return [];
};

export default new Realm(databaseOptions);
