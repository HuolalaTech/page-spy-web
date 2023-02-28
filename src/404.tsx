import { Result, Button } from 'antd';
import { Link, Navigate } from 'react-router-dom';

export const To404 = () => <Navigate to="/404" replace />;

export const Page404 = () => (
  <Result
    status="404"
    title="404"
    subTitle="对不起，您找的页面不存在！"
    extra={
      <Button type="primary">
        <Link to="/">返回首页</Link>
      </Button>
    }
  />
);
