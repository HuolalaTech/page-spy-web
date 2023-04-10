import { LinkOutlined } from '@ant-design/icons';
import clsx from 'clsx';
import React from 'react';
import { PropsWithChildren } from 'react';
import './index.less';

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
      <a href={`#${slug}`} key="anchor">
        <LinkOutlined />
      </a>,
      children,
    ],
  );
};
