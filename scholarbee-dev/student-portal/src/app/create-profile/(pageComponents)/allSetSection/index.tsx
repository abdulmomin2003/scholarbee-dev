import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import React from 'react';
import editIcon from '@public/assets/svg/edit.svg';
import completeIcon from '@public/assets/svg/Checkbox.svg';
import ButtonsComponent from '../buttonsComponent';
import { ALL_SECTIONS_INFO } from '../../constants';

const AllSetSection = ({
  onNext,
  onPrev,
  getToSection
}: {
  onNext: () => void;
  onPrev: () => void;
  getToSection: (step: number) => void;
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };

  return (
    <>
      <Box component="form" onSubmit={handleSubmit} mt={4} gap={1}>
        <Typography variant="h6" fontWeight={500}>
          You are all set to apply for the admission now
        </Typography>
        <Typography variant="body2" fontSize={14}>
          You will not be able to change any
        </Typography>
        <Box mt={2}>
          {ALL_SECTIONS_INFO.map((item, index) => (
            <Box key={index} sx={styles.card}>
              <Box>
                <Typography fontWeight={600}>{item.title}</Typography>
                <Typography variant="body2" fontSize={14}>
                  {item.description}
                </Typography>
              </Box>
              <Box
                display={'flex'}
                alignItems="center"
                flexDirection="row"
                gap={3}
              >
                <Image
                  onClick={() => getToSection(item.step)}
                  src={editIcon}
                  alt="edit_icon"
                  style={{ cursor: 'pointer' }}
                />
                <Image src={completeIcon} alt="complete_icon" />
              </Box>
            </Box>
          ))}
        </Box>
        <ButtonsComponent goToPrevStep={onPrev} />
      </Box>
    </>
  );
};

export default AllSetSection;

const styles = {
  card: {
    p: 2,
    boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
    border: '1px solid var(--Stroke, #E8ECF4);',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2
  }
};
