import { Box, Typography, IconButton } from '@mui/material';
import { Tag } from '../../types';
import CloseIcon from '@mui/icons-material/Close';

interface TagListProps {
  tags: { [position: number]: Tag | null };
  handleDelete: (id: string) => void;
}

const TagList: React.FC<TagListProps> = ({ tags, handleDelete }) => {
  const hasAnyTags = Object.values(tags).some(Boolean);

  if (!hasAnyTags) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
      {[0, 1].map((position) => {
        const tag = tags[position];
        if (!tag) return null;

        return (
          <Box
            key={tag._id}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              bgcolor: 'rgba(0, 74, 224, 0.1)',
              borderRadius: '8px',
              px: 3,
              height: '40px',
              width: '100%',
              maxWidth: { xs: '100%', md: '614px' }
            }}
          >
            <Typography
              sx={{
                fontWeight: 400,
                fontSize: '14px',
                color: '#004AE0',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {tag.university} - {tag.program}
            </Typography>
            <IconButton
              size="small"
              onClick={() => handleDelete(tag._id || '')}
              sx={{
                width: '18px',
                height: '18px',
                bgcolor: 'rgba(0, 74, 224, 0.1)',
                border: '1px solid rgba(0, 74, 224, 0.1)',
                color: '#004AE0',
                p: 0,
                ml: 2,
                '&:hover': {
                  bgcolor: 'rgba(0, 74, 224, 0.2)'
                }
              }}
            >
              <CloseIcon sx={{ fontSize: '12px' }} />
            </IconButton>
          </Box>
        );
      })}
    </Box>
  );
};

export default TagList;
