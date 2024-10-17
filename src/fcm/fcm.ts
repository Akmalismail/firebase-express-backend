import { JWT } from "google-auth-library";
import https from "https";
import {
  FCMMessageParams,
  INotificaion as INotification,
  JSONObject,
} from "../types/interfaces";
import dotenv from "dotenv";
import { Message } from "firebase-admin/lib/messaging/messaging-api";

dotenv.config();

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID;
const HOST = "fcm.googleapis.com";
const PATH = "/v1/projects/" + PROJECT_ID + "/messages:send";
const MESSAGING_SCOPE = "https://www.googleapis.com/auth/firebase.messaging";
const SCOPES = [MESSAGING_SCOPE];

export function getAccessToken(): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const jwtClient = new JWT({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: SCOPES,
    });

    jwtClient.authorize((err, tokens) => {
      if (err || tokens == undefined) {
        reject(err);
        return;
      }

      resolve(tokens.access_token as string);
    });
  });
}

export function sendFcmMessage(params: FCMMessageParams): Promise<JSONObject> {
  return new Promise(async (resolve, reject) => {
    const accessToken = await getAccessToken();

    const options = {
      hostname: HOST,
      path: PATH,
      method: "POST",
      // [START use_access_token]
      headers: {
        Authorization: "Bearer " + accessToken,
      },
      // [END use_access_token]
    };

    const message = buildFcmMessage(params);

    const req = https.request(options, function (res) {
      res.setEncoding("utf8");
      res.on("data", (data) => {
        console.log("Message sent to Firebase for delivery, response:");
        console.log(data);

        resolve({
          response: JSON.parse(data),
          payload: message as unknown as JSONObject,
        });
      });
    });

    req.on("error", function (err) {
      console.log("Unable to send message to Firebase");
      console.log(err);
      reject(err.message);
    });

    req.write(
      JSON.stringify({
        validate_only: params.validate_only,
        message: message,
      })
    );

    req.end();
  });
}

function buildFcmMessage(params: FCMMessageParams): Message {
  const { token, notification, data, androidPriority, iosPriority } = params;
  const message: Message = {
    token: token,
  };

  if (data) {
    message.data = typeof data === "boolean" ? buildData() : data;

    for (let field in message.data) {
      if (typeof message.data[field] == "object") {
        message.data[field] = JSON.stringify(message.data[field]);
      }
    }
  }

  if (notification) {
    message.notification =
      typeof notification === "boolean" ? buildNotification() : notification;
  }

  if (androidPriority) {
    message.android = {
      priority: androidPriority == "high" ? "high" : "normal",
    };
  }

  if (iosPriority) {
    const headers = {
      "apns-priority": iosPriority == "high" ? "5" : "10",
    };

    if (message.apns?.headers) {
      message.apns.headers = headers;
    } else {
      message.apns = {
        headers: headers,
      };
    }
  }

  console.log(message);

  return message;
}

function buildData(): {
  [key: string]: string;
} {
  return {
    foo: "bar",
    alice: "bob",
  };
}

function buildNotification(): INotification {
  return {
    title: "Notification Title",
    body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc sodales mi quam, vel placerat ante congue in. Vivamus bibendum tortor non vehicula placerat. Quisque luctus eros non enim consectetur, eget vestibulum justo ornare. Phasellus varius vulputate commodo. Mauris efficitur quam ac sem scelerisque, ac sollicitudin nunc lobortis. Nam interdum nisi ac elit iaculis pretium. Nulla ac diam quis sem blandit lobortis a vel risus. Curabitur lorem lorem, iaculis ut nibh ut, luctus imperdiet mauris. Praesent gravida, dui in finibus vehicula, ligula augue pulvinar turpis, at auctor sapien ipsum ac risus. Integer ultricies eros nec neque fermentum, at vehicula eros malesuada. Quisque porttitor blandit sapien, nec faucibus elit tempor sed. Ut id est non massa tempor finibus.",
    image: "https://picsum.photos/200.jpg",
  };
}
