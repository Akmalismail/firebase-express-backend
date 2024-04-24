import { Notification } from "firebase-admin/lib/messaging/messaging-api";
import { JSONValue } from "./types";

export interface JSONObject {
  [x: string]: JSONValue;
}

export interface JSONArray extends Array<JSONValue> {}

export interface FCMMessageParams {
  token: string;
  notification?: boolean;
  data?: boolean;
  androidPriority?: 'high' | 'normal',
  iosPriority?: 'high' | 'normal'
}

export interface INotificaion extends Notification {
  image: string,
}