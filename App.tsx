import React, {useRef, useState} from 'react';
import {Dimensions, SafeAreaView, StyleSheet, View} from 'react-native';
import Carousel from 'react-native-snap-carousel';
import Video, {LoadError, OnBufferData} from 'react-native-video';

const carouselItems = [
  {
    id: 1,
    url: 'https://aiapoc-aase.streaming.media.azure.net/7705433b-ae8c-4393-84f4-d92d83f2c208/VID_20220130_123824.ism/manifest(format=m3u8-aapl)',
  },
  {
    id: 2,
    url: 'https://video-previews.elements.envatousercontent.com/h264-video-previews/1877e986-9742-11e3-bf9f-005056926836/6885911.mp4',
  },
  {
    id: 3,
    url: 'https://video-previews.elements.envatousercontent.com/files/620ce13c-890e-48fa-a6a7-43cbdea227a7/video_preview_h264.mp4',
  },
  {
    id: 4,
    url: 'https://video-previews.elements.envatousercontent.com/files/abeba0b0-91b8-4a25-91fb-65b006bb2d9e/video_preview_h264.mp4',
  },
  {
    id: 5,
    url: 'https://video-previews.elements.envatousercontent.com/files/99f2bf4e-f4f8-493b-84db-a9d3719e55d6/video_preview_h264.mp4',
  },
  {
    id: 6,
    url: 'https://video-previews.elements.envatousercontent.com/h264-video-previews/3a084720-2ddc-42e2-b185-0bf00c01ffad/12516197.mp4',
  },
  {
    id: 7,
    url: 'https://video-previews.elements.envatousercontent.com/h264-video-previews/dd4e87a3-5cc5-42d3-a0d1-4e50698c8d5d/8794322.mp4',
  },
];

const App = () => {
  const videoPlayer = useRef<Video>(null);
  const carousel = useRef<Carousel<string>>(null);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  const onBuffer = (e: OnBufferData) => {
    console.log('onBuffer', e);
  };
  const videoError = (e: LoadError) => {
    console.log('videoError', e);
  };

  const tmp = Dimensions.get('window');
  const {width, height} = tmp;

  const renderItem = ({item, index}) => {
    return (
      <Video
        key={item.id}
        source={{
          uri: item.url,
        }}
        ref={videoPlayer}
        onBuffer={onBuffer}
        onError={videoError}
        style={styles.mediaPlayer}
        resizeMode="cover"
        automaticallyWaitsToMinimizeStalling={false}
        paused={index !== selectedIndex}
        repeat={true}
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Carousel
          layout={'default'}
          windowSize={1}
          ref={carousel}
          data={carouselItems}
          sliderHeight={height}
          itemHeight={height}
          sliderWidth={width}
          itemWidth={width}
          vertical={true}
          renderItem={renderItem}
          onSnapToItem={setSelectedIndex}
          enableMomentum={true}
          decelerationRate={0.9}
        />
      </View>
    </SafeAreaView>
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
  safeArea: {flex: 1, backgroundColor: 'rebeccapurple'},
});

export default App;
