interface FlagProps {
  code: string;
  className?: string;
}

export function Flag({ code, className }: FlagProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/${code.toLowerCase()}.svg`}
      alt={`${code} flag`}
      className={className}
      loading="lazy"
    />
  );
}
