import React, { ReactChild, ReactNode } from 'react';
import NextLink, { LinkProps as NextLinkProps } from 'next/link';

import { useRouter } from 'next/router';

interface LinkProps extends NextLinkProps {
  activeClassName: string;
  children: ReactNode;
}

const Link: React.FC<LinkProps> = ({ href, activeClassName, children }) => {
  return <NextLink href="">hi</NextLink>;
};

export default Link;
