import { COUNTRIES } from '@/constants';
import { Autocomplete, Box, TextField } from '@mui/material';
import Image from 'next/image';

const CountrySelect = ({ placeholder }: { placeholder?: string }) => {
  return (
    <Autocomplete
      id="country-select-auto-complete"
      options={COUNTRIES}
      autoHighlight
      getOptionLabel={(option) => option.label}
      renderOption={(props, option) => {
        const { key, ...optionProps } = props;
        return (
          <Box
            key={key}
            component="li"
            sx={{ '& > img': { mr: 2, flexShrink: 0 } }}
            {...optionProps}
          >
            <Image
              loading="lazy"
              width={20}
              height={20}
              style={{
                maxWidth: 20,
                maxHeight: 20,
                width: 'auto',
                height: 'auto',
                objectFit: 'contain'
              }}
              src={`https://flagcdn.com/w20/${option.code.toLowerCase()}.png`}
              alt=""
            />
            {option.label} ({option.code}) +{option.phone}
          </Box>
        );
      }}
      renderInput={(params) => (
        <TextField
          placeholder={placeholder || 'Select Country'}
          {...params}
          inputProps={{
            ...params.inputProps,
            autoComplete: 'new-password' // disable autocomplete and autofill
          }}
        />
      )}
    />
  );
};

export default CountrySelect;
