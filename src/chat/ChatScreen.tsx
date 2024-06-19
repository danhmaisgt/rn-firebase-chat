import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  KeyboardAvoidingView,
  type StyleProp,
  StyleSheet,
  View,
  type ViewStyle,
  Keyboard,
  Text,
} from 'react-native';
import {
  type ComposerProps,
  GiftedChat,
  type GiftedChatProps,
  Bubble,
} from 'react-native-gifted-chat';
import TypingIndicator from 'react-native-gifted-chat/lib/TypingIndicator';
import { FirestoreServices } from '../services/firebase';
import { useChatContext, useChatSelector } from '../hooks';
import type {
  ConversationData,
  ConversationProps,
  IUserInfo,
  MessageProps,
} from '../interfaces';
import { formatMessageData } from '../utilities';
import { getConversation } from '../reducer/selectors';
import InputToolbar, { IInputToolbar } from './components/InputToolbar';
import { CustomBubble } from './components/CustomBubble';

interface ChatScreenProps extends GiftedChatProps {
  style?: StyleProp<ViewStyle>;
  memberIds: string[];
  partners: IUserInfo[];
  onStartLoad?: () => void;
  onLoadEnd?: () => void;
  maxPageSize?: number;
  inputToolbarProps?: IInputToolbar;
  hasCamera?: boolean;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  style,
  memberIds,
  partners,
  onStartLoad,
  onLoadEnd,
  maxPageSize = 20,
  renderComposer,
  inputToolbarProps,
  ...props
}) => {
  const { userInfo } = useChatContext();
  const conversation = useChatSelector(getConversation);

  const conversationInfo = useMemo(() => {
    return conversation;
  }, [conversation]);

  const firebaseInstance = useRef(FirestoreServices.getInstance()).current;
  const [messagesList, setMessagesList] = useState<MessageProps[]>([]);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);
  const isLoadingRef = useRef(false);
  const [userUnreadMessage, setUserUnreadMessage] = useState<boolean>(false);

  const conversationRef = useRef<ConversationProps | undefined>(
    conversationInfo
  );
  const messageRef = useRef<MessageProps[]>(messagesList);
  messageRef.current = messagesList;

  useEffect(() => {
    if (conversationInfo?.id) {
      onStartLoad?.();
      firebaseInstance.setConversationInfo(
        conversationInfo?.id,
        memberIds,
        partners
      );
      firebaseInstance.getMessageHistory(maxPageSize).then((res) => {
        setMessagesList(res);
        setHasMoreMessages(res.length === maxPageSize);
        firebaseInstance.changeReadMessage();
        onLoadEnd?.();
      });
    }
  }, [
    conversationInfo?.id,
    firebaseInstance,
    onLoadEnd,
    onStartLoad,
    memberIds,
    partners,
    maxPageSize,
  ]);

  const onSend = useCallback(
    async (messages: MessageProps) => {
      /** If the conversation not created yet. it will create at the first message sent */
      isLoadingRef.current = false;
      if (!conversationRef.current?.id) {
        conversationRef.current = await firebaseInstance.createConversation(
          memberIds,
          partners[0]?.name,
          partners[0]?.avatar
        );
        firebaseInstance.setConversationInfo(
          conversationRef.current?.id,
          memberIds,
          partners
        );
      }
      /** Add new message to message list  */
      setMessagesList((previousMessages) =>
        GiftedChat.append(previousMessages, [messages])
      );

      await firebaseInstance.sendMessage(messages.text);
    },
    [firebaseInstance, memberIds, partners]
  );

  const onLoadEarlier = useCallback(async () => {
    if (isLoadingRef.current) {
      return;
    }
    isLoadingRef.current = true;
    if (conversationRef.current?.id) {
      const res = await firebaseInstance.getMoreMessage(maxPageSize);
      const isMoreMessage = res.length === maxPageSize;
      setHasMoreMessages(isMoreMessage);
      isLoadingRef.current = !isMoreMessage;
      setMessagesList((previousMessages) =>
        GiftedChat.prepend(previousMessages, res)
      );
    }
  }, [maxPageSize, firebaseInstance]);

  useEffect(() => {
    return () => {
      firebaseInstance.clearConversationInfo();
    };
  }, [firebaseInstance]);

  useEffect(() => {
    let userConversation: () => void;
    userConversation = firebaseInstance.userConversationListener(
      (data: ConversationData | undefined) => {
        const memberId = partners[0]?.id;
        const unReads = data?.unRead ?? {};
        const hasUnreadMessages = Object.entries(unReads).some(
          ([key, value]) => key !== memberId && value > 0
        );
        setUserUnreadMessage(hasUnreadMessages);
      }
    );

    return () => {
      if (userConversation) {
        userConversation();
      }
    };
  }, [firebaseInstance, partners]);

  useEffect(() => {
    let receiveMessageRef: () => void;
    if (conversationRef.current?.id) {
      receiveMessageRef = firebaseInstance.receiveMessageListener(
        (message: MessageProps) => {
          if (userInfo && message.senderId !== userInfo.id) {
            const userInfoIncomming = {
              id: message.id,
              name: message.senderId,
            } as IUserInfo;
            const formatMessage = formatMessageData(message, userInfoIncomming);
            setMessagesList((previousMessages) =>
              GiftedChat.append(previousMessages, [formatMessage])
            );
            firebaseInstance.changeReadMessage();
          }
        }
      );
    }

    return () => {
      if (receiveMessageRef) {
        receiveMessageRef();
      }
    };
  }, [firebaseInstance, userInfo, conversationRef.current?.id]);

  const inputToolbar = useCallback(
    (composeProps: ComposerProps) => {
      if (renderComposer) return renderComposer(composeProps);
      return (
        <InputToolbar
          {...composeProps}
          hasCamera={props.hasCamera}
          {...inputToolbarProps}
        />
      );
    },
    [props.hasCamera, renderComposer, inputToolbarProps]
  );

  const renderBubble = (bubble: Bubble<MessageProps>['props']) => {
    if (props.renderBubble) return props.renderBubble(bubble);
    const imageUrl = bubble.currentMessage?.path;
    const isMyLatestMessage =
      !Object.keys(bubble?.nextMessage ?? {}).length &&
      bubble.position === 'right';
    const ViewRead = isMyLatestMessage && (
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          {userUnreadMessage ? 'Sent' : 'Seen'}
        </Text>
      </View>
    );

    if (!imageUrl) {
      return (
        <View>
          <Bubble {...bubble} />
          {ViewRead}
        </View>
      );
    }

    const styleBuble = {
      left: { backgroundColor: 'transparent' },
      right: { backgroundColor: 'transparent' },
    };

    return (
      <Bubble
        {...bubble}
        renderCustomView={() =>
          bubble.currentMessage && (
            <View>
              <CustomBubble
                message={bubble.currentMessage}
                position={bubble.position}
                selectedImgVideoUrl={(url) => setImgVideoUrl(url)}
              />
              {ViewRead}
            </View>
          )
        }
        wrapperStyle={styleBuble}
      />
    );
  };

  return (
    <View style={[styles.container, style]}>
      <KeyboardAvoidingView style={styles.container}>
        <GiftedChat
          messages={messagesList}
          onSend={(messages) => onSend(messages[0] as MessageProps)}
          user={{
            _id: userInfo?.id || '',
            ...userInfo,
          }}
          keyboardShouldPersistTaps={'always'}
          infiniteScroll
          loadEarlier={hasMoreMessages}
          renderChatFooter={() => <TypingIndicator />}
          onLoadEarlier={onLoadEarlier}
          renderComposer={inputToolbar}
          renderBubble={renderBubble}
          {...props}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusContainer: {
    backgroundColor: '#a9a9a9',
    borderRadius: 10,
    paddingVertical: 2,
    paddingHorizontal: 14,
    alignSelf: 'flex-end',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
  },
});
