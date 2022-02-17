import React, {useCallback, useRef, useState} from 'react';
import {Dimensions, StyleSheet, Text, View} from 'react-native';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import Carousel from 'react-native-snap-carousel';
import Video, {LoadError, OnBufferData} from 'react-native-video';
import Spinner from 'react-native-loading-spinner-overlay';

type VideoItem = {
  id: number;
  url: string;
};

const carouselItems: VideoItem[] = [
  // HLS
  {
    id: 1,
    url: 'https://aiapoc-aase.streaming.media.azure.net/7705433b-ae8c-4393-84f4-d92d83f2c208/VID_20220130_123824.ism/manifest(format=m3u8-aapl)',
  },
  {
    id: 2,
    url: 'https://aiapoc-aase.streaming.media.azure.net/7705433b-ae8c-4393-84f4-d92d83f2c208/VID_20220130_123824.ism/manifest(format=m3u8-cmaf)',
  },
  // Dash
  {
    id: 3,
    url: 'https://aiapoc-aase.streaming.media.azure.net/7705433b-ae8c-4393-84f4-d92d83f2c208/VID_20220130_123824.ism/manifest(format=mpd-time-csf)',
  },
  {
    id: 4,
    url: 'https://aiapoc-aase.streaming.media.azure.net/7705433b-ae8c-4393-84f4-d92d83f2c208/VID_20220130_123824.ism/manifest(format=mpd-time-cmaf)',
  },
  // SmoothStreaming
  {
    id: 5,
    url: 'https://aiapoc-aase.streaming.media.azure.net/7705433b-ae8c-4393-84f4-d92d83f2c208/VID_20220130_123824.ism/manifest',
  },
  // HLS
  {
    id: 6,
    url: 'https://aiapoc-aase.streaming.media.azure.net/ab4a57df-80bb-46ec-b3cb-55664ac57329/VID_20220208_161937.ism/manifest(format=m3u8-aapl)',
  },
  {
    id: 7,
    url: 'https://aiapoc-aase.streaming.media.azure.net/ab4a57df-80bb-46ec-b3cb-55664ac57329/VID_20220208_161937.ism/manifest(format=m3u8-cmaf)',
  },
  // Dash
  {
    id: 8,
    url: 'https://aiapoc-aase.streaming.media.azure.net/ab4a57df-80bb-46ec-b3cb-55664ac57329/VID_20220208_161937.ism/manifest(format=mpd-time-csf)',
  },
  {
    id: 9,
    url: 'https://aiapoc-aase.streaming.media.azure.net/ab4a57df-80bb-46ec-b3cb-55664ac57329/VID_20220208_161937.ism/manifest(format=mpd-time-cmaf)',
  },
  // SmoothStreaming
  {
    id: 10,
    url: 'https://aiapoc-aase.streaming.media.azure.net/ab4a57df-80bb-46ec-b3cb-55664ac57329/VID_20220208_161937.ism/manifest',
  },
];

const App = () => {
  const videoPlayer = useRef<Video>(null);
  const carousel = useRef<Carousel<string>>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [isLoadingIndex, setIdLoadingIndex] = useState<boolean[]>([]);
  const [errors, setErrors] = useState<boolean[]>([]);

  const onBuffer = (e: OnBufferData) => {
    console.log('onBuffer', e);
  };
  const videoError = useCallback(
    (e: LoadError, index: number) => {
      console.log('videoError -> index', index, e);
      const cloneErrors = [...errors];
      cloneErrors[index] = true;
      setErrors(cloneErrors);
    },
    [errors],
  );

  const handleProgress = useCallback(data => {
    console.log('handleProgress -> data', data);
  }, []);

  const handleOnload = useCallback(
    (data, index) => {
      console.log('handleOnload -> data', data);
      const cloneIsLoadingIndex = [...isLoadingIndex];
      cloneIsLoadingIndex[index] = false;
      setIdLoadingIndex(cloneIsLoadingIndex);
    },
    [isLoadingIndex],
  );

  const handleOnloadStart = useCallback(
    (index: number) => {
      console.log('handleOnloadStart -> index', index);
      const cloneIsLoadingIndex = [...isLoadingIndex];
      cloneIsLoadingIndex[index] = true;
      setIdLoadingIndex(cloneIsLoadingIndex);
    },
    [isLoadingIndex],
  );

  const handleOnloadEnd = useCallback(() => {
    console.log('handleOnloadEnd -> data');
  }, []);

  const tmp = Dimensions.get('window');
  const {width, height} = tmp;
  const renderItem = ({item, index}) => {
    const isLoading = isLoadingIndex[index];
    const isError = errors[index];

    console.log(
      'renderItem -> index',
      index,
      isLoading,
      isError,
      isLoading && !isError,
    );

    return (
      <View style={{flex: 1}}>
        <Spinner
          visible={isLoading && !isError}
          textContent={'Loading...'}
          textStyle={styles.spinnerTextStyle}
        />
        <Video
          key={item.id}
          source={{
            uri: item.url,
          }}
          ref={videoPlayer}
          onBuffer={onBuffer}
          onError={data => videoError(data, index)}
          style={styles.mediaPlayer}
          resizeMode="contain"
          automaticallyWaitsToMinimizeStalling={false}
          paused={index !== selectedIndex}
          onEnd={handleOnloadEnd}
          repeat={true}
          onProgress={handleProgress}
          onLoad={data => handleOnload(data, index)}
          onLoadStart={() => handleOnloadStart(index)}
        />
        {isError && (
          <View style={styles.viewError}>
            <Text style={styles.errorText}>Cannot load this video</Text>
          </View>
        )}
      </View>
    );
  };

  console.log('selected index', selectedIndex);

  return (
    <SafeAreaInsetsContext.Consumer>
      {insets => {
        let videoHeight = height;
        if (insets) {
          videoHeight = height - (insets?.top + insets?.bottom);
        }
        return (
          <View style={styles.container}>
            <Carousel
              layout={'default'}
              ref={carousel}
              data={carouselItems}
              sliderHeight={videoHeight}
              itemHeight={videoHeight}
              sliderWidth={width}
              itemWidth={width}
              vertical={true}
              renderItem={renderItem}
              onSnapToItem={setSelectedIndex}
              enableMomentum={true}
              decelerationRate={0.9}
            />
          </View>
        );
      }}
    </SafeAreaInsetsContext.Consumer>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, flexDirection: 'row', justifyContent: 'center'},
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  mediaPlayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: '#333',
  },
  safeArea: {flex: 1, backgroundColor: '#333'},
  viewError: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  errorText: {
    color: 'red',
    fontSize: 20,
  },
  spinnerTextStyle: {
    color: '#FFF',
  },
});

export default App;
