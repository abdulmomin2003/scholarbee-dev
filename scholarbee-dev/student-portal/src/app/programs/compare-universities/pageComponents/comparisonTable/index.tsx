'use client';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import { UniversityData } from '../../types';
import { isDomainAllowed } from '@/utils/helperFunctions';
import EmptyState from '../emptyState';
import { COLORS } from '@/constants/colors';
import { FONTS } from '@/constants/fonts';

interface ComparisonTableProps {
  comparisonData: UniversityData[] | null;
  isComparing: boolean;
  showDifferences: boolean;
  setShowDifferences: (value: boolean | ((prev: boolean) => boolean)) => void;
}

// Criteria labels
const CRITERIA = [
  { label: 'First Semester Fee', key: 'totalFirstSemesterFee' },
  { label: 'Location', key: 'campusAddress' },
  { label: 'Program Name', key: 'programName' },
  { label: 'Major', key: 'major' },
  { label: 'Duration', key: 'duration' },
  { label: 'Credit Hours', key: 'creditHours' },
  { label: 'Degree Level', key: 'degreeLevel' },
  { label: 'Mode of Study', key: 'modeOfStudy' },
  { label: 'Language', key: 'languageOfInstruction' },
  { label: 'Campus', key: 'campusName' },
  { label: 'University Ranking', key: 'universityRanking' }
];

