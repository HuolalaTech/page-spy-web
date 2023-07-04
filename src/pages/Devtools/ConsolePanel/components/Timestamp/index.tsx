import './index.less';

interface TimestampTypes {
  time?: number;
}

function getLocalTime(nS: number) {
  return new Date(nS).toLocaleString().replace(/:\d{1,2}$/, ' ');
}

const Timestamp = (props: TimestampTypes) => {
  const { time = Date.now() } = props;
  return <span className="timestamp">{getLocalTime(time)}</span>;
};

export default Timestamp;
