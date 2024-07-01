import { LinkOutlined } from '@ant-design/icons';
import clsx from 'clsx';
import React from 'react';
import { PropsWithChildren } from 'react';
import './index.less';
import { Link } from 'react-router-dom';

export const HeaderLink = ({
  level = 1,
  slug,
  children,
}: PropsWithChildren<{
  level: number;
  slug: string;
}>) => {
  return React.createElement(
    `h${level}`,
    {
      id: slug,
      className: clsx('header-link', `level-${level}`),
    },
    [
      <Link to={`#${slug}`} className="header-anchor" key="anchor">
        <LinkOutlined />
      </Link>,
      children,
    ],
  );
};
