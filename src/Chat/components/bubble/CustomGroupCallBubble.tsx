import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Pressable,
  Image,
  ViewStyle,
  StyleProp,
  ImageStyle,
  Text,
  TextProps,
  ActivityIndicator,
} from 'react-native';
import type { MessageProps } from '../../../interfaces';
import { FirestoreServices } from 'src/services/firebase';
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore';

export interface CustomGroupCallBubbleProps {
  message: MessageProps;
  position: 'left' | 'right';
  bubbleContainerStyle?: StyleProp<ViewStyle>;
  buttonStyle?: StyleProp<ViewStyle>;
  iconStyle?: StyleProp<ImageStyle>;
  textStyle?: StyleProp<TextProps>;
  textSizeStyle?: StyleProp<TextProps>;
  onPressCallback?: (ref: FirebaseFirestoreTypes.DocumentReference) => void;
}

const Icons = {
  video: {
    ended: require('../../../images/endvoice_icon.png'),
    default: require('../../../images/invoice_icon.png'),
  },
  voice: {
    ended: require('../../../images/endvoice_icon.png'),
    default: require('../../../images/invoice_icon.png'),
  },
};

export const CustomGroupCallBubble: React.FC<CustomGroupCallBubbleProps> = ({
  position,
  message,
  iconStyle,
  bubbleContainerStyle,
  buttonStyle,
  textStyle,
  textSizeStyle,
  onPressCallback,
}) => {
  const firebaseInstance = useRef(FirestoreServices.getInstance()).current;
  const [loading, setLoading] = useState(true);
  const [isEnded, setIsEnded] = useState(false);
  const isVideoCall = message.type?.includes('video');

  const getIcon = () => {
    if (isVideoCall) {
      if (isEnded) return Icons.video.ended;
      return Icons.video.default;
    }
    if (isEnded) return Icons.voice.ended;
    return Icons.voice.default;
  };

  const getText = () => {
    if (isVideoCall) {
      return `${isEnded ? 'Ended' : 'In'} Video Call`;
    }
    return `${isEnded ? 'Ended' : 'In'} Voice Call`;
  };

  const handlePress = useCallback(() => {
    if (isEnded) return;
    const callRef = firestore().collection('calls').doc(message.id);
    onPressCallback?.(callRef);
  }, [isEnded, message.id, onPressCallback]);

  const checkCallStatus = useCallback(async () => {
    const isCallEnded = await firebaseInstance.checkIsCallEnded(message.id);
    setIsEnded(isCallEnded);
    setLoading(false);
  }, [firebaseInstance, message.id]);

  useEffect(() => {
    checkCallStatus();
  }, [checkCallStatus]);

  return (
    <View
      style={[
        styles.bubbleContainer,
        bubbleContainerStyle,
        position === 'left' ? styles.flexStart : styles.flexEnd,
      ]}
    >
      <Pressable onPress={handlePress} style={buttonStyle}>
        <View style={styles.wrapper}>
          {loading ? (
            <ActivityIndicator color={'white'} animating size="small" />
          ) : (
            <Image
              source={getIcon()}
              style={[styles.icon, iconStyle]}
              resizeMode="contain"
            />
          )}
          <View style={[styles.groupText]}>
            <Text style={[styles.text, textStyle]}>{getText()}</Text>
            {!isEnded && (
              <Text style={[styles.size, textSizeStyle]}>Tap to join</Text>
            )}
          </View>
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  bubbleContainer: {
    backgroundColor: '#323F4B',
    borderRadius: 10,
    paddingHorizontal: 5,
    marginBottom: 4,
  },
  flexEnd: {
    justifyContent: 'flex-end',
  },
  flexStart: {
    justifyContent: 'flex-start',
  },
  icon: {
    width: 44,
    height: 44,
  },
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  groupText: {
    marginLeft: 10,
  },
  text: {
    fontSize: 15,
    color: 'white',
    fontWeight: 'bold',
  },
  size: {
    fontSize: 13,
    color: '#9C9CA3',
    marginTop: 5,
  },
});
