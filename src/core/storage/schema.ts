export const PAIRLUNCHLIST_SCHEMA = "PairLunchList";
export const PAIRLUNCH_SCHEMA = "PairLunch";

export const PairLunchSchema = {
  name: PAIRLUNCH_SCHEMA,
  embedded: true,
  properties: {
    id: "objectId",
    atom: { type: "string", indexed: true },
    date: "string",
    restaurant: "string",
    color: "string",
    column: "int",
  },
};

export const PairLunchListSchema = {
  name: PAIRLUNCHLIST_SCHEMA,
  primaryKey: "id",
  properties: {
    id: "objectId",
    atom: "string",
    lunches: { type: "list", objectType: PAIRLUNCH_SCHEMA },
  },
};

export type PairLunchListObject = {
  id: string,
  atom: string,
  lunches: [string],
};
