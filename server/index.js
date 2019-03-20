import express from 'express';
import Expo from 'expo-server-sdk';

const app = express();
const expo = new Expo();

let savedPushTokens = [];
const PORT_NUMBER = 3000;

const saveToken = (token) => {
  if (savedPushTokens.indexOf(token === -1)) {
    savedPushTokens.push(token);
  }
}

const handlePushTokens = (message) => {
  let notifications = [];
  for (let pushToken of savedPushTokens) {
    if (!Expo.isExpoPushToken(pushToken)) {
      console.error(`Push token ${pushToken} is not a valid Expo push token`);
      return;
    }
    notifications.push({
      to: pushToken,
      sound: 'default',
      title: 'Message received!',
      body: message,
      data: { message },
    });
  }
  let chunks = expo.chunkPushNotifications(notifications);
  (async () => {
    for (let chunk of chunks) {
      try {
        let receipts = await expo.sendPushNotificationsAsync(chunk);
        console.log(receipts);
      } catch (error) {
        console.error(error);
      }
    }
  })();
}

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Push Notification Server Running');
});

app.post('/token', (req, res) => {
  const { value } = req.body.token;
  saveToken(value);
  console.log(`Received push token, ${value}`);
  res.send(`Received push token, ${value}`);
});

app.post('/message', (req, res) => {
  const { message } = req.body;
  handlePushTokens(message);
  console.log(`Received message, ${message}`);
  res.send(`Received message, ${message}`);
});

app.listen(PORT_NUMBER, () => console.log(`Server Online on Port ${PORT_NUMBER}`));
