import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Permissions, Notifications } from 'expo';

const PUSH_REGISTRATION_ENDPOINT = 'http://6b25258b.ngrok.io/token';
const MESSAGE_ENDPOINT = 'http://6b25258b.ngrok.io/message';

export default class App extends React.Component {
  state = {
    notification: null,
    messageText: '',
  }

  componentDidMount() {
    this.registerForPushNotificationsAsync();
  }
  
  handleNotification = notification => {
    console.log(notification)
    const { data } = notification;
    alert(data.message);
  };

  registerForPushNotificationsAsync = async () => {
    const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
    if (status !== 'granted') return;
    let token = await Notifications.getExpoPushTokenAsync();
    fetch(PUSH_REGISTRATION_ENDPOINT, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: {
          value: token,
        },
        user: {
          username: 'dporras',
          name: 'David Porras',
        },
      }),
    });
    this.notificationSubscription = Notifications.addListener(this.handleNotification);
  }

  handleChangeText = text => this.setState({ messageText: text });

  sendMessage = async () => {
    const { messageText } = this.state;
    fetch(MESSAGE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: messageText,
      }),
    });
    this.setState({ messageText: '' });
  }

  render() {
    const { messageText, notification } = this.state;
    const { textInput, button, buttonText } = styles;
    return (
      <View style={styles.container}>
        <TextInput
          value={messageText}
          onChangeText={this.handleChangeText}
          style={textInput}
        />
        <TouchableOpacity
          style={button}
          onPress={this.sendMessage}
        >
          <Text style={buttonText}>Send</Text>
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#474747',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    height: 50,
    width: 300,
    borderColor: '#f6f6f6',
    borderWidth: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  button: {
    padding: 10,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
  },
  label: {
    fontSize: 18,
  },
});
