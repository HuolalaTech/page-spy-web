import { LinkOutlined, NumberOutlined } from '@ant-design/icons';
import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { PropsWithChildren } from 'react';
import './index.less';
import { Link, useLocation } from 'react-router-dom';

export const HeaderLink = ({
  level = 1,
  slug,
  children,
}: PropsWithChildren<{
  level: number;
  slug: string;
}>) => {
  const { hash } = useLocation();
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (hash && decodeURIComponent(hash) === `#${slug}`) {
      setShow(true);
    }
  }, [hash, slug]);
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
      <div key="children">{children}</div>,
      show && (
        <div
          className="matched-bg"
          key="bg"
          onAnimationEnd={() => {
            setShow(false);
          }}
        />
      ),
    ],
  );
};
