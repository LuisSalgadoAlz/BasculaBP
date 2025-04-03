import { LiaCitySolid } from "react-icons/lia";

const CardHeader = ({data, name, title}) => {
  return (
    <>
      <div
        className="rounded-lg border border-gray-300 bg-white text-card-foreground shadow-lg"
      >
        <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="tracking-tight text-sm font-medium">{title}</h3>
          <LiaCitySolid className="lucide lucide-building2 h-4 w-4 text-muted-foreground" />
        </div>
        <div className="p-6 pt-0">
          <div className="text-2xl font-bold">{data}</div>
          <p className="text-xs text-muted-foreground">{name}</p>
        </div>
      </div>
    </>
  );
};

export default CardHeader;
