import { Typography, Autocomplete, TextField } from '@mui/material';

interface AutocompleteFieldProps {
  label: string;
  options: Array<{ label: string; value: string }>;
  onChange: (value: string) => void;
  placeholder: string;
  value: string;
}

const AutocompleteField: React.FC<AutocompleteFieldProps> = ({
  label,
  options,
  onChange,
  placeholder,
  value
}) => (
  <>
    <Typography
      sx={{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        mb: 1
      }}
      fontWeight="medium"
      variant="body1"
    >
      {label}
    </Typography>
    <Autocomplete
      onChange={(event, value) => onChange(value?.value ?? '')}
      disablePortal
      options={options}
      value={
        options?.find(
          (option: { label: string; value: string }) => option.value === value
        ) || null
      }
      sx={{ maxWidth: 300, width: '100%', borderRadius: '12px', mb: 2 }}
      renderInput={(params) => (
        <TextField placeholder={placeholder} {...params} label="" />
      )}
    />
  </>
);

export default AutocompleteField;
