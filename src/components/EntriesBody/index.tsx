interface Props {
  data: [string, string][];
}

export const EntriesBody = ({ data }: Props) => {
  return (
    <div className="entries-body">
      {data.map(([label, value]) => {
        return (
          <div className="entries-item" key={label + value}>
            <b className="entries-item__label">{label}: &nbsp;</b>
            <span className="entries-item__value">
              <code>{value}</code>
            </span>
          </div>
        );
      })}
    </div>
  );
};
