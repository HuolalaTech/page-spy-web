// import { ReactComponent as NoDocSvg } from '@/assets/image/no-doc.svg';
import NoDocSvg from '@/assets/image/no-doc.svg';
import Icon from '@ant-design/icons';
import './index.less';

export const DocNotFound = () => {
  return (
    <div className="doc-not-found">
      {/* <Icon component={NoDocSvg} style={{ fontSize: 400 }} /> */}
      <img src={NoDocSvg} style={{ width: '40%' }} alt="" />
      <p>Not Found</p>
    </div>
  );
};
