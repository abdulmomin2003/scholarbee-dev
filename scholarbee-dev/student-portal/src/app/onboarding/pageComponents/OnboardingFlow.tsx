import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import {
  Box,
  Typography,
  Button,
  TextField,
  Chip,
  CircularProgress
} from '@mui/material';
import Image from 'next/image';
import { COLORS } from '@/constants/colors';
import { useUpdateMeMutation, useGetUserQuery } from '@/redux/api/userApi';
import { useGetProgramTemplatesQuery } from '@/redux/api/programApi';
import { useRouter, useSearchParams } from 'next/navigation';
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { authPhoneInputContainer, authTextField } from '@/styles/authStyles';
import { toast } from 'react-toastify';

// --- Constants & Types ---

const DEGREES = [
  'Bachelors / Associate Degree',
  'Masters / MPhil',
  'PhD',
  'Not sure yet'
] as const;
const CITIES = [
  'Islamabad',
  'Karachi',
  'Lahore',
  'Faisalabad',
  'Rawalpindi',
  'Multan',
  'Peshawar',
  'Quetta',
  'Other',
  'Does not matter'
] as const;
const FEE_RANGES = [
  'Up to PKR 85,000',
  'PKR 85,000 - 150,000',
  'PKR 150,000 - 300,000',
  'PKR 300,000+'
] as const;
const MARKS = [
  '< 60%',
  '60-70%',
  '70-80%',
  'Above 80%',
  'Prefer not to say'
] as const;
const START_TIMES = [
  'Immediately',
  'In 3 to 6 months',
  'In 6 to 12 months',
  'Next year',
  'Not sure yet'
] as const;

interface OnboardingData {
  targetDegree: string;
  preferredCities: string[];
  fieldsOfStudy: string[];
  customField: string;
  feeRange: string;
  previousMarks: string;
  startTime: string;
  phoneNumber: string;
}

// --- Shared Styles ---

const SHARED_STYLES = {
  sectionLabel: {
    fontWeight: 500,
    fontSize: { xs: '18px', sm: '20px' },
    mb: 2,
    color: COLORS.textPrimary
  },
  chipBase: (isSelected: boolean) => ({
    px: { xs: 1.5, sm: 2 },
    py: { xs: 2, sm: 2.5 },
    borderRadius: '40px',
    fontSize: { xs: '14px', sm: '16px' },
    fontWeight: 500,
    backgroundColor: isSelected ? '#F0F5FD' : '#FFF',
    border: `1px solid ${isSelected ? COLORS.primary : '#B0B3B7'}`,
    color: isSelected ? COLORS.primary : '#989CA1',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: isSelected ? '#E6EFFF' : '#F5F5F5'
    }
  }),
  bannerText: (step: number) => ({
    fontWeight: 600,
    fontSize: { xs: '24px', lg: '32px' },
    color: '#FFF',
    lineHeight: 1.5,
    textAlign: step === 4 ? 'center' : 'left'
  })
} as const;

// --- Sub-Components ---

