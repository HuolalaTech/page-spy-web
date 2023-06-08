import './index.less';

interface TimestampTypes {
  time: Date;
}

function getLocalTime(nS: number | any) {
  return new Date(parseInt(nS)).toLocaleString().replace(/:\d{1,2}$/, ' ');
}

const Timestamp = (props: TimestampTypes) => {
  const { time } = props;
  return <span className="timestamp">{getLocalTime(time)}</span>;
};

export default Timestamp;
