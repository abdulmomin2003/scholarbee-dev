import { Typography } from '@mui/material';
import { styles } from './styles';

/** Top-left campus image pill: session term + intake year (e.g. Spring 2026). */
export function ProgramIntakeSessionBadge({
  label
}: {
  label?: string | null;
}) {
  if (!label?.trim()) return null;
  //Todo: write a method to convert a string in to the pascel case
  const convertToPascalCase = (str: string): string => {
    return str
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };
  return (
    <Typography component="span" sx={styles.intakeSessionBadge}>
      {convertToPascalCase(label)}
    </Typography>
  );
}
