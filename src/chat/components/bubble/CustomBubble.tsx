import React from 'react';
import { StyleSheet, View } from 'react-native';
import { MessageTypes, type MessageProps } from '../../../interfaces';
import { Bubble } from 'react-native-gifted-chat';
import {
  CustomImageVideoBubble,
  type CustomImageVideoBubbleProps,
} from './CustomImageVideoBubble';
import { CustomDocumentBubble } from './CustomDocumentBubble';

interface CustomBubbleProps {
  bubbleMessage: Bubble<MessageProps>['props'];
  position: 'left' | 'right';
  customImageVideoBubbleProps: CustomImageVideoBubbleProps;
  onSelectedMessage: (message: MessageProps) => void;
}

export const CustomBubble: React.FC<CustomBubbleProps> = ({
  bubbleMessage,
  position,
  customImageVideoBubbleProps,
  onSelectedMessage,
}) => {
  const styleBuble = {
    left: { backgroundColor: 'transparent' },
    right: { backgroundColor: 'transparent' },
  };

  const renderBubble = (currentMessage: MessageProps) => {
    switch (currentMessage?.type) {
      case MessageTypes.image:
      case MessageTypes.video:
        return (
          <Bubble
            {...bubbleMessage}
            renderCustomView={() =>
              currentMessage && (
                <CustomImageVideoBubble
                  {...customImageVideoBubbleProps}
                  message={currentMessage}
                  onSelectImgVideoUrl={(message) => onSelectedMessage(message)}
                  position={position}
                />
              )
            }
            wrapperStyle={styleBuble}
          />
        );
      case MessageTypes.document:
        return (
          <Bubble
            {...bubbleMessage}
            renderCustomView={() =>
              currentMessage && (
                <CustomDocumentBubble
                  message={currentMessage}
                  position={position}
                />
              )
            }
            wrapperStyle={styleBuble}
          />
        );

      default:
        return <Bubble {...bubbleMessage} />;
    }
  };

  return (
    <View style={styles.container}>
      {bubbleMessage.currentMessage &&
        renderBubble(bubbleMessage.currentMessage)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});