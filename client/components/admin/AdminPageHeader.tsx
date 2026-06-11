const AdminPageHeader = ({
  title,
  action,
}: {
  title: string;
  action?: React.ReactNode;
}) => {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <h1 className="text-2xl font-bold text-secondary-500">{title}</h1>
      {action}
    </div>
  );
};

export default AdminPageHeader;
