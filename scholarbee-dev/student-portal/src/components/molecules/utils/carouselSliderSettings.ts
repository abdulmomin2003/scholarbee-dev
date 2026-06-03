import { useTheme, useMediaQuery } from '@mui/material';

interface CarouselSliderSettingsOptions {
  breakpoint?: number; // Custom breakpoint for medium screens (default: 1024)
  slidesToShowMedium?: number; // Slides to show at medium breakpoint (default: 2)
}

export const useCarouselSliderSettings = (
  options: CarouselSliderSettingsOptions = {}
) => {
  const theme = useTheme();
  const isMdOrLarger = useMediaQuery(theme.breakpoints.up('md'), {
    noSsr: true
  });

  const { breakpoint = 1024, slidesToShowMedium = 2 } = options;

  return {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: isMdOrLarger ? 3 : 1,
    slidesToScroll: 1,
    arrows: false,
    responsive: [
      {
        breakpoint,
        settings: {
          slidesToShow: slidesToShowMedium,
          slidesToScroll: 1
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };
};
