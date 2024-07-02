/**
 * Created by NL on 6/27/23.
 */
import type { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import type { BaseEntity } from './base';
import type { LatestMessageProps, MediaType } from './message';

interface MemberProps {
  [userId: string]: FirebaseFirestoreTypes.DocumentReference;
}

interface CustomConversationInfo {
  id: string;
  name?: string;
  image?: string;
}

interface ConversationProps extends BaseEntity {
  latestMessage?: LatestMessageProps;
  updatedAt: number;
  members: string[];
  name?: string;
  image?: string;
  typing?: {
    [userId: string]: boolean;
  };
  unRead?: {
    [userId: string]: number;
  };
}

enum MessageTypes {
  text = 'text',
  image = 'image',
  voice = 'voice',
  video = 'video',
  document = 'document',
}

enum MessageStatus {
  sending,
  sent,
  failed,
  read,
}

interface MediaFile {
  id: string;
  path: string;
  type: MediaType;
}

export {
  ConversationProps,
  MemberProps,
  MessageTypes,
  MessageStatus,
  MediaFile,
  CustomConversationInfo,
};
