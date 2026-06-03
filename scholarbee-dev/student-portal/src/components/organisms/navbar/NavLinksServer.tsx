'use client';
import React from 'react';
import Link from 'next/link';
import { Button } from '@mui/material';
import { pages } from '@/constants';
import { classes } from './styles';

// Client component that renders nav items (active state added after mount)
interface NavLinksServerProps {
  readonly activePathname?: string | null;
}

export default function NavLinksServer({
  activePathname
}: NavLinksServerProps) {
  return (
    <>
      {pages.map((item) => {
        const isActive = activePathname === item.link;

        return (
          <Link
            key={item.title}
            href={item.link.toLowerCase()}
            style={{ textDecoration: 'none' }}
            aria-label={`Go to ${item.title}`}
            title={item.title}
          >
            <Button
              sx={classes.navItem}
              className={isActive ? 'active' : ''}
              data-test-id={`nav-item-${item.title}`}
            >
              {item.title}
            </Button>
          </Link>
        );
      })}
    </>
  );
}
