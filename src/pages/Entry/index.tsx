import { Flex } from 'antd';
import { Link } from 'react-router-dom';

export const Entry = () => {
  return (
    <Flex justify="center" align="center" style={{ height: '100%' }} gap={20}>
      <Link to="/pagespy">PageSpy</Link>
      <Link to="/o-spy">O-Spy</Link>
    </Flex>
  );
};
