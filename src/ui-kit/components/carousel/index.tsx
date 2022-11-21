import Carousel, { CarouselProps } from 'antd/lib/carousel';
import React, { ReactElement } from 'react';

type ACarouselProps = CarouselProps;

export function ACarousel(props: ACarouselProps): ReactElement {
  return <Carousel {...props} />;
}
