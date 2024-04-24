import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { getAccessToken, sendFcmMessage } from "./fcm/fcm";
import { FCMMessageParams } from "./types/interfaces";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", async (req: Request, res: Response) => {
  res.json({
    message: "ok",
    tokenGenerated: (await getAccessToken()) != undefined,
  });
});

app.post("/send", async (req: Request, res: Response) => {
  const payload: FCMMessageParams = req.body;

  if (payload == undefined || payload.token == undefined) {
    res.status(400);
    res.send({
      message: "missing token",
    });
    return;
  }

  try {
    const result = await sendFcmMessage(payload);
    res.contentType('application/json')
    res.send(result);
  } catch (e) {
    res.status(400);
    res.send({
      message: "failed",
      details: e,
    });
  }
});

app.listen(port, async () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
  console.log(`Token Generated: ${(await getAccessToken()) != undefined}`);
});
