export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="dash-board-header">
      <div className="dash-board-header-main">
        <h1 className="dash-board-title">{title}</h1>
        {description && <p className="dash-board-desc">{description}</p>}
      </div>
      {actions ? <div className="dash-board-header-actions">{actions}</div> : null}
    </header>
  );
}