const ComparisonTable: React.FC<ComparisonTableProps> = ({
  comparisonData,
  isComparing,
  showDifferences,
  setShowDifferences
}) => {
  if (isComparing) {
    return <EmptyState message="Loading comparison data..." />;
  }

  if (!comparisonData?.length) {
    return (
      <EmptyState message="Select universities to compare using the filters above" />
    );
  }

  const getValue = (item: UniversityData, key: string) => {
    if (key === 'campusAddress') {
      const address = item.campusAddress;
      return address?.city && address?.country
        ? `${address.city}, ${address.country}`
        : '-';
    }
    if (
      key === 'totalFirstSemesterFee' ||
      key === 'totalRegularSemesterFee' ||
      key === 'totalTuitionFee' ||
      key === 'totalApplicationFee' ||
      key === 'totalFee'
    ) {
      const value = item[key as keyof UniversityData] as number;
      return value && value > 0 ? value.toLocaleString() : '-';
    }
    const value = item[key as keyof UniversityData];
    return value?.toString() || '-';
  };

  const universities = comparisonData.slice(0, 2);

  // Filter criteria if showDifferences is true
  const displayedCriteria = showDifferences
    ? CRITERIA.filter((criteria) => {
        if (universities.length < 2) return true;
        const val1 = getValue(universities[0], criteria.key)
          .trim()
          .toLowerCase();
        const val2 = getValue(universities[1], criteria.key)
          .trim()
          .toLowerCase();
        return val1 !== val2;
      })
    : CRITERIA;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        background: '#FFFFFF',
        borderRadius: '16px',
        mx: 'auto',
        overflow: 'hidden',
        mt: 4
      }}
    >
      {/* Mobile Layout (Legacy) */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {displayedCriteria.map((criteria) => (
          <Box key={`mobile-${criteria.key}`}>
            <Box
              sx={{
                background: '#F4F7FF',
                py: 2,
                px: 2,
                borderTop: '1px solid rgba(0, 0, 0, 0.1)',
                borderBottom: '1px solid rgba(0, 0, 0, 0.1)'
              }}
            >
              <Typography
                sx={{
                  fontWeight: 600,
                  fontSize: 18,
                  textAlign: 'center',
                  color: '#000000'
                }}
              >
                {criteria.label}
              </Typography>
            </Box>

            {universities.map((university, index) => {
              const value = getValue(university, criteria.key);
              return (
                <Box
                  key={`mobile-${university._id}-${criteria.key}`}
                  sx={{
                    background: '#FFFFFF',
                    py: 2,
                    px: 2,
                    borderBottom:
                      index < universities.length - 1
                        ? '1px solid rgba(0, 0, 0, 0.1)'
                        : 'none',
                    textAlign: 'center'
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: 400,
                      fontSize: 16,
                      color: '#252525'
                    }}
                  >
                    {value}
                  </Typography>
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>

      {/* New Desktop Layout */}
      <Box
        sx={{
          display: { xs: 'none', md: 'flex' },
          flexDirection: 'column',
          width: '100%',
          minWidth: '1000px',
          boxSizing: 'border-box',
          background: COLORS.white,
          borderRadius: '16px',
          overflow: 'hidden'
        }}
      >
        {/* Header Title Spanning Full Width */}
        <Box
          sx={{
            pt: '48px',
            pb: '32px',
            px: '20px',
            width: '100%',
            display: 'flex',
            justifyContent: 'start',
            alignItems: 'center'
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              fontSize: { md: '24px', lg: '32px' },
              lineHeight: '40px',
              color: COLORS.primary,
              fontFamily: FONTS.secondary,
              textAlign: 'left'
            }}
          >
            Universities Comparison
          </Typography>
        </Box>

        {/* Content Row: Sidebar + University Columns */}
        <Box sx={{ display: 'flex', flexDirection: 'row', width: '100%' }}>
          {/* Sidebar Column */}
          <Box
            sx={{
              flex: '0 0 27.7%',
              background: '#F9F9F9',
              borderRight: '1px solid #C8CACD',
              padding: '40px 0px 40px 0px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Toggle area aligned with University Header Row */}
            <Box
              sx={{
                height: '212px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                mb: '60px',
                width: '100%'
              }}
            >
              <Box
                onClick={() => setShowDifferences((prev) => !prev)}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none'
                }}
              >
                <Box
                  sx={{
                    width: '24px',
                    height: '24px',
                    border: '1.5px solid rgba(0, 0, 0, 0.25)',
                    borderRadius: '4px',
                    mb: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: showDifferences
                      ? COLORS.primary
                      : 'transparent',
                    borderColor: showDifferences
                      ? COLORS.primary
                      : 'rgba(0, 0, 0, 0.25)',
                    transition: 'all 0.2s ease-in-out'
                  }}
                >
                  {showDifferences && (
                    <Box
                      component="span"
                      sx={{
                        width: '10px',
                        height: '5px',
                        borderLeft: '2px solid white',
                        borderBottom: '2px solid white',
                        transform: 'rotate(-45deg) translateY(-1px)'
                      }}
                    />
                  )}
                </Box>
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: { md: '16px', lg: '20px' },
                    lineHeight: '24px',
                    color: COLORS.black,
                    fontFamily: FONTS.secondary,
                    textAlign: 'center'
                  }}
                >
                  Only Show Differences
                </Typography>
              </Box>
            </Box>

            {/* Criteria List with Dividers */}
            <Box sx={{ mt: 'auto' }}>
              <Box
                sx={{
                  height: '1.5px',
                  width: '85%',
                  mx: 'auto',
                  borderTop: '1.5px dashed #989CA1'
                }}
              />
              {displayedCriteria.map((criteria, index) => (
                <Box key={`crit-side-${criteria.key}`}>
                  <Box
                    sx={{
                      width: '100%',
                      height: '76px',
                      display: 'flex',
                      alignItems: 'center',
                      px: '20px',
                      boxSizing: 'border-box'
                    }}
                  >
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: { md: '16px', lg: '20px' },
                        lineHeight: '28px',
                        color: COLORS.textPrimary,
                        fontFamily: FONTS.secondary,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {criteria.label} :
                    </Typography>
                  </Box>
                  {index < displayedCriteria.length - 1 && (
                    <Box
                      sx={{
                        height: '1.5px',
                        width: '85%',
                        mx: 'auto',
                        borderTop: '1.5px dashed #989CA1'
                      }}
                    />
                  )}
                </Box>
              ))}
            </Box>
          </Box>

          {/* University Columns Container */}
          <Box sx={{ display: 'flex', flex: 1 }}>
            {universities.map((university, index) => (
              <Box
                key={`desktop-col-${university._id || index}`}
                sx={{
                  flex: index === 0 ? '1 1 36.03%' : '1 1 36.27%',
                  background: COLORS.white,
                  borderRight: index === 0 ? '1px solid #C8CACD' : 'none',
                  padding: '40px 0px 40px 0px',
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: '350px'
                }}
              >
                {/* Header */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    mb: '60px',
                    height: '212px'
                  }}
                >
                  <Box
                    sx={{
                      width: '168px',
                      height: '168px',
                      background: index === 0 ? '#FCF2F4' : '#F3F4FB',
                      borderRadius: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: '20px',
                      flexShrink: 0
                    }}
                  >
                    <Image
                      src={
                        university.campusLogo &&
                        isDomainAllowed(university.campusLogo)
                          ? university.campusLogo
                          : '/assets/png/university_placeholder.png'
                      }
                      alt={`${university.universityName} Logo`}
                      width={120}
                      height={120}
                      style={{ objectFit: 'contain' }}
                    />
                  </Box>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      fontSize: '20px',
                      lineHeight: '24px',
                      color: COLORS.black,
                      fontFamily: FONTS.secondary,
                      textAlign: 'center',
                      width: '100%',
                      px: '20px',
                      boxSizing: 'border-box'
                    }}
                  >
                    {university.universityName}
                  </Typography>
                </Box>

                {/* Data Values List with Dividers */}
                <Box sx={{ mt: 'auto' }}>
                  <Box
                    sx={{
                      height: '1.5px',
                      width: '85%',
                      mx: 'auto',
                      borderTop: '1.5px dashed #989CA1'
                    }}
                  />
                  {displayedCriteria.map((criteria, vIndex) => (
                    <Box key={`val-box-${university._id}-${criteria.key}`}>
                      <Box
                        sx={{
                          width: '100%',
                          height: '76px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          px: '20px'
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 400,
                            fontSize: '16px',
                            lineHeight: '28px',
                            color: COLORS.textPrimary,
                            fontFamily: FONTS.secondary,
                            textAlign: 'center',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical'
                          }}
                        >
                          {getValue(university, criteria.key)}
                        </Typography>
                      </Box>
                      {vIndex < displayedCriteria.length - 1 && (
                        <Box
                          sx={{
                            height: '1.5px',
                            width: '85%',
                            mx: 'auto',
                            borderTop: '1.5px dashed #989CA1'
                          }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ComparisonTable;
