import React from 'react';
import { Box, Typography } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import metaNewIcon from '@public/assets/svg/meta-new.svg';
import instagramIcon from '@public/assets/svg/insta-new.svg';
import tiktokNewIcon from '@public/assets/svg/tiktok-new.svg';
import youtubeNewIcon from '@public/assets/svg/youtube-new.svg';
import inNewIcon from '@public/assets/svg/in-new.svg';
import logo from '@public/assets/svg/logo.svg';
import FooterPartnersSection from './footer/footerPartnersSection';

const Footer = () => {
  const links = [
    { title: 'Home', link: '/' },
    { title: 'Programs', link: '/programs' },
    { title: 'Scholarship', link: '/search-scholarship' },
    { title: 'Compare Universities', link: 'programs/compare-universities' },
    { title: 'About us', link: '/about-us' },
    { title: 'Blog', link: '/blogs' }
  ];

  const socialLinks = [
    {
      href: 'https://www.facebook.com/profile.php?id=61565762532814',
      icon: metaNewIcon,
      alt: 'Facebook'
    },
    {
      href: 'https://www.instagram.com/scholarbee.ai/',
      icon: instagramIcon,
      alt: 'Instagram'
    },
    {
      href: 'https://www.tiktok.com/@scholarbee_official',
      icon: tiktokNewIcon,
      alt: 'TikTok'
    },
    {
      href: 'https://www.youtube.com/@ScholarBee-pk',
      icon: youtubeNewIcon,
      alt: 'YouTube'
    },
    {
      href: 'https://www.linkedin.com/company/scholarbee/',
      icon: inNewIcon,
      alt: 'LinkedIn'
    }
  ];

  const styles = {
    root: {
      position: 'relative',
      width: '100%',
      margin: '0 auto',
      background: '#FFFFFF',
      borderTop: '1px solid #CED0D4',
      overflow: 'hidden'
    },
    watermarkPattern: {
      position: 'absolute',
      width: '739.82px',
      left: '50%',
      transform: 'translateX(-50%)',
      top: '62.14%',
      bottom: '18.49%',
      display: { xs: 'none', md: 'block' },
      pointerEvents: 'none'
    },
    watermarkVector: {
      position: 'absolute',
      background: '#F7F7F7',
      width: '4px',
      height: '4px',
      borderRadius: '50%'
    },
    mainContent: {
      position: 'relative',
      width: '100%',
      maxWidth: '1296px',
      margin: '0 auto',
      padding: {
        xs: 3,
        md: '64px 72px 32px 72px',
        '@media (max-width: 1290px)': {
          padding: '64px 48px 12px 48px'
        }
      },
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      gap: { xs: 4, md: 3 },
      flexWrap: { xs: 'wrap', md: 'nowrap', lg: 'nowrap' },
      '@media (min-width: 1290px)': {
        flexWrap: 'nowrap'
      }
    },
    scholarBeeSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: 3,
      width: { xs: '100%', md: '260.4px' },
      flexShrink: 0,
      justifyContent: 'space-between',
      minHeight: { md: '100%' }
    },
    logoContainer: {
      width: { xs: '100%', md: '240.4px' },
      height: { xs: 'auto', md: '56px' },
      position: 'relative'
    },
    description: {
      color: '#212327',
      fontSize: { xs: '13px', md: '14px' },
      lineHeight: '22px'
    },
    section: {
      display: 'flex',
      flexDirection: 'column',
      gap: { xs: 2, md: 3 },
      width: { xs: '100%', sm: 'auto' },
      minWidth: { xs: '100%', sm: '200px' },
      maxWidth: { xs: '100%', sm: '250px' },
      flexShrink: 1
    },
    partnerSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: { xs: 2, md: 3 },
      width: { xs: '100%', sm: 'auto' },
      minWidth: { xs: '100%', sm: '240px' },
      maxWidth: { xs: '100%', sm: '280px' },
      flexShrink: 1
    },
    sectionTitle: {
      fontWeight: 600,
      color: '#000000',
      fontSize: { xs: '16px', md: '18px' },
      lineHeight: '22px'
    },
    sectionList: {
      display: 'flex',
      flexDirection: 'column',
      gap: { xs: 1.5, md: 2 },
      width: '100%',
      minWidth: 0
    },
    sectionItem: {
      color: '#212327',
      fontSize: { xs: '13px', md: '14px' },
      lineHeight: { xs: '18px', md: '18px' },
      textDecoration: 'none',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      maxWidth: '100%',
      '&:hover': {
        color: '#004AE0'
      }
    },
    contactSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: { xs: 2, md: 3.75 },
      width: { xs: '100%', md: '359.53px' },
      flexShrink: 0,
      minWidth: { md: '359.53px' }
    },
    contactItem: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: { xs: 'flex-start', md: 'center' },
      gap: 2
    },
    contactIcon: {
      width: '24px',
      height: '24px',
      color: '#000000',
      flexShrink: 0,
      marginTop: { xs: '2px', md: 0 }
    },
    contactText: {
      color: '#212327',
      fontSize: { xs: '13px', md: '14px' },
      lineHeight: '20px',
      flex: 1
    },
    addressContainer: {
      display: 'flex',
      flexDirection: 'row',
      gap: 2,
      alignItems: 'flex-start'
    },
    addressList: {
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      flex: 1
    },
    bottomSection: {
      position: 'relative',
      width: '100%',
      height: { xs: 'auto', md: '132px' },
      background: '#FFFFFF',
      borderTop: '1px solid #CED0D4',
      padding: { xs: 3, md: 0 }
    },
    bottomContent: {
      position: 'relative',
      width: '100%',
      maxWidth: '1296px',
      margin: '0 auto',
      padding: {
        xs: 0,
        md: '32px 200px 32px 72px',
        '@media (max-width: 1356px)': {
          padding: '32px 24px 32px 72px'
        }
      },
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      justifyContent: 'space-between',
      alignItems: { xs: 'flex-start', md: 'center' },
      gap: { xs: 3, md: 2 },
      '@media (max-width: 1356px)': {
        gap: 2,
        flexWrap: 'wrap'
      }
    },
    footerLinks: {
      display: 'flex',
      flexDirection: { xs: 'column', md: 'row' },
      gap: { xs: 1.5, md: 3.625 },
      alignItems: { xs: 'flex-start', md: 'center' },
      flexShrink: 1,
      minWidth: 0,
      '@media (max-width: 1356px)': {
        gap: 2
      }
    },
    footerLink: {
      color: '#000000',
      fontSize: { xs: '13px', md: '14px' },
      lineHeight: '20px',
      textDecoration: 'none',
      '&:hover': {
        color: '#004AE0'
      }
    },
    copyright: {
      color: '#000000',
      lineHeight: '24px',
      position: { xs: 'static', md: 'absolute' },
      left: { xs: 'auto', md: '140px' },
      top: { xs: 'auto', md: '382px' },
      width: { xs: 'auto', md: '308px' },
      height: { xs: 'auto', md: '24px' }
    },
    followUs: {
      display: 'flex',
      flexDirection: 'column',
      gap: 1.5,
      width: { xs: '100%', md: '200px' },
      flexShrink: 0,
      '@media (max-width: 1356px)': {
        width: 'auto',
        minWidth: '200px'
      }
    },
    followUsTitle: {
      fontWeight: 600,
      color: '#000000',
      fontSize: { xs: '14px', md: '16px' },
      lineHeight: '22px'
    },
    socialIcons: {
      display: 'flex',
      flexDirection: 'row',
      gap: 3,
      alignItems: 'center'
    },
    socialIcon: {
      width: '32px',
      height: '32px',
      position: 'relative',
      cursor: 'pointer',
      transition: 'transform 0.2s',
      '&:hover': {
        transform: 'scale(1.1)'
      }
    }
  };

  return (
    <Box component="footer" sx={styles.root} data-test-id="footer">
      {/* Watermark Pattern */}
      <Box sx={styles.watermarkPattern}>
        {[...Array(10)].map((_, i) => (
          <Box
            key={i}
            sx={{
              ...styles.watermarkVector,
              left: `${24.32 + i * 5.5}%`,
              top: i % 2 === 0 ? '63.11%' : '66.8%'
            }}
          />
        ))}
      </Box>

      {/* Main Content */}
      <Box sx={styles.mainContent}>
        {/* ScholarBee Section */}
        <Box sx={styles.scholarBeeSection}>
          <Box sx={styles.logoContainer}>
            <Image
              src={logo}
              alt="ScholarBee Logo"
              style={{
                width: '100%',
                height: 'auto',
                maxWidth: '200px'
              }}
            />
          </Box>
          <Typography variant="body1" sx={styles.description}>
            ScholarBee connects students with top HEC-recognized universities,
            scholarships, and academic programs across Pakistan.
          </Typography>
          {/* Copyright */}
          <Box sx={{ mt: 'auto' }}>
            <Typography
              variant="body2"
              sx={{
                color: '#000000',
                // fontSize: { xs: '11px', md: '13px' },
                lineHeight: '18px'
              }}
              data-test-id="footer-copyright"
            >
              {`© Copyright ${new Date().getFullYear()} - ScholarBee`}
            </Typography>
          </Box>
        </Box>

        {/* Partners Section */}
        <FooterPartnersSection styles={styles} />

        {/* Links Section */}
        <Box component="nav" sx={styles.section} aria-label="Footer Navigation">
          <Typography variant="h6" component="h2" sx={styles.sectionTitle}>
            Links
          </Typography>
          <Box
            component="ul"
            sx={{ ...styles.sectionList, p: 0, m: 0, listStyle: 'none' }}
          >
            {links.map((link, index) => (
              <Box component="li" key={index}>
                <Link
                  href={link.link}
                  style={{ textDecoration: 'none' }}
                  aria-label={`Go to ${link.title}`}
                  title={link.title}
                >
                  <Typography sx={styles.sectionItem}>{link.title}</Typography>
                </Link>
              </Box>
            ))}
          </Box>
        </Box>

        {/* Contact Us Section */}
        <Box
          component="address"
          sx={{ ...styles.contactSection, fontStyle: 'normal' }}
        >
          <Typography variant="h6" component="h2" sx={styles.sectionTitle}>
            Contact us
          </Typography>
          <Box
            component="ul"
            sx={{ ...styles.sectionList, p: 0, m: 0, listStyle: 'none' }}
          >
            <Box component="li" sx={styles.contactItem}>
              <PhoneIcon sx={styles.contactIcon} />
              <Typography sx={styles.contactText}>+92 325 555 9699</Typography>
            </Box>
            <Box component="li" sx={styles.contactItem}>
              <EmailIcon sx={styles.contactIcon} />
              <Typography sx={styles.contactText}>
                info@scholarbee.pk
              </Typography>
            </Box>
            <Box component="li" sx={styles.addressContainer}>
              <LocationOnIcon sx={styles.contactIcon} />
              <Box sx={styles.addressList}>
                <Typography sx={styles.contactText}>
                  Meydan Grandstand, 6th floor, Meydan Road, Nad Al Sheba,
                  Dubai, U.A.E
                </Typography>
                <Typography sx={styles.contactText}>
                  NASTP Rd, Chaklala Cantt., Rawalpindi, 46000
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Bottom Section */}
      <Box sx={styles.bottomSection}>
        <Box sx={styles.bottomContent}>
          <Box
            component="ul"
            sx={{ ...styles.footerLinks, p: 0, m: 0, listStyle: 'none' }}
          >
            <Box component="li">
              <Link
                href="/privacy-policy"
                style={{ textDecoration: 'none' }}
                aria-label="Go to Privacy policy"
                title="Privacy policy"
              >
                <Typography sx={styles.footerLink}>Privacy policy</Typography>
              </Link>
            </Box>
            <Box component="li">
              <Link
                href="/terms-and-conditions"
                style={{ textDecoration: 'none' }}
                aria-label="Go to Terms and Conditions"
                title="Terms and Conditions"
              >
                <Typography sx={styles.footerLink}>
                  Terms & Conditions
                </Typography>
              </Link>
            </Box>
          </Box>

          <Box sx={styles.followUs}>
            <Typography variant="h6" component="h2" sx={styles.followUsTitle}>
              Follow Us
            </Typography>
            <Box
              component="ul"
              sx={{ ...styles.socialIcons, p: 0, m: 0, listStyle: 'none' }}
            >
              {socialLinks.map((social, index) => (
                <Box component="li" key={index}>
                  <Link
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                    aria-label={`Follow us on ${social.alt}`}
                    title={`Follow us on ${social.alt}`}
                  >
                    <Box sx={styles.socialIcon}>
                      <Image
                        src={social.icon}
                        alt=""
                        fill
                        style={{ objectFit: 'contain' }}
                      />
                    </Box>
                  </Link>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Footer;
