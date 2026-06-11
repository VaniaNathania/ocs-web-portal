const SectionTitle = ({
  title,
  className = "",
}: {
  title: string;
  className?: string;
}) => (
  <div className={`flex items-center gap-2 ${className}`}>
    <div className="h-5 w-2 rounded-sm bg-primary" />
    <div>{title}</div>
  </div>
);

export default SectionTitle;
