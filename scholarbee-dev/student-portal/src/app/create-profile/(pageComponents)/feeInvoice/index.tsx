import { CustomTypography } from '@/components/atoms/customTypography';
import { Box, Button, Typography } from '@mui/material';
import React from 'react';
import Image from 'next/image';
import { BANKS, PAYMENT_OPTIONS } from '../../constants';
import ButtonsComponent from '../buttonsComponent';

const FeeInvoice = ({
  onNext,
  onPrev
}: {
  onNext: () => void;
  onPrev: () => void;
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext();
  };
  return (
    <Box component="form" onSubmit={handleSubmit} mt={3}>
      <CustomTypography fontSize={32} smallFont={18} fontWeight={600}>
        Fee Invoice
      </CustomTypography>
      <Typography variant="h6" fontWeight={500}>
        You are all set to apply for the admission now
      </Typography>
      <Typography variant="body2" fontSize={14}>
        Note: Before applying for any program, please refer to the eligibility
        criteria to ensure that you are qualifying for the respective program.
      </Typography>
      <Box mt={2}>
        {PAYMENT_OPTIONS.map((option, index) => (
          <PaymentOptionCard
            key={index}
            title={option.title}
            description={option.description}
            buttonText={option.buttonText}
            note={option.note}
            banks={BANKS}
          />
        ))}
      </Box>
      <ButtonsComponent goToPrevStep={onPrev} />
    </Box>
  );
};

export default FeeInvoice;

interface PaymentOptionCardProps {
  title: string;
  description: string;
  buttonText: string;
  note: string;
  banks: string[];
}

const PaymentOptionCard: React.FC<PaymentOptionCardProps> = ({
  title,
  description,
  buttonText,
  note,
  banks
}) => {
  return (
    <Box sx={styles.card}>
      <Box sx={styles.cardUpperSection}>
        <Box>
          <Typography fontWeight={600}>{title}</Typography>
          <Typography fontSize={12}>{description}</Typography>
        </Box>
        <Box display="flex" alignItems="center" flexDirection="row" gap={2}>
          {banks.map((icon, idx) => (
            <Image
              key={idx}
              alt="bank_icon"
              src={icon}
              height={32}
              width={32}
            />
          ))}
        </Box>
      </Box>
      <Box>
        <Button sx={styles.button} variant="contained">
          {buttonText}
        </Button>
        <Typography fontSize={12} color="error.main">
          {note}
        </Typography>
      </Box>
    </Box>
  );
};

const styles = {
  card: {
    p: 2,
    boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
    border: '1px solid var(--Stroke, #E8ECF4)',
    borderRadius: '8px',
    marginBottom: 2
  },
  cardUpperSection: {
    gap: 2,
    display: 'flex',
    flexDirection: {
      xs: 'column',
      sm: 'row'
    },
    justifyContent: 'space-between'
  },
  button: {
    py: '8px',
    my: 2
  }
};
