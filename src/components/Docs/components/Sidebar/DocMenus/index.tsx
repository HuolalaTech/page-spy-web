import { useLanguage } from '@/utils/useLanguage';
import { useParams } from 'react-router-dom';
import './index.less';
import clsx from 'clsx';
import { memo } from 'react';
import { TransitionLink } from '@/components/Transition';
import { useDocContext } from '@/components/Docs/context';
import { isString } from '@huolala-tech/page-spy-base';

export const DocMenus = memo(() => {
  const { sidebar } = useDocContext();
  const [lang] = useLanguage();
  const params = useParams();
  // route match rule "/docs/*"
  const activeDoc = params['*'] || sidebar[0].children[0].doc;

  return (
    <div className="doc-menus">
      {sidebar.map(({ group, children }, index) => {
        return (
          <div className="doc-menus__group" key={index}>
            <h4>{isString(group) ? group : group[lang]}</h4>
            {children.map(({ label, doc }) => {
              return (
                <TransitionLink
                  to={doc}
                  key={doc}
                  className={clsx('menu-item', {
                    active: activeDoc === doc,
                  })}
                >
                  {typeof label === 'string' ? label : label[lang]}
                </TransitionLink>
              );
            })}
          </div>
        );
      })}
    </div>
  );
});
