import {uniq} from 'lodash';
import React, {useCallback, useRef, useState} from 'react';
import {Dimensions, Platform, StyleSheet, Text, View} from 'react-native';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import Carousel from 'react-native-snap-carousel';
import Video, {LoadError, OnBufferData} from 'react-native-video';
import VideoPlayer from 'react-native-video-controls';

type VideoItem = {
  id: number;
  url: string;
  title?: string;
};

const carouselItems: VideoItem[] = [
  // HLS
  {
    id: 100,
    title: 'HLS - manifest(format=m3u8-aapl)',
    url: 'https://multiplatform-f.akamaihd.net/i/multi/will/bunny/big_buck_bunny_,640x360_400,640x360_700,640x360_1000,950x540_1500,.f4v.csmil/master.m3u8',
  },
  {
    id: 102,
    title: 'HLS - manifest(format=m3u8-aapl)',
    url: 'http://amssamples.streaming.mediaservices.windows.net/91492735-c523-432b-ba01-faba6c2206a2/AzureMediaServicesPromo.ism/manifest(format=m3u8-aapl)',
  },
  {
    id: 110,
    title: 'HLS - manifest(format=m3u8-aapl)',
    url: 'https://multiplatform-f.akamaihd.net/i/multi/april11/sintel/sintel-hd_,512x288_450_b,640x360_700_b,768x432_1000_b,1024x576_1400_m,.mp4.csmil/master.m3u8',
  },
  {
    id: 1,
    title: 'HLS - manifest(format=m3u8-aapl) - FPT',
    url: 'https://aiapoc-aase.streaming.media.azure.net/7705433b-ae8c-4393-84f4-d92d83f2c208/VID_20220130_123824.ism/manifest(format=m3u8-aapl)',
  },
  {
    id: 2,
    title: 'HLS - manifest(format=m3u8-cmaf) - FPT',
    url: 'https://aiapoc-aase.streaming.media.azure.net/7705433b-ae8c-4393-84f4-d92d83f2c208/VID_20220130_123824.ism/manifest(format=m3u8-cmaf)',
  },
  // Dash
  {
    id: 3,
    title: 'Dash - manifest(format=mpd-time-csf) - FPT',
    url: 'https://aiapoc-aase.streaming.media.azure.net/7705433b-ae8c-4393-84f4-d92d83f2c208/VID_20220130_123824.ism/manifest(format=mpd-time-csf)',
  },
  {
    id: 4,
    title: 'Dash - manifest(format=mpd-time-cmaf) - FPT',
    url: 'https://aiapoc-aase.streaming.media.azure.net/7705433b-ae8c-4393-84f4-d92d83f2c208/VID_20220130_123824.ism/manifest(format=mpd-time-cmaf)',
  },
  // SmoothStreaming
  {
    id: 5,
    title: 'SmoothStreaming - manifest(format=mpd-time-csf) - FPT',
    url: 'https://aiapoc-aase.streaming.media.azure.net/7705433b-ae8c-4393-84f4-d92d83f2c208/VID_20220130_123824.ism/manifest',
  },
  // HLS
  {
    id: 6,
    title: 'HLS - manifest(format=m3u8-aapl) - FPT ',
    url: 'https://aiapoc-aase.streaming.media.azure.net/ab4a57df-80bb-46ec-b3cb-55664ac57329/VID_20220208_161937.ism/manifest(format=m3u8-aapl)',
  },
  {
    id: 7,
    title: 'HLS - manifest(format=m3u8-cmaf) - FPT',
    url: 'https://aiapoc-aase.streaming.media.azure.net/ab4a57df-80bb-46ec-b3cb-55664ac57329/VID_20220208_161937.ism/manifest(format=m3u8-cmaf)',
  },
  // Dash
  {
    id: 8,
    title: 'Dash - manifest(format=mpd-time-csf) - FPT',
    url: 'https://aiapoc-aase.streaming.media.azure.net/ab4a57df-80bb-46ec-b3cb-55664ac57329/VID_20220208_161937.ism/manifest(format=mpd-time-csf)',
  },
  {
    id: 9,
    title: 'Dash - manifest(format=mpd-time-cmaf) - FPT',
    url: 'https://aiapoc-aase.streaming.media.azure.net/ab4a57df-80bb-46ec-b3cb-55664ac57329/VID_20220208_161937.ism/manifest(format=mpd-time-cmaf)',
  },
  // SmoothStreaming
  {
    id: 10,
    title: 'SmoothStreaming - manifest(format=mpd-time-csf) - FPT',
    url: 'https://aiapoc-aase.streaming.media.azure.net/ab4a57df-80bb-46ec-b3cb-55664ac57329/VID_20220208_161937.ism/manifest',
  },
];
const tmp = Dimensions.get('screen');
const {width, height} = tmp;
const isAndroid = Platform.OS === 'android';

