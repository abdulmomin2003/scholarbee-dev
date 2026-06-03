'use client';
import React, { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import { pages } from '@/constants';
import { useLogout } from '@/hooks/useLogout';
import { classes } from './styles';
import logo from '@public/assets/svg/logo.svg';

interface MobileDrawerProps {
  readonly window?: () => Window;
  isCritical?: boolean;
}

export default function MobileDrawer({ window }: MobileDrawerProps) {
  // isCritical prop is kept for API compatibility but not used in this component
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const { handleLogout } = useLogout();

  // Use client-side only cookie check to avoid hydration mismatch
  const [userId, setUserId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
    setUserId(Cookies.get('userId') ?? null);
  }, []);

  const handleDrawerToggle = useCallback(() => {
    setMobileOpen((prevState) => !prevState);
  }, []);

  const container =
    window !== undefined ? () => window().document.body : undefined;

  const drawer = useMemo(
    () => (
      <Box
        onClick={handleDrawerToggle}
        sx={{ textAlign: 'center', paddingY: 1 }}
        data-test-id="drawer"
      >
        <Image src={logo} height={25} width={135} alt="logo" />
        <Divider />
        <List>
          {[...pages, { title: 'Profile', link: '/profile' }].map((item) => (
            <ListItem key={item.title} disablePadding>
              <Link
                href={`${item.link.toLowerCase()}`}
                style={{
                  width: '100%',
                  textDecoration: 'none',
                  color: 'inherit'
                }}
              >
                <ListItemButton
                  sx={{ textAlign: 'center' }}
                  data-test-id={`drawer-item-${item.title}`}
                >
                  <ListItemText primary={item.title} />
                </ListItemButton>
              </Link>
            </ListItem>
          ))}
          {mounted && userId ? (
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleLogout}
                sx={{ textAlign: 'center' }}
              >
                <ListItemText
                  primary="Logout"
                  sx={{ color: theme.palette.error.main }}
                />
              </ListItemButton>
            </ListItem>
          ) : (
            mounted && (
              <>
                <ListItem disablePadding>
                  <Link
                    href="/login"
                    style={{
                      width: '100%',
                      textDecoration: 'none',
                      color: 'inherit'
                    }}
                  >
                    <ListItemButton sx={{ textAlign: 'center' }}>
                      <ListItemText primary="Login" />
                    </ListItemButton>
                  </Link>
                </ListItem>
                <ListItem disablePadding>
                  <Link
                    href="/sign-up"
                    style={{
                      width: '100%',
                      textDecoration: 'none',
                      color: 'inherit'
                    }}
                  >
                    <ListItemButton sx={{ textAlign: 'center' }}>
                      <ListItemText primary="Signup" />
                    </ListItemButton>
                  </Link>
                </ListItem>
              </>
            )
          )}
        </List>
      </Box>
    ),
    [
      handleDrawerToggle,
      handleLogout,
      theme.palette.error.main,
      userId,
      mounted
    ]
  );

  return (
    <>
      <motion.div
        whileHover={{ scale: 1.1, rotate: 90 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <IconButton
          color="primary"
          aria-label="open drawer"
          edge="start"
          onClick={handleDrawerToggle}
          sx={{ ml: 2, display: { md: 'none' } }}
          data-test-id="menu-icon"
        >
          <MenuIcon />
        </IconButton>
      </motion.div>
      <nav>
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true
          }}
          sx={classes.drawer}
          data-test-id="mobile-drawer"
        >
          {drawer}
        </Drawer>
      </nav>
    </>
  );
}
