import React from 'react';
import { View, TouchableOpacity, Image, StyleSheet, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { formatTime } from '../../utilities';

interface AudioPlayerControlsProps {
  isPlaying: boolean;
  playPause: () => void;
  currentPositionSec: number;
  currentDurationSec: number;
  onSlide: (value: number) => void;
}

const ImageURL = {
  playIcon: require('../../images/play_white.png'),
  pauseIcon: require('../../images/pause_white.png'),
};

export const AudioPlayerControls: React.FC<AudioPlayerControlsProps> = ({
  isPlaying,
  playPause,
  currentPositionSec,
  currentDurationSec,
  onSlide,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.buttonPlaying} onPress={playPause}>
        <Image
          source={isPlaying ? ImageURL.pauseIcon : ImageURL.playIcon}
          style={styles.icon}
        />
      </TouchableOpacity>
      <View style={styles.controls}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={currentDurationSec}
          value={currentPositionSec}
          onSlidingComplete={onSlide}
          minimumTrackTintColor="#1FB28A"
          maximumTrackTintColor="#d3d3d3"
          thumbTintColor="#1FB28A"
        />
      </View>
      <Text style={styles.timer}>{formatTime(currentPositionSec / 1000)}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    minWidth: 100,
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    fexDirection: 'row',
    backgroundColor: '#e1ffc7',
    borderRadius: 20,
    overflow: 'hidden',
    borderColor: '#d3d3d3',
  },
  buttonPlaying: {
    marginLeft: 10,
  },
  icon: {
    width: 25,
    height: 25,
    tintColor: 'black',
  },
  controls: {
    width: 140,
    height: 40,
  },
  slider: {
    flex: 1,
    marginHorizontal: 10,
  },
  timer: {
    width: 50,
    textAlign: 'center',
  },
});
