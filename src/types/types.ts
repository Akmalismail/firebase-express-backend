import { JSONArray, JSONObject } from "./interfaces";

export type JSONValue =
    | string
    | number
    | boolean
    | JSONObject
    | JSONArray;