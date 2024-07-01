/* eslint-disable react/iframe-missing-sandbox */
import { isCN } from '@/assets/locales';
import { useLanguage } from '@/utils/useLanguage';
import { CSSProperties, useMemo, useRef } from 'react';

interface VideoTitle {
  deployWithNode: string;
  deployWithDocker: string;
}

const VIDEO_META: Record<'domestic' | 'international', VideoTitle> = {
  domestic: {
    deployWithNode:
      'https://player.bilibili.com/player.html?isOutside=true&aid=913960264&bvid=BV1oM4y1p7Le&cid=1211906812&p=1',
    deployWithDocker:
      'https://player.bilibili.com/player.html?isOutside=true&aid=658778004&bvid=BV1Ph4y1y78R&cid=1209124922&p=1',
  },
  international: {
    deployWithNode: 'https://www.youtube.com/embed/5zVnFPjursQ',
    deployWithDocker: 'https://www.youtube.com/embed/AYD84Kht5yA',
  },
};

interface Props {
  title: keyof VideoTitle;
  style?: CSSProperties;
}

export const EmbedVideo = ({ title, style = {} }: Props) => {
  const [lang] = useLanguage();
  const bFrame = useRef<HTMLIFrameElement | null>(null);
  const videoSource = useMemo(() => {
    if (isCN()) {
      return VIDEO_META.domestic[title];
    }
    return VIDEO_META.international[title];
  }, [title]);

  if (lang !== 'zh') {
    return (
      <iframe
        width="100%"
        src={videoSource}
        title="Using Node Deploy PageSpy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        style={style}
      />
    );
  }
  return (
    <iframe
      ref={bFrame}
      width="100%"
      src={videoSource}
      scrolling="no"
      allowFullScreen
      style={style}
      onLoad={() => {
        if (!bFrame.current) return;
        const doc = bFrame.current.contentDocument;
        const video = doc?.querySelector('video') as HTMLVideoElement;
        if (!video) return;
        console.log(video.paused);
        if (!video.paused) {
          video.pause();
        }
      }}
    />
  );
};
