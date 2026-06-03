/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Box,
  Stack,
  Typography,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';
import Link from 'next/link';
import { styles } from '../../styles';
import { formattedDate, getStatusColor } from '@/utils/helperFunctions';
import {
  setAdmissionId,
  setAdmissionProgramId,
  setUniversityId,
  setCampusId,
  setProgramId,
  setDepartmentId,
  setApplicationId
} from '@/redux/slices/admissionSlice';
import { useDispatch } from 'react-redux';
import { useGetUserQuery } from '@/redux/api/userApi';

export const ApplicationItem = ({
  application,
  name,
  submission_date,
  status,
  // programId,
  // admission_program_id,
  scholarshipId
}: {
  application?: any;
  name: string;
  submission_date: string;
  status: string;
  programId?: string;
  admission_program_id?: string;
  scholarshipId?: string;
}) => {
  const dispatch = useDispatch();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const { data: userData, isLoading: isLoadingUser } = useGetUserQuery();

  const viewHref = scholarshipId
    ? `/scholarship-details/${scholarshipId}`
    : `/application-details/${application?._id}`;
  const editHref =
    userData?.current_stage != null
      ? `/create-profile?step=${userData.current_stage}`
      : '/create-profile';

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleEditClick = () => {
    dispatch(setCampusId(application?.campus_id?._id));
    dispatch(setProgramId(application?.program_id?._id));
    dispatch(setAdmissionId(application?.admission_id?._id));
    dispatch(setAdmissionProgramId(application?.admission_program_id?._id));
    dispatch(setUniversityId(application.campus_id?.university_id));
    dispatch(setDepartmentId(application?.departments[0]?.department?._id));
    dispatch(setApplicationId(application?._id));
    handleClose();
  };

  // const handleDelete = () => {
  //   console.log('Delete application:', name);
  //   handleClose();
  // };

  return (
    <Box sx={styles.sectionContent}>
      <Stack
        direction="row"
        justifyContent="space-between"
        spacing={2}
        alignItems="center"
        sx={{ width: '100%' }}
      >
        <Stack
          sx={{
            flexGrow: 1,
            minWidth: 0,
            maxWidth: 'calc(100% - 120px)', // Reserve space for status badge
            overflow: 'hidden'
          }}
        >
          <Typography
            fontSize={16}
            fontWeight={600}
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              width: '100%'
            }}
          >
            {name}
          </Typography>
          <Typography variant="body2" fontSize={14} fontStyle="italic">
            {formattedDate(submission_date)}
          </Typography>
        </Stack>
        <Box
          sx={{
            ...styles.statusPending,
            color: getStatusColor(status),
            bgcolor: `${getStatusColor(status)}1A`,
            flexShrink: 0
          }}
        >
          {status?.charAt(0).toUpperCase() + status?.slice(1)}
        </Box>
        {!scholarshipId && (
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ flexShrink: 0, ml: 1 }}
          >
            <MoreVertIcon />
          </IconButton>
        )}
      </Stack>
      {!scholarshipId && (
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right'
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          disableScrollLock={true}
          slotProps={{
            paper: {
              style: {
                maxHeight: 200,
                minWidth: 80
              }
            }
          }}
        >
          <MenuItem
            component={Link}
            href={viewHref}
            onClick={handleClose}
            sx={{ width: 80 }}
            disabled={status === 'Draft'}
          >
            View
          </MenuItem>
          {status === 'Draft' && (
            <MenuItem
              component={Link}
              href={editHref}
              onClick={handleEditClick}
              sx={{ width: 80 }}
              disabled={isLoadingUser}
            >
              Edit
            </MenuItem>
          )}
          {/* <MenuItem onClick={handleDelete}>Delete</MenuItem> */}
        </Menu>
      )}

      {/* )} */}
    </Box>
  );
};
