export interface Partner {
  src: string;
  alt?: string;
}

export interface LogoSliderProps {
  partners: Array<Partner>;
  speed?: 'slow' | 'fast';
  direction?: 'left' | 'right';
  className?: string;
}

export interface AnimatedBoxProps {
  $animated?: boolean;
  $direction?: 'left' | 'right';
  $speed?: 'slow' | 'fast';
}
