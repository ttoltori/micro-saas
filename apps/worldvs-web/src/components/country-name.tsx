import { Flag } from "./flag";

interface CountryNameProps {
  code: string;
  name: string;
  className?: string;
  flagClassName?: string;
  nameClassName?: string;
}

export function CountryName({
  code,
  name,
  className,
  flagClassName,
  nameClassName,
}: CountryNameProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className ?? ""}`}>
      <Flag
        code={code}
        className={flagClassName ?? "w-5 h-3.5 rounded-[2px] object-cover shrink-0"}
      />
      <span className={nameClassName}>{name}</span>
    </span>
  );
}