const App = () => {
  const videoPlayer = useRef<Video>(null);
  const carousel = useRef<Carousel<string>>(null);
  const [playIndex, setPlayIndex] = useState<number>(0);
  const [reloadIndex, setReloadIndex] = useState<number>(-1);
  const errors = useRef<number[]>([]);

  const onBuffer = (e: OnBufferData, index: number) => {
    console.log('onBuffer -> index', index, e);
  };
  const videoError = (e: LoadError, index: number) => {
    console.log('videoError -> index', index, errors);
    errors.current = uniq([...errors.current, index]);
  };

  const handleProgress = useCallback((data, index) => {
    console.log('handleProgress -> index', index, data);
    if (
      data.playableDuration === 0 &&
      data.currentTime > 0 &&
      data.currentTime < data.seekableDuration
    ) {
      console.log('handleProgress -> error -> index', index);
      setReloadIndex(index);
    }
  }, []);

  const handleOnload = useCallback((data, index) => {
    console.log('handleOnload -> index', index);
  }, []);

  const handleOnloadStart = useCallback((index: number) => {
    console.log('handleOnloadStart -> index', index);
  }, []);

  const handleOnloadEnd = useCallback(() => {
    console.log('handleOnloadEnd -> data');
  }, []);

  const renderItem = ({item, index}) => {
    const isError = errors.current?.some(idx => idx === index);
    const isReload = reloadIndex === index;
    const isPause = playIndex !== index;

    console.log('render item -> index', index);
    console.log('render item -> errors', errors, isError);

    return (
      <View style={{flex: 1}}>
        <View style={styles.viewTitle}>
          <Text style={styles.errorText}>{item.title}</Text>
        </View>
        {!isError ? (
          <VideoPlayer
            key={isReload ? `${item.id}-reloaded` : item.id}
            source={{
              uri: item.url,
              type: 'm3u8',
            }}
            ref={videoPlayer}
            onBuffer={(e: OnBufferData) => onBuffer(e, index)}
            onError={(data: LoadError) => videoError(data, index)}
            videoStyle={styles.mediaPlayer}
            resizeMode="cover"
            automaticallyWaitsToMinimizeStalling={false}
            paused={isPause}
            onEnd={handleOnloadEnd}
            repeat={true}
            onProgress={(data: VideoItem) => handleProgress(data, index)}
            onLoad={(data: VideoItem) => handleOnload(data, index)}
            onLoadStart={() => handleOnloadStart(index)}
            muted={true}
            style={styles.controlView}
            tapAnywhereToPause={true}
            disableVolume={true}
            disableBack={true}
            disableFullscreen={true}
            ignoreSilentSwitch={'ignore'}
          />
        ) : (
          <View style={styles.viewError}>
            <Text style={styles.errorText}>Cannot load this video</Text>
          </View>
        )}
      </View>
    );
  };

  const onSnapToItem = (index: number) => {
    console.log('onSnapToItem -> index', index);
    setPlayIndex(index);
  };

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
              onSnapToItem={onSnapToItem}
              inactiveSlideOpacity={1}
              inactiveSlideScale={1}
              inactiveSlideShift={0}
              removeClippedSubviews={false}
              lockScrollWhileSnapping={isAndroid}
              disableIntervalMomentum
              enableSnap
              enableMomentum={false}
              decelerationRate={'fast'}
            />
          </View>
        );
      }}
    </SafeAreaInsetsContext.Consumer>
  );
};

const styles = StyleSheet.create({
  viewTitle: {
    position: 'absolute',
    zIndex: 100,
    top: Platform.OS === 'android' ? 20 : 60,
    left: 10,
    backgroundColor: '#00000',
    height: 100,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  controlView: {paddingBottom: 40},
  container: {flex: 1, flexDirection: 'row', justifyContent: 'center'},
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  mediaPlayer: {
    height: '100%',
    width: '100%',
    backgroundColor: '#333',
  },
  safeArea: {flex: 1, backgroundColor: '#333'},
  viewError: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 75,
    backgroundColor: '#333',
  },
  errorText: {
    color: 'red',
    fontSize: 20,
  },
  spinnerTextStyle: {
    color: '#FFF',
  },
  iconPlay: {
    width: 50,
    height: 50,
    opacity: 0.7,
  },
  btnPlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewBtnPlay: {
    alignItems: 'center',
    justifyContent: 'center',
    // top: 0,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
  },
  viewBtnPlayAndroid: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    right: 0,
    bottom: 0,
    left: 0,
    top: 0,
    position: 'absolute',
  },
});

export default App;
