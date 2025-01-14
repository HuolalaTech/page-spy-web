import { useContext } from 'react';
import { Link, LinkProps, useNavigate } from 'react-router-dom';
import { TransitionContext } from './Context';

type Props = LinkProps;

export const TransitionLink = (props: Props) => {
  const { startTransition } = useContext(TransitionContext);
  const navigate = useNavigate();

  return (
    <Link
      {...props}
      onClick={(e) => {
        e.preventDefault();
        startTransition(() => {
          navigate(props.to);
        });
      }}
    />
  );
};
