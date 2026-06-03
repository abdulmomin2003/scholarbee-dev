import React from 'react';
import { Box, Button, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';

const PaginationContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: theme.spacing(1),
  marginTop: theme.spacing(3),
  padding: theme.spacing(2)
}));

const PageButton = styled(Button)(() => ({
  minWidth: '40px',
  height: '40px',
  borderRadius: '8px',
  border: '1px solid #E0E0E0',
  backgroundColor: '#FFFFFF',
  color: '#333333',
  fontSize: '14px',
  fontWeight: 500,
  '&:hover': {
    backgroundColor: '#F5F5F5',
    borderColor: '#004ae0'
  },
  '&.active': {
    backgroundColor: '#004ae0',
    color: '#FFFFFF',
    borderColor: '#004ae0',
    '&:hover': {
      backgroundColor: '#004ae0'
    }
  },
  '&:disabled': {
    backgroundColor: '#F5F5F5',
    color: '#BDBDBD',
    borderColor: '#E0E0E0'
  }
}));

const NavigationButton = styled(IconButton)(() => ({
  width: '40px',
  height: '40px',
  borderRadius: '8px',
  border: '1px solid #E0E0E0',
  backgroundColor: '#FFFFFF',
  color: '#333333',
  '&:hover': {
    backgroundColor: '#F5F5F5',
    borderColor: '#004ae0'
  },
  '&:disabled': {
    backgroundColor: '#F5F5F5',
    color: '#BDBDBD',
    borderColor: '#E0E0E0'
  }
}));

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  const visiblePages = getVisiblePages();

  if (totalPages <= 1) {
    return null;
  }

  return (
    <PaginationContainer>
      <NavigationButton
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        aria-label="First page"
      >
        <FirstPageIcon />
      </NavigationButton>

      <NavigationButton
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
      >
        <ChevronLeftIcon />
      </NavigationButton>

      {visiblePages.map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <PageButton disabled>...</PageButton>
          ) : (
            <PageButton
              className={currentPage === page ? 'active' : ''}
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </PageButton>
          )}
        </React.Fragment>
      ))}

      <NavigationButton
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
      >
        <ChevronRightIcon />
      </NavigationButton>

      <NavigationButton
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        aria-label="Last page"
      >
        <LastPageIcon />
      </NavigationButton>
    </PaginationContainer>
  );
};

export default Pagination;
