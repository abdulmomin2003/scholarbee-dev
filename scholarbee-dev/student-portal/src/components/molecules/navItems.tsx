import { menuItems } from '@/constants';
import Link from 'next/link';
import React from 'react';

const NavItems = () => (
  <ul className="nav-menu" data-test-id="nav-menu">
    {menuItems.map(({ path, label }) => (
      <li
        key={label}
        data-test-id={`nav-item-${label.toLowerCase().replace(/ /g, '-')}`}
      >
        <Link
          className="nav-link"
          href={path}
          data-test-id={`nav-link-${label.toLowerCase().replace(/ /g, '-')}`}
          aria-label={`Go to ${label}`}
          title={label}
        >
          {label}
        </Link>
      </li>
    ))}
  </ul>
);

export default NavItems;