const StepWelcome = memo(function StepWelcome({
  data,
  onChange,
  onToggle
}: {
  data: OnboardingData;
  onChange: (update: Partial<OnboardingData>) => void;
  onToggle: (val: string) => void;
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography
          variant="h4"
          sx={{ fontWeight: 700, mb: 1, color: COLORS.textPrimary }}
        >
          Welcome to ScholarBee
        </Typography>
        <Typography sx={{ color: COLORS.textSecondary, fontSize: '16px' }}>
          Tell us your goals, and we&apos;ll guide you to the right programs.
        </Typography>
      </Box>

      <Box>
        <Typography sx={SHARED_STYLES.sectionLabel}>
          Which degree do you want to apply for?
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {DEGREES.map((deg) => (
            <Chip
              key={deg}
              label={deg}
              onClick={() => onChange({ targetDegree: deg })}
              sx={SHARED_STYLES.chipBase(data.targetDegree === deg)}
            />
          ))}
        </Box>
      </Box>

      <Box>
        <Typography sx={{ ...SHARED_STYLES.sectionLabel, mb: 1 }}>
          Which city do you prefer?
        </Typography>
        <Typography
          sx={{ color: COLORS.textSecondary, fontSize: '14px', mb: 2 }}
        >
          Select Multiple options
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          {CITIES.map((city) => (
            <Chip
              key={city}
              label={city}
              onClick={() => onToggle(city)}
              sx={SHARED_STYLES.chipBase(data.preferredCities.includes(city))}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
});

const StepInterests = memo(function StepInterests({
  data,
  fieldsOfStudyOptions,
  onToggle,
  onChange
}: {
  data: OnboardingData;
  fieldsOfStudyOptions: string[];
  onToggle: (val: string) => void;
  onChange: (update: Partial<OnboardingData>) => void;
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography
          sx={{
            fontWeight: 500,
            fontSize: { xs: '24px', sm: '32px' },
            mb: 1,
            color: COLORS.textPrimary,
            lineHeight: 1.2
          }}
        >
          Which field are you interested in?
        </Typography>
        <Typography sx={{ color: COLORS.textSecondary, fontSize: '14px' }}>
          Select Multiple options
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        {fieldsOfStudyOptions.map((field) => (
          <Chip
            key={field}
            label={field}
            onClick={() => onToggle(field)}
            sx={SHARED_STYLES.chipBase(data.fieldsOfStudy.includes(field))}
          />
        ))}
        {!fieldsOfStudyOptions.includes('Others') && (
          <Chip
            label="Others"
            onClick={() => onToggle('Others')}
            sx={SHARED_STYLES.chipBase(data.fieldsOfStudy.includes('Others'))}
          />
        )}
      </Box>

      {data.fieldsOfStudy.includes('Others') && (
        <TextField
          fullWidth
          placeholder="Type a custom field"
          variant="outlined"
          value={data.customField}
          onChange={(e) => onChange({ customField: e.target.value })}
          sx={authTextField}
        />
      )}

      <Box>
        <Typography sx={SHARED_STYLES.sectionLabel}>
          What fee range can you afford per semester?
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {FEE_RANGES.map((fee) => (
            <Chip
              key={fee}
              label={fee}
              onClick={() => onChange({ feeRange: fee })}
              sx={SHARED_STYLES.chipBase(data.feeRange === fee)}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
});

const StepMarksAndTime = memo(function StepMarksAndTime({
  data,
  onChange
}: {
  data: OnboardingData;
  onChange: (update: Partial<OnboardingData>) => void;
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box>
        <Typography sx={SHARED_STYLES.sectionLabel}>
          Your previous marks?
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {MARKS.map((mark) => (
            <Chip
              key={mark}
              label={mark}
              onClick={() => onChange({ previousMarks: mark })}
              sx={SHARED_STYLES.chipBase(data.previousMarks === mark)}
            />
          ))}
        </Box>
      </Box>

      <Box>
        <Typography sx={SHARED_STYLES.sectionLabel}>
          When do you want to start?
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {START_TIMES.map((time) => (
            <Chip
              key={time}
              label={time}
              onClick={() => onChange({ startTime: time })}
              sx={SHARED_STYLES.chipBase(data.startTime === time)}
            />
          ))}
        </Box>
      </Box>
    </Box>
  );
});

const StepPhone = memo(function StepPhone({
  data,
  onChange
}: {
  data: OnboardingData;
  onChange: (val: string) => void;
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <Box
        sx={{
          backgroundColor: '#E0EAFF',
          borderRadius: '8px',
          p: '12px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          width: { xs: '100%', sm: 'fit-content' },
          boxSizing: 'border-box'
        }}
      >
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '16px',
            lineHeight: '20px',
            color: '#004AE0'
          }}
        >
          {"Almost there! Let's finish your profile."}
        </Typography>
      </Box>

      <Box>
        <Typography
          sx={{
            fontWeight: 600,
            fontSize: '28px',
            lineHeight: '36px',
            color: '#000',
            letterSpacing: '-0.01em',
            mb: 1
          }}
        >
          Your Best University Matches Are Ready!
        </Typography>
        <Typography
          sx={{ color: '#575C62', fontSize: '16px', lineHeight: '24px', mb: 2 }}
        >
          Enter your number to unlock:
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
          <Typography sx={{ color: '#000', fontSize: '14px' }}>
            ✓ Expert Admission Guidance - Get personalized help with your
            application.
          </Typography>
          <Typography sx={{ color: '#000', fontSize: '14px' }}>
            ✓ Start Application - We act as your advocate inside the admissions.
          </Typography>
          <Typography sx={{ color: '#000', fontSize: '14px' }}>
            ✓ WhatsApp Updates - Get direct university alerts instantly.
          </Typography>
        </Box>
      </Box>

      <Box sx={{ maxWidth: '404px' }}>
        <Typography
          sx={{
            fontWeight: 500,
            fontSize: '18px',
            lineHeight: '24px',
            mb: 1,
            color: '#000'
          }}
        >
          Phone Number
        </Typography>
        <Box sx={authPhoneInputContainer}>
          <PhoneInput
            international
            defaultCountry="PK"
            placeholder="+92 312 0786968"
            value={data.phoneNumber}
            onChange={(val) => onChange(val || '')}
            className="phone-input-field"
          />
        </Box>
      </Box>
    </Box>
  );
});

// --- Main Component ---

// --- Mapping Utilities ---

const mapDegreeToBackend = (degree: string) => {
  const map: Record<string, string> = {
    'Bachelors / Associate Degree': 'Bachelors',
    'Masters / MPhil': 'Masters',
    PhD: 'Doctorate'
  };
  return map[degree] || null;
};

const mapBackendToDegree = (degree: string) => {
  const map: Record<string, string> = {
    Bachelors: 'Bachelors / Associate Degree',
    Masters: 'Masters / MPhil',
    Doctorate: 'PhD'
  };
  return map[degree] || degree;
};

const mapMarksToRange = (marks: string) => {
  const map: Record<string, { min_percent: number; max_percent: number }> = {
    '< 60%': { min_percent: 0, max_percent: 60 },
    '60-70%': { min_percent: 60, max_percent: 70 },
    '70-80%': { min_percent: 70, max_percent: 80 },
    'Above 80%': { min_percent: 80, max_percent: 100 }
  };
  return map[marks] || null;
};

const mapRangeToMarks = (range: {
  min_percent: number;
  max_percent: number;
}) => {
  if (range.min_percent === 0 && range.max_percent === 60) return '< 60%';
  if (range.min_percent === 60 && range.max_percent === 70) return '60-70%';
  if (range.min_percent === 70 && range.max_percent === 80) return '70-80%';
  if (range.min_percent === 80 && range.max_percent === 100) return 'Above 80%';
  return '';
};

const mapFeeToRange = (fee: string) => {
  const map: Record<string, { min: number | null; max: number | null }> = {
    'Up to PKR 85,000': { min: 0, max: 85000 },
    'PKR 85,000 - 150,000': { min: 85000, max: 150000 },
    'PKR 150,000 - 300,000': { min: 150000, max: 300000 },
    'PKR 300,000+': { min: 300000, max: null }
  };
  return map[fee] || null;
};

const mapRangeToFee = (range: { min: number | null; max: number | null }) => {
  if (range.min === 0 && range.max === 85000) return 'Up to PKR 85,000';
  if (range.min === 85000 && range.max === 150000)
    return 'PKR 85,000 - 150,000';
  if (range.min === 150000 && range.max === 300000)
    return 'PKR 150,000 - 300,000';
  if (range.min === 300000) return 'PKR 300,000+';
  return '';
};

const mapTimelineToBackend = (time: string) => {
  if (time === 'Immediately') return 'immediate';
  if (time === 'In 3 to 6 months') return 'within_6_months';
  if (time === 'In 6 to 12 months' || time === 'Next year') return 'next_year';
  return null;
};

const mapBackendToTimeline = (type: string) => {
  if (type === 'immediate') return 'Immediately';
  if (type === 'within_6_months') return 'In 3 to 6 months';
  if (type === 'next_year') return 'In 6 to 12 months';
  return '';
};

// --- Main Component ---

const OnboardingFlow = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParams = searchParams.get('redirect');

  const { data: userData } = useGetUserQuery();
  const [updateMe] = useUpdateMeMutation();
  const { data: programTemplates, isLoading: isTemplatesLoading } =
    useGetProgramTemplatesQuery(2000);

  const fieldsOfStudyOptions = useMemo(() => {
    if (!programTemplates?.data) return [];
    const fields = programTemplates.data
      .map((t: any) => t.field_of_study)
      .filter((f: any) => !!f && typeof f === 'string')
      .map((f: string) => f.trim())
      .filter((f: string) => !/^other(s)?$/i.test(f)); // Exclude any variation of "other" or "others"

    const titleCase = (str: string) =>
      str.replace(/\b\w/g, (char) => char.toUpperCase());

    const normalizedFields = fields.map((f: string) => titleCase(f));

    return Array.from(new Set<string>(normalizedFields)).sort((a, b) =>
      a.localeCompare(b)
    );
  }, [programTemplates]);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);
  const [formData, setFormData] = useState<OnboardingData>({
    targetDegree: '',
    preferredCities: [],
    fieldsOfStudy: [],
    customField: '',
    feeRange: '',
    previousMarks: '',
    startTime: '',
    phoneNumber: ''
  });

  // Strict route protection: only allow access if coming from signup or a refresh within onboarding
  useEffect(() => {
    const fromSignup = sessionStorage.getItem('from_signup');
    const fromOnboarding = sessionStorage.getItem('was_onboarding');

    if (fromSignup === 'true' || fromOnboarding === 'true') {
      setIsAllowed(true);
      // Ensure we can refresh and stay here
      sessionStorage.setItem('was_onboarding', 'true');
    } else {
      setIsAllowed(false);
      router.replace('/');
    }
  }, [router]);

  useEffect(() => {
    if (userData) {
      setFormData((prev) => {
        const prefs = userData.onboarding_preferences;
        if (!prefs)
          return { ...prev, phoneNumber: userData.phone_number || '' };

        return {
          ...prev,
          targetDegree: mapBackendToDegree(prefs.degree_goal),
          preferredCities: prefs.preferred_cities || [],
          fieldsOfStudy: prefs.preferred_fields_of_study || [],
          feeRange: prefs.semester_fee_range
            ? mapRangeToFee(prefs.semester_fee_range)
            : '',
          previousMarks: prefs.previous_marks_range
            ? mapRangeToMarks(prefs.previous_marks_range)
            : '',
          startTime: prefs.start_timeline
            ? mapBackendToTimeline(prefs.start_timeline.type)
            : '',
          phoneNumber: userData.phone_number || prev.phoneNumber
        };
      });
    }
  }, [userData]);

  const handleUpdate = useCallback((update: Partial<OnboardingData>) => {
    setFormData((prev) => ({ ...prev, ...update }));
  }, []);

  const handleToggle = useCallback(
    (key: keyof OnboardingData, value: string) => {
      setFormData((prev) => {
        const current = prev[key] as string[];
        const exists = current.includes(value);
        return {
          ...prev,
          [key]: exists
            ? current.filter((v) => v !== value)
            : [...current, value]
        };
      });
    },
    []
  );

  const handleRedirect = useCallback(() => {
    router.replace(redirectParams ? decodeURIComponent(redirectParams) : '/');
  }, [redirectParams, router]);

  const saveToProfile = useCallback(async () => {
    try {
      if (!formData.phoneNumber) {
        toast.error('Please enter your phone number to unlock matches.');
        return;
      }
      if (!isValidPhoneNumber(formData.phoneNumber)) {
        toast.error('Please enter a valid phone number.');
        return;
      }

      setLoading(true);
      const preferences: any = {};

      if (formData.targetDegree)
        preferences.degree_goal = mapDegreeToBackend(formData.targetDegree);
      if (formData.preferredCities.length > 0) {
        preferences.preferred_cities = formData.preferredCities.includes(
          'Does not matter'
        )
          ? null
          : formData.preferredCities;
      }

      if (formData.fieldsOfStudy.length > 0) {
        const combined = formData.fieldsOfStudy.filter((f) => f !== 'Others');
        if (formData.fieldsOfStudy.includes('Others') && formData.customField)
          combined.push(formData.customField);
        preferences.preferred_fields_of_study = combined;
      }

      if (formData.feeRange)
        preferences.semester_fee_range = mapFeeToRange(formData.feeRange);
      if (formData.previousMarks)
        preferences.previous_marks_range = mapMarksToRange(
          formData.previousMarks
        );

      const timelineType = mapTimelineToBackend(formData.startTime);
      preferences.start_timeline = timelineType
        ? { type: timelineType, selected_at: new Date().toISOString() }
        : null;

      const payload: any = { onboarding_preferences: preferences };
      if (
        formData.phoneNumber &&
        formData.phoneNumber !== userData?.phone_number
      ) {
        payload.phone_number = formData.phoneNumber;
      }

      const res = await updateMe(payload).unwrap();

      // Cleanup onboarding flags
      sessionStorage.removeItem('from_signup');
      sessionStorage.removeItem('was_onboarding');

      toast.success(res?.message || 'Profile updated successfully!');
      handleRedirect();
    } catch (err: any) {
      const errorMsg =
        err?.data?.message?.[0] ||
        err?.data?.message ||
        err?.message ||
        'Failed to update profile.';
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [userData, formData, updateMe, handleRedirect]);

  const handleNext = useCallback(async () => {
    if (step === 4) await saveToProfile();
    else setStep((prev) => prev + 1);
  }, [step, saveToProfile]);

  const handleBack = useCallback(() => {
    if (step > 1) setStep((prev) => prev - 1);
  }, [step]);

  const handleSkip = useCallback(() => {
    sessionStorage.removeItem('from_signup');
    sessionStorage.removeItem('was_onboarding');
    handleRedirect();
  }, [handleRedirect]);

  const bannerContent = useMemo(() => {
    const banners = [
      `Did you know? Over $100M in scholarships goes unclaimed every year because students don't find them.`,
      `You’re in a good place! Join 10,000+ students currently hunting for their future on ScholarBee.`,
      'Applications through ScholarBee see a 90% higher response rate from admissions officers.',
      "We don't just find Universities; we find the perfect fit for your budget and your brain."
    ];
    return (
      <Typography sx={SHARED_STYLES.bannerText(step)}>
        {banners[step - 1]}
      </Typography>
    );
  }, [step]);

  if (isAllowed === null)
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  if (!isAllowed) return null;

  return (
    <Box
      sx={{
        backgroundColor: '#F7F7F7',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: { xs: 2, sm: 4, md: 6 },
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          backgroundColor: '#FFF',
          width: '100%',
          maxWidth: '1440px',
          height: { xs: '100%', md: 'calc(100vh - 96px)' },
          maxHeight: '100vh',
          borderRadius: { xs: '16px', md: '24px' },
          boxShadow: '0px 12px 32px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' }
        }}
      >
        {/* Left Panel */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            p: { xs: 4, sm: 6, md: 8, xl: 12 },
            height: '100%',
            overflowY: 'auto',
            justifyContent: isTemplatesLoading ? 'center' : 'space-between'
          }}
        >
          <Box
            sx={{
              flexShrink: 0,
              mb: isTemplatesLoading ? 0 : { xs: 4, md: 6 }
            }}
          >
            {!isTemplatesLoading && (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3
                }}
              >
                <Image
                  src="/assets/svg/logo.svg"
                  alt="Logo"
                  width={160}
                  height={36}
                  style={{ objectFit: 'contain' }}
                />
                <Button
                  variant="text"
                  onClick={handleSkip}
                  disabled={loading}
                  sx={{
                    color: '#676D75',
                    fontWeight: 500,
                    fontSize: '18px',
                    textTransform: 'none',
                    minWidth: 'auto',
                    p: 0,
                    '&:hover': {
                      backgroundColor: 'transparent',
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Skip
                </Button>
              </Box>
            )}

            {!isTemplatesLoading && (
              <Box sx={{ position: 'relative', width: '100%' }}>
                <Typography
                  sx={{
                    position: 'absolute',
                    right: 0,
                    top: '-24px',
                    fontSize: '16px',
                    fontWeight: 500,
                    color: '#464A50'
                  }}
                >
                  {step === 1
                    ? '0%'
                    : step === 2
                      ? '33%'
                      : step === 3
                        ? '66%'
                        : '100%'}
                </Typography>
                <Box
                  sx={{
                    width: '100%',
                    height: '14px',
                    backgroundColor: '#F2F2F3',
                    borderRadius: '50px',
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      width:
                        step === 1
                          ? '0%'
                          : step === 2
                            ? '33%'
                            : step === 3
                              ? '66%'
                              : '100%',
                      height: '100%',
                      backgroundColor: '#008AFF',
                      transition: 'width 0.3s ease'
                    }}
                  />
                </Box>
              </Box>
            )}
          </Box>

          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: isTemplatesLoading ? 'center' : 'center',
              alignItems: isTemplatesLoading ? 'center' : 'stretch'
            }}
          >
            <Box sx={{ maxWidth: '640px', width: '100%' }}>
              {isTemplatesLoading ? (
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '@keyframes float': {
                      '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
                      '50%': { transform: 'translateY(-20px) rotate(5deg)' }
                    },
                    '@keyframes shine': {
                      '0%': { backgroundPosition: '-200% center' },
                      '100%': { backgroundPosition: '200% center' }
                    }
                  }}
                >
                  <Box
                    sx={{
                      width: 120,
                      height: 120,
                      backgroundColor: '#F0F5FD',
                      borderRadius: '30px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mb: 5,
                      animation: 'float 4s ease-in-out infinite',
                      boxShadow: '0 24px 48px rgba(0, 138, 255, 0.15)',
                      transformStyle: 'preserve-3d',
                      perspective: '1000px'
                    }}
                  >
                    <Image
                      src="/assets/svg/logo.svg"
                      alt="ScholarBee"
                      width={80}
                      height={80}
                      style={{ objectFit: 'contain' }}
                    />
                  </Box>
                  <Typography
                    sx={{
                      background:
                        'linear-gradient(90deg, #004AE0, #008AFF, #004AE0)',
                      backgroundSize: '200% auto',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      animation: 'shine 3s linear infinite',
                      fontWeight: 800,
                      fontSize: { xs: '28px', sm: '36px' },
                      mb: 1.5,
                      textAlign: 'center',
                      letterSpacing: '-0.02em'
                    }}
                  >
                    Finding Your Future...
                  </Typography>
                  <Typography
                    sx={{
                      color: '#676D75',
                      fontWeight: 500,
                      fontSize: '18px',
                      textAlign: 'center',
                      maxWidth: '450px',
                      lineHeight: 1.6,
                      mb: 4
                    }}
                  >
                    Please wait while we set up your profile...
                  </Typography>
                  <Box sx={{ width: '100%', maxWidth: '300px' }}>
                    <Box
                      sx={{
                        height: '6px',
                        width: '100%',
                        backgroundColor: '#F2F2F3',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          height: '100%',
                          width: '30%',
                          backgroundColor: '#008AFF',
                          borderRadius: '10px',
                          animation: 'loading-bar 2s ease-in-out infinite',
                          '@keyframes loading-bar': {
                            '0%': { left: '-30%' },
                            '100%': { left: '100%' }
                          }
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              ) : (
                <>
                  {step === 1 && (
                    <StepWelcome
                      data={formData}
                      onChange={handleUpdate}
                      onToggle={(val) => handleToggle('preferredCities', val)}
                    />
                  )}
                  {step === 2 && (
                    <StepInterests
                      data={formData}
                      fieldsOfStudyOptions={fieldsOfStudyOptions}
                      onToggle={(val) => handleToggle('fieldsOfStudy', val)}
                      onChange={handleUpdate}
                    />
                  )}
                  {step === 3 && (
                    <StepMarksAndTime data={formData} onChange={handleUpdate} />
                  )}
                  {step === 4 && (
                    <StepPhone
                      data={formData}
                      onChange={(val) => handleUpdate({ phoneNumber: val })}
                    />
                  )}
                </>
              )}
            </Box>
          </Box>

          {/* Action Buttons */}
          {!isTemplatesLoading && (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 3 },
                pt: { xs: 4, md: 6 },
                mt: 'auto',
                flexShrink: 0
              }}
            >
              {step > 1 ? (
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  disabled={loading}
                  sx={{
                    minWidth: { xs: '100%', sm: '204px' },
                    py: { xs: 1.5, sm: 1.8 },
                    borderRadius: '8px',
                    borderColor: '#004AE0',
                    color: '#004AE0',
                    fontWeight: 500,
                    fontSize: { xs: '16px', sm: '18px' },
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#F5F5F5',
                      borderColor: '#003BB5',
                      color: '#003BB5'
                    }
                  }}
                >
                  Back
                </Button>
              ) : (
                <Box sx={{ width: { xs: '100%', sm: '180px' } }} /> // Placeholder for alignment
              )}

              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading || isTemplatesLoading}
                sx={{
                  backgroundColor: '#004AE0',
                  minWidth: { xs: '100%', sm: '204px' },
                  py: { xs: 1.5, sm: 1.8 },
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontWeight: 500,
                  fontSize: { xs: '16px', sm: '18px' },
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    backgroundColor: '#003BB5',
                    boxShadow: 'none'
                  }
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : step === 4 ? (
                  'Finish'
                ) : (
                  'Next'
                )}
              </Button>
            </Box>
          )}
        </Box>

        {/* Right Panel */}
        <Box
          sx={{
            display: isTemplatesLoading ? 'none' : { xs: 'none', md: 'flex' },
            width: { md: '584px' },
            flexDirection: 'column',
            backgroundColor: '#008AFF',
            position: 'relative',
            overflow: 'hidden',
            p: { md: 6, lg: 8 },
            justifyContent: 'center',
            alignItems: step === 4 ? 'center' : 'flex-start',
            flexShrink: 0
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 0,
              width: '100%',
              height: '100%',
              zIndex: 1,
              opacity: 0.15,
              backgroundImage: 'url(/assets/svg/onboarding-pattern.svg)',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right bottom',
              backgroundSize: '80%',
              pointerEvents: 'none'
            }}
          />
          <Box
            sx={{ position: 'relative', zIndex: 2, maxWidth: '430px', mb: 8 }}
          >
            {bannerContent}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default memo(OnboardingFlow);
