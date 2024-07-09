import './index.less';

export const Footer = () => {
  return (
    <div className="flex-center footer">
      <div className="text-center">
        <p>Open-source MIT Licensed.</p>
        <p>
          Copyright &copy; 2023{' '}
          <a href={import.meta.env.VITE_GITHUB_HOMEPAGE} target="_blank">
            Huolala-Tech
          </a>
        </p>
      </div>
    </div>
  );
};
