import './index.less';

export const Footer = () => {
  return (
    <div className="flex-center footer">
      <div className="text-center">
        <p>Released under the MIT License</p>
        <p>
          <span>Copyright &copy; 2023 - present</span>{' '}
          <a href={import.meta.env.VITE_GITHUB_HOMEPAGE} target="_blank">
            HuolalaTech
          </a>
        </p>
      </div>
    </div>
  );
};
