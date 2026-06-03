'use client';
import * as React from 'react';
import Typography from '@mui/material/Typography';
import Breadcrumbs, { BreadcrumbsProps } from '@mui/material/Breadcrumbs';
import HomeIcon from '@public/assets/svg/home-contained.svg';
import Image from 'next/image';
import Link from 'next/link';
import arrowRight from '@public/assets/svg/arrow-right-primary.svg';
import { usePathname } from 'next/navigation';
import { Container } from '@mui/material';

interface BreadcrumbItem {
  title: string;
  link?: string;
  onClick?: () => void;
}

interface IconBreadcrumbsProps extends BreadcrumbsProps {
  items?: BreadcrumbItem[];
  customTitle?: string;
  customSecondLastItem?: BreadcrumbItem; // Custom second-last breadcrumb
  container?: boolean; // Add container prop
}

export default function BreadCrumbs({
  items,
  customTitle,
  customSecondLastItem,
  container = false, // Default to false
  ...rest
}: IconBreadcrumbsProps) {
  const pathname = usePathname();
  const pathnames = pathname.split('/').filter((x) => x);

  const generatePath = (index: number) =>
    `/${pathnames.slice(0, index + 1).join('/')}`;

  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1);

  const truncateTitle = (title: string) =>
    title.length > 30 ? `${title.substring(0, 30)}...` : title;

  const getLastItemTitle = (defaultTitle: string) => {
    if (customTitle) {
      return truncateTitle(customTitle);
    }
    return truncateTitle(defaultTitle);
  };

  const renderBreadcrumbItems = () => {
    if (items && items.length > 0) {
      return items.map((item, index) => {
        const isLast = index === items.length - 1;

        return isLast ? (
          <Typography
            key={item.title}
            fontWeight="medium"
            color="primary.main"
            style={{ textTransform: 'capitalize' }}
          >
            {getLastItemTitle(item?.title || '')}
          </Typography>
        ) : item.link ? (
          <Link
            key={item.title}
            href={item.link}
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none'
            }}
            aria-label={`Go to ${item?.title || 'page'}`}
            title={item?.title}
          >
            <Typography fontWeight="medium" color="primary.main">
              {truncateTitle(item?.title || '')}
            </Typography>
          </Link>
        ) : item.onClick ? (
          <Typography
            key={item.title}
            fontWeight="medium"
            color="primary.main"
            style={{ textTransform: 'capitalize', cursor: 'pointer' }}
            onClick={item.onClick}
          >
            {truncateTitle(item?.title || '')}
          </Typography>
        ) : (
          <Typography
            key={item.title}
            fontWeight="medium"
            color="primary.main"
            style={{ textTransform: 'capitalize' }}
          >
            {truncateTitle(item?.title || '')}
          </Typography>
        );
      });
    }

    // Otherwise, render breadcrumb based on the current path
    return pathnames.map((name, index) => {
      const isLast = index === pathnames.length - 1;
      const isSecondLast = index === pathnames.length - 2;
      const href = generatePath(index);

      // If customSecondLastItem is provided and this is the second-last item, use the custom item
      if (isSecondLast && customSecondLastItem) {
        return customSecondLastItem.link ? (
          <Link
            key={customSecondLastItem.title}
            href={customSecondLastItem.link}
            style={{
              display: 'flex',
              alignItems: 'center',
              textDecoration: 'none'
            }}
            aria-label={`Go to ${customSecondLastItem.title}`}
            title={customSecondLastItem.title}
          >
            <Typography fontWeight="medium" color="primary.main">
              {truncateTitle(customSecondLastItem.title)}
            </Typography>
          </Link>
        ) : (
          <Typography
            key={customSecondLastItem.title}
            fontWeight="medium"
            color="primary.main"
            style={{ textTransform: 'capitalize' }}
          >
            {truncateTitle(customSecondLastItem.title)}
          </Typography>
        );
      }

      return isLast ? (
        <Typography
          key={name}
          fontWeight="medium"
          color="primary.main"
          style={{ textTransform: 'capitalize' }}
        >
          {getLastItemTitle(capitalize(name.replace(/-/g, ' ')))}
        </Typography>
      ) : (
        <Link
          key={name}
          href={href}
          style={{
            display: 'flex',
            alignItems: 'center',
            textDecoration: 'none'
          }}
          aria-label={`Go to ${capitalize(name.replace(/-/g, ' '))}`}
          title={capitalize(name.replace(/-/g, ' '))}
        >
          <Typography fontWeight="medium" color="primary.main">
            {capitalize(name.replace(/-/g, ' '))}
          </Typography>
        </Link>
      );
    });
  };

  const breadcrumbsComponent = (
    <Breadcrumbs
      separator={
        <Image src={arrowRight} alt="arrow right" height={16} width={16} />
      }
      {...rest}
      aria-label="breadcrumb"
    >
      <Link
        style={{ display: 'flex', alignItems: 'center' }}
        href="/"
        aria-label="Go to home"
        title="Home"
      >
        <Image alt="" src={HomeIcon} />
      </Link>
      {renderBreadcrumbItems()}
    </Breadcrumbs>
  );

  // Wrap with Container if container prop is true
  return container ? (
    <Container>{breadcrumbsComponent}</Container>
  ) : (
    breadcrumbsComponent
  );
}
