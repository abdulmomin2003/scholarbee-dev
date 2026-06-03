import React from 'react';
import { InputLabel, MenuItem, Select, SelectChangeEvent } from '@mui/material';
import { FormControl } from '@mui/material';

const SimpleSelect = ({
  value,
  handleChange,
  options,
  label
}: {
  value: string;
  handleChange: (event: SelectChangeEvent) => void;
  options: { label: string; value: string }[];
  label: string;
}) => {
  return (
    <FormControl sx={{ minWidth: 120 }}>
      <InputLabel id="demo-simple-select-label">{label}</InputLabel>
      <Select
        sx={{ borderRadius: '8px' }}
        labelId="demo-simple-select-label"
        id="demo-simple-select"
        value={value}
        label={label}
        onChange={handleChange}
      >
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default SimpleSelect;
