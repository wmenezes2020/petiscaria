
interface CategoryPillProps {
  name: string;
  // We can add color variants later if needed
}

export function CategoryPill({ name }: CategoryPillProps) {
  return (
    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
      {name}
    </span>
  );
}
