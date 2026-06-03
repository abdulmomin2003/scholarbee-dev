'use client';
import Link from 'next/link';
import { ReactNode, MouseEvent } from 'react';
import NProgress from 'nprogress';

interface ProgressLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
  replace?: boolean;
  scroll?: boolean;
  prefetch?: boolean;
  onClick?: (e: MouseEvent<HTMLAnchorElement>) => void;
}

export default function ProgressLink({
  href,
  children,
  className,
  style,
  replace = false,
  scroll = true,
  prefetch = true,
  onClick,
  ...props
}: ProgressLinkProps) {
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (
      href.startsWith('http') ||
      href.startsWith('#') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:')
    ) {
      onClick?.(e);
      return;
    }

    // Start progress bar
    NProgress.start();

    // Call custom onClick if provided
    onClick?.(e);
  };

  return (
    <Link
      href={href}
      className={className}
      style={style}
      replace={replace}
      scroll={scroll}
      prefetch={prefetch}
      onClick={handleClick}
      {...props}
    >
      {children}
    </Link>
  );
}
