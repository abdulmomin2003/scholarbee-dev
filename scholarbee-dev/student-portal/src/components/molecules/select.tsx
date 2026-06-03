import { Box, FormControl, MenuItem, Select, Typography } from '@mui/material';
import React from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { SelectChangeEvent } from '@mui/material';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';

interface Options {
  value: string;
  label: string;
}

const GenericSelect = ({
  value,
  onChange,
  label,
  name,
  options,
  sx
}: {
  value: string;
  onChange: (event: SelectChangeEvent<string>, child: React.ReactNode) => void;
  label: string;
  name: string;
  options: Options[];
  sx?: object;
}) => {
  return (
    <Box mb={2} width="100%" data-test-id={`select-box-${name}`}>
      <FormControl fullWidth>
        <Typography
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            mb: 1
          }}
          fontWeight="medium"
          variant="body1"
          data-test-id={`select-label-${name}`}
        >
          {label}
        </Typography>
        <Select
          labelId={`select-${name}-label`}
          id={`select-${name}`}
          value={value}
          onChange={onChange}
          displayEmpty
          name={name}
          sx={{ borderRadius: '12px', ...sx }}
          IconComponent={
            label === 'Start Date'
              ? CalendarMonthOutlinedIcon
              : KeyboardArrowDownIcon
          }
          renderValue={(selected) => {
            if (selected?.length === 0) {
              return <em style={{ color: '#676D75' }}>{label}</em>;
            }
            return selected;
          }}
          data-test-id={`select-${name}`}
        >
          {options.map((item, index) => (
            <MenuItem
              key={index}
              value={item.value}
              data-test-id={`select-${name}-option-${index}`}
            >
              {item.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default GenericSelect;
