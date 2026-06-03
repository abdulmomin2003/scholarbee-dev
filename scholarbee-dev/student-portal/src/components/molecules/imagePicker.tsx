import { UtilsApi } from '@/endpoints/utils';
import CameraIcon from '@mui/icons-material/PhotoCamera';
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  SxProps,
  Theme,
  Typography
} from '@mui/material';
import Cookies from 'js-cookie';
import Image from 'next/image';
import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';

interface ImagePickerProps {
  imageUrl?: string;
  onImageUpload: (imageUrl: string) => void;
  onImageUploadComplete?: (imageUrl: string) => Promise<void>;
  errorMessage?: string;
}

const ImagePicker = ({
  onImageUpload,
  imageUrl,
  errorMessage,
  onImageUploadComplete
}: ImagePickerProps) => {
  const token = Cookies.get('access_token');
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [previewImage, setPreviewImage] = useState<string>('');
  const [uploadError, setUploadError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const utilsApi = useMemo(() => new UtilsApi(token || ''), [token]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    try {
      setLoading(true);
      setUploadError('');
      setPreviewImage('');

      if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0];

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (!validTypes.includes(file.type)) {
          setUploadError(
            'Invalid file type. Only JPG, JPEG and PNG are allowed.'
          );
          setLoading(false);
          return;
        }

        // Validate file size (2MB limit)
        const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSizeInBytes) {
          setUploadError(
            'File size exceeds 2MB. Please upload a smaller image.'
          );
          setLoading(false);
          return;
        }

        // Create preview immediately for dimmed display during upload
        const previewUrl = URL.createObjectURL(file);
        setPreviewImage(previewUrl);

        const formData = new FormData();
        formData.append('file', file);
        const response = await utilsApi.uploadMedia(formData);
        if (response?.success) {
          const imageRes = `https://storage.googleapis.com/scholarbee-general-assets/${response?.data.doc.filename}`;
          setSelectedImage(imageRes);
          onImageUpload(imageRes);

          // Call the optional callback to handle profile update
          if (onImageUploadComplete) {
            await onImageUploadComplete(imageRes);
          }

          // Clean up preview URL
          URL.revokeObjectURL(previewUrl);
          setPreviewImage('');
          setUploadError('');
        }
      }
    } catch (error) {
      console.log('error', error);
      setUploadError('Error uploading image. Please try again.');
      // Clean up preview on error
      if (previewImage) {
        URL.revokeObjectURL(previewImage);
        setPreviewImage('');
      }
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <Box sx={styles.container} data-testid="image-picker">
      <input
        accept="image/png,image/jpg,image/jpeg"
        id="upload-image"
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleImageChange}
        data-testid="upload-input"
        aria-label="Upload profile photo"
      />

      <Box sx={styles.card}>
        <Box sx={styles.avatarContainer}>
          <Avatar sx={styles.avatar} data-testid="avatar">
            {selectedImage || imageUrl ? (
              <Image
                src={selectedImage || imageUrl || ''}
                alt="Profile"
                fill
                style={{
                  objectFit: 'cover',
                  borderRadius: '50%'
                }}
                data-testid="selected-image"
              />
            ) : previewImage ? (
              <Image
                src={previewImage}
                alt="Profile Preview"
                fill
                style={{
                  objectFit: 'cover',
                  borderRadius: '50%',
                  opacity: loading ? 0.4 : 1,
                  transition: 'opacity 0.3s ease-in-out'
                }}
                data-testid="preview-image"
              />
            ) : (
              <CameraIcon sx={styles.cameraIcon} />
            )}
          </Avatar>
          {loading && (
            <Box sx={styles.loadingOverlay}>
              <CircularProgress size={30} sx={{ color: '#1E3A5F' }} />
            </Box>
          )}
        </Box>

        <Box sx={styles.contentWrapper}>
          <Typography variant="body1" sx={styles.label}>
            Upload Profile Photo
          </Typography>

          <Typography sx={styles.helperText}>
            Supported file types: JPG, PNG. Max size: 2 MB
          </Typography>

          {(uploadError || errorMessage) && (
            <Typography
              fontSize={12}
              color="error"
              sx={styles.errorText}
              data-testid="upload-error"
            >
              {uploadError || errorMessage}
            </Typography>
          )}

          <Button
            variant="contained"
            onClick={triggerFileInput}
            disabled={loading}
            sx={styles.uploadButton}
            data-testid="upload-button"
          >
            Upload photo
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ImagePicker;

const styles: Record<string, SxProps<Theme>> = {
  container: {
    padding: 0,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginTop: 0,
    marginBottom: 0
  },
  card: {
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    alignItems: { xs: 'center', sm: 'center' },
    gap: { xs: 1.5, sm: 2.5 },
    padding: { xs: '16px', sm: '20px', md: '24px' },
    backgroundColor: '#F8FAFC',
    borderRadius: '12px',
    border: '1px dashed #CBD5E1',
    width: '100%'
  },
  avatarContainer: {
    position: 'relative',
    flexShrink: 0
  },
  avatar: {
    width: { xs: 100, sm: 110 },
    height: { xs: 100, sm: 110 },
    bgcolor: '#E2E8F0',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    border: '3px solid #fff',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
    overflow: 'hidden'
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: '50%',
    zIndex: 1
  },
  cameraIcon: {
    color: '#94A3B8',
    fontSize: 44
  },
  contentWrapper: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: { xs: 'center', sm: 'flex-start' },
    gap: 1,
    flex: 1,
    textAlign: { xs: 'center', sm: 'left' }
  },
  label: {
    fontSize: { xs: 15, sm: 16 },
    fontWeight: 600,
    color: '#1E293B',
    lineHeight: 1.4
  },
  errorText: {
    marginTop: 0,
    lineHeight: 1.3,
    fontWeight: 400
  },
  uploadButton: {
    backgroundColor: '#1E3A5F',
    color: '#fff',
    textTransform: 'none',
    fontSize: 14,
    fontWeight: 500,
    padding: '8px 24px',
    borderRadius: '6px',
    minWidth: '130px',
    height: '40px',
    boxShadow: 'none',
    marginTop: 1,
    '&:hover': {
      backgroundColor: '#152A45',
      boxShadow: 'none'
    },
    '&:disabled': {
      backgroundColor: '#CCCCCC',
      color: '#fff'
    }
  },
  helperText: {
    marginTop: 0,
    lineHeight: 1.4,
    fontSize: 12,
    color: '#64748B'
  }
};
