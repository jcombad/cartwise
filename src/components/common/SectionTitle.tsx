type SectionTitleProps = {
  title: string;
  subtitle?: string;
};

export function SectionTitle({
  title,
  subtitle,
}: SectionTitleProps) {
  return (
    <div className="space-y-1">
      <h2 className="text-xl font-bold tracking-tight">
        {title}
      </h2>

      {subtitle && (
        <p className="text-sm text-muted-foreground">
          {subtitle}
        </p>
      )}
    </div>
  );
}