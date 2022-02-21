import React, {useCallback, useRef, useState} from 'react';
import {
  Dimensions,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {SafeAreaInsetsContext} from 'react-native-safe-area-context';
import Carousel from 'react-native-snap-carousel';
import Video, {LoadError, OnBufferData} from 'react-native-video';
import Spinner from 'react-native-loading-spinner-overlay';
import images from './assets/images';

type VideoItem = {
  id: number;
  url: string;
  title?: string;
};

const carouselItems: VideoItem[] = [
  // HLS
  {
    id: 102,
    title: 'HLS - manifest(format=m3u8-aapl)',
    url: 'http://amssamples.streaming.mediaservices.windows.net/91492735-c523-432b-ba01-faba6c2206a2/AzureMediaServicesPromo.ism/manifest(format=m3u8-aapl)',
  },
  {
    id: 100,
    title: 'HLS - manifest(format=m3u8-aapl)',
    url: 'https://multiplatform-f.akamaihd.net/i/multi/will/bunny/big_buck_bunny_,640x360_400,640x360_700,640x360_1000,950x540_1500,.f4v.csmil/master.m3u8',
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

const App = () => {
  const videoPlayer = useRef<Video>(null);
  const carousel = useRef<Carousel<string>>(null);
  const [playIndex, setPlayIndex] = useState<number>(0);
  const [isLoadingIndex, setIdLoadingIndex] = useState<boolean[]>([]);
  const [reloadIndex, setReloadIndex] = useState<number>(-1);
  const [errors, setErrors] = useState<boolean[]>([]);

  const onBuffer = (e: OnBufferData, index: number) => {
    console.log('onBuffer -> index', index, e);
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

  const handleProgress = useCallback((data, index) => {
    console.log('handleProgress -> index', index, data);
    if (
      data.playableDuration === 0 &&
      data.currentTime > 0 &&
      data.currentTime < data.seekableDuration
    ) {
      console.log('handleProgress -> error');
      setReloadIndex(index);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnload = useCallback((data, index) => {
    console.log('handleOnload -> data', data);
    const cloneIsLoadingIndex = [...isLoadingIndex];
    cloneIsLoadingIndex[index] = false;
    setIdLoadingIndex(cloneIsLoadingIndex);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOnloadStart = useCallback(
    (index: number) => {
      console.log('handleOnloadStart -> index', index, isLoadingIndex);
      const cloneIsLoadingIndex = [...isLoadingIndex];
      cloneIsLoadingIndex[index] = true;
      setIdLoadingIndex(cloneIsLoadingIndex);
    },
    [isLoadingIndex],
  );

  const handleOnloadEnd = useCallback(() => {
    console.log('handleOnloadEnd -> data');
  }, []);

  const onVideoPlayPauseClicked = (index: number) => {
    console.log('onVideoPlayPauseClicked', index, playIndex);
    setPlayIndex(playIndex === index ? -1 : index);
  };

  const renderItem = ({item, index}) => {
    const isLoading = isLoadingIndex[index];
    const isError = errors[index];
    const isReload = reloadIndex === index;
    const isPause = playIndex !== index;

    console.log('render item', reloadIndex, playIndex);

    return (
      <View style={{flex: 1}}>
        <View style={styles.viewTitle}>
          <Text style={styles.errorText}>{item.title}</Text>
        </View>
        <Video
          key={isReload ? `${item.id}-reloaded` : item.id}
          source={{
            uri: item.url,
            type: 'm3u8',
          }}
          ref={videoPlayer}
          onBuffer={e => onBuffer(e, index)}
          onError={data => videoError(data, index)}
          style={styles.mediaPlayer}
          resizeMode="cover"
          automaticallyWaitsToMinimizeStalling={false}
          paused={isPause}
          onEnd={handleOnloadEnd}
          repeat={true}
          onProgress={data => handleProgress(data, index)}
          onLoad={data => handleOnload(data, index)}
          onLoadStart={() => handleOnloadStart(index)}
          muted={true}
        />
        {isError && (
          <View style={styles.viewError}>
            <Text style={styles.errorText}>Cannot load this video</Text>
          </View>
        )}
        <Spinner
          visible={(isLoading && !isError) || isReload}
          textContent={'Loading...'}
          textStyle={styles.spinnerTextStyle}
        />
        <TouchableOpacity
          onPress={() => onVideoPlayPauseClicked(index)}
          style={[
            Platform.OS === 'ios'
              ? styles.viewBtnPlay
              : styles.viewBtnPlayAndroid,
          ]}>
          {isPause ? (
            <Image
              source={images.playBtn}
              resizeMode="contain"
              style={styles.iconPlay}
            />
          ) : (
            <View />
          )}
        </TouchableOpacity>
      </View>
    );
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
              onSnapToItem={setPlayIndex}
              enableMomentum={true}
              lockScrollWhileSnapping={true}
              inactiveSlideOpacity={1}
              inactiveSlideScale={1}
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
    height: 40,
    alignItems: 'center',
  },
  container: {flex: 1, flexDirection: 'row', justifyContent: 'center'},
  contentContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  mediaPlayer: {
    height: '100%',
    width: '100%',
    backgroundColor: 'white',
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
