
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      PORT: string;
      GOOGLE_APPLICATION_CREDENTIALS: string;
      FIREBASE_PROJECT_ID: string;
    }
  }
}

export {};
