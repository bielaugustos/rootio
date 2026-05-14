

export const TimeLine = ({ items }: { items?: any[] }) => (
  <div>
    {items?.map((item, i) => (
      <div key={i}>{item}</div>
    ))}
  </div>
)
