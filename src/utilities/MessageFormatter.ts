/**
 * Created by NL on 6/1/23.
 */
import { decryptData, generateKey } from './AESCrypto';
import {
  type IUserInfo,
  type LatestMessageProps,
  type MessageProps,
  MessageStatus,
  type SendMessageProps,
} from '../interfaces';

const formatMessageData = (message: MessageProps, userInfo: IUserInfo) => {
  return {
    ...message,
    _id: message.id,
    createdAt: message.createdAt || Date.now(),
    user: {
      _id: userInfo.id,
      name: userInfo.name,
      avatar: userInfo.avatar,
    },
  };
};

const formatEncryptedMessageData = async (
  text: string,
  conversationId: string
) => {
  return generateKey(conversationId, 'salt', 5000, 256).then((key) => {
    return decryptData(text, key)
      .then((decryptedMessage) => {
        return decryptedMessage || text;
      })
      .catch(() => {
        return text;
      });
  });
};

const formatSendMessage = (
  userId: string,
  message: string
): SendMessageProps => ({
  readBy: {
    [userId]: true,
  },
  status: MessageStatus.received,
  senderId: userId,
  createdAt: Date.now(),
  text: message,
});

const formatLatestMessage = (
  userId: string,
  message: string
): LatestMessageProps => ({
  text: message,
  senderId: userId,
  readBy: {
    [userId]: true,
  },
});

export {
  formatMessageData,
  formatEncryptedMessageData,
  formatSendMessage,
  formatLatestMessage,
};
