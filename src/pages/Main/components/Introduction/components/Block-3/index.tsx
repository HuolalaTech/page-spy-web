import './index.less';
import { Trans, useTranslation } from 'react-i18next';
import data from './comments.json';
import { Avatar, Flex, theme } from 'antd';

const { useToken } = theme;

export const IntroBlock3 = () => {
  const { t } = useTranslation();

  return (
    <div className="intro-block block-3">
      <div className="community-comments" style={{ textAlign: 'center' }}>
        <Trans i18nKey="intro.community-comments">
          <h1>深受社区青睐</h1>
          <h3>
            不要只看我们说
            <br />
            来听听 PageSpy 社区中真实用户的声音
          </h3>
        </Trans>
        <div className="comments-container">
          {data.map((i) => (
            <Flex key={i.html_url} vertical gap={24}>
              <Flex gap={12} align="center">
                <Avatar
                  size="large"
                  src={i.user.avatar_url}
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
                >
                  {i.user.login.slice(0, 1)}
                </Avatar>
                <b className="username">{i.user.login}</b>
              </Flex>
              <p className="comments-item">{i.body}</p>
            </Flex>
          ))}
        </div>
      </div>
    </div>
  );
};
