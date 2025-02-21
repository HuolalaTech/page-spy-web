import { isClient } from '@/utils/constants';
import { version } from '../../../../package.json';
import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import LogoSvg from '@/assets/image/logo.svg?react';
import OSpySvg from '@/assets/image/o-spy.svg?react';
import Icon from '@ant-design/icons';
import Title from 'antd/es/typography/Title';
import './index.less';
import { useWhere } from '@/utils/useWhere';

export const Logo = () => {
  const where = useWhere();

  const config = useMemo(() => {
    const { isOSpy } = where;
    if (isOSpy) {
      return {
        image: OSpySvg,
        name: 'O-Spy',
        link: '/o-spy',
      };
    }
    return {
      image: LogoSvg,
      name: 'PageSpy',
      link: '/',
    };
  }, [where]);

  return (
    <Link to={config.link}>
      <Icon component={config.image} className="logo-icon" />
      <Title level={4} className="logo-name">
        {config.name}
        {isClient && <span className="page-spy-version">v{version}</span>}
      </Title>
    </Link>
  );
};
