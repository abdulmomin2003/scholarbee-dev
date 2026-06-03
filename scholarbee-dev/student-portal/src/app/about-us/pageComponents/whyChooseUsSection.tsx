import Tag from '@/components/atoms/tag';
import { Box, Container, Grid, Stack, Typography } from '@mui/material';
import React from 'react';
import likeIcon from '@public/assets/svg/like.svg';
import Title from '@/components/atoms/title';
import { WHY_CHOOSE_US } from '@/constants';
import { WhyChooseUs } from '@/types';
const WhyChooseUsSection = () => {
  return (
    <Box>
      <Container>
        <Stack sx={{ textAlign: 'center', mt: 10 }} gap={2}>
          <Tag
            icon={likeIcon}
            sx={{ alignSelf: 'center' }}
            title="Why Choose Us"
          />
          <Title title="Discover the Scholarbee Difference" />
          <Typography variant="h6">
            Discover the Scholarbee Difference
          </Typography>
        </Stack>
        <Grid container sx={{ mt: { xs: 5, md: 7, lg: 10 } }}>
          {WHY_CHOOSE_US.map((item: WhyChooseUs) => (
            <Grid
              sx={styles.gridItem(item)}
              key={item.id}
              size={{ xs: 12, sm: 6, md: 3 }}
            >
              <Typography variant="h6">{item.title}</Typography>
              <Typography mt={5} variant="body1" fontSize={14}>
                {item.desc}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default WhyChooseUsSection;

const styles = {
  gridItem: (item: WhyChooseUs) => {
    return {
      color: item.focused ? 'white' : 'inherit',
      textAlign: 'center',
      backgroundColor: item.focused ? '#004ae0' : 'white',
      py: 5,
      px: 3,
      borderBottom: {
        xs: '2px solid var(--Stroke, #E8ECF4)',
        sm:
          item.id === 3 || item.id === 4
            ? 'none'
            : '2px solid var(--Stroke, #E8ECF4)',
        md: '2px solid var(--Stroke, #E8ECF4)'
      },
      borderRight: {
        xs: 'none',
        sm: '2px solid var(--Stroke, #E8ECF4)',
        md: item.id !== 4 ? '2px solid var(--Stroke, #E8ECF4)' : 'none'
      }
    };
  }
};
