import React from 'react';
import Icon from '@ant-design/icons/lib/components/Icon';
import { ReactComponent as ErrorSvg } from '@/assets/image/error.svg';
import { ReactComponent as InfoSvg } from '@/assets/image/info.svg';
import { ReactComponent as WarnSvg } from '@/assets/image/warn.svg';
import { ReactComponent as DebugOriginSvg } from '@/assets/image/debug-origin.svg';
import { ReactComponent as DebugEvalSvg } from '@/assets/image/debug-eval.svg';
import { ReactComponent as UserSvg } from '@/assets/image/user.svg';
import './index.less';
import type { SpyConsole } from '@huolala-tech/page-spy';

interface ThemeItem {
  color: string;
  icon: React.ComponentType | null;
}
type Theme = Record<SpyConsole.DataType | 'default', ThemeItem>;

const Type2Theme: Partial<Theme> = {
  info: {
    color: '#3683F9',
    icon: InfoSvg,
  },
  error: {
    color: '#D7423F',
    icon: ErrorSvg,
  },
  warn: {
    color: '#E9994B',
    icon: WarnSvg,
  },
  'debug-origin': {
    color: '#8236CB',
    icon: DebugOriginSvg,
  },
  'debug-eval': {
    color: '#8236CB',
    icon: DebugEvalSvg,
  },
  default: {
    color: '#000000',
    icon: UserSvg,
  },
};

interface Props {
  type: SpyConsole.DataType;
}

const LogType = ({ type }: Props) => {
  const logType = type.toLowerCase() as SpyConsole.DataType;
  let theme = Type2Theme.default;
  if (logType in Type2Theme) {
    theme = Type2Theme[logType];
  }
  const { icon } = theme!;
  return (
    <div className="log-type">
      <div className="log-type__icon" title={logType}>
        {icon && (
          <Icon component={icon} style={{ fontSize: 14, lineHeight: 1 }} />
        )}
      </div>
      {/* <div className="log-type__label">
        <b style={{ color }}>{`${_type[0].toUpperCase() + _type.slice(1)} `}</b>
      </div> */}
    </div>
  );
};

export default LogType;
