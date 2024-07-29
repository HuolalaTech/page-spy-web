import { AnchorHTMLAttributes, PropsWithChildren } from 'react';
import { TransitionLink } from '@/components/Transition';
import { useNavigate } from 'react-router-dom';
import { isString } from 'lodash-es';

const GITHUB_REPO_LINK =
  /https:\/\/github\.com\/HuolalaTech\/(page-spy.*?)\/(pull|issues)\/(\d+)/;

// 超链接可能使用环境变量，使用格式
// - 正常：[xxx](https://xxx/yyy)
// - 支持 gfm 自动识别链接：如果是 github 仓库相关的，如 https://github.com/HuolalaTech/page-spy-web/pull/239 会进一步处理成 <repo>#<id>
// - 支持使用环境变量: [xxx]({VITE_XXX})
// - 支持相对路径的文档过渡效果: [xxx](./xxx)
const A = (
  props: PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement>>,
) => {
  const navigate = useNavigate();

  const { children, href } = props;
  const decodeHref = decodeURI(href as string);

  if (isString(children)) {
    const githubMatched = children.match(GITHUB_REPO_LINK);
    if (githubMatched !== null) {
      const [link, repo, type, id] = githubMatched;
      return (
        <a href={link} target="_blank">
          {`${repo}#${id}`}
        </a>
      );
    }
  }

  if (!href) return null;

  const url = decodeHref.replace(/\{VITE_(.*?)\}/, (_, key) => {
    return import.meta.env[`VITE_${key}`];
  });
  if (url.startsWith('http')) {
    return (
      <a href={url} target="_blank">
        {children}
      </a>
    );
  }

  return (
    <TransitionLink
      to={url}
      onClick={(e) => {
        e.preventDefault();
        navigate(href);
      }}
    >
      {children}
    </TransitionLink>
  );
};

export default A;
