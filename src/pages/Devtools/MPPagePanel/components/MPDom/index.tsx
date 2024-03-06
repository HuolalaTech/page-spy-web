import { ElementNode } from '@/pages/Devtools/ElementPanel';
import {
  MPDomNode,
  MPPageInfo,
} from '@huolala-tech/page-spy-types/lib/mp-page';
import React, { useEffect, useMemo, useState } from 'react';
import '@/pages/Devtools/ElementPanel/index.less';
import { mpDomToElementTree } from '@/store/socket-message/utils';

type Props = {
  dom?: MPDomNode;
};

const MPDom = (props: Props) => {
  const { dom } = props;
  useEffect(() => {
    console.log('dom changed', JSON.stringify(dom));
  }, [dom]);

  const element = useMemo(() => {
    if (dom) {
      return mpDomToElementTree([dom]);
    }
    return [];
  }, [dom]);

  return (
    <div className="element-panel">
      <ElementNode ast={element} />
    </div>
  );
};

export default MPDom;
