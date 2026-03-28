/ frontend/src/components/common/EmptyState.jsx
// Reusable empty state for cart, orders, search, etc.
import { Link } from 'react-router-dom';

export default function EmptyState({ icon: Icon, title, description, actionLabel, actionTo }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      {Icon && <Icon size={48} className="text-gray-300 mb-4" strokeWidth={1.5} />}
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      {description && <p className="text-gray-400 text-sm mb-6 max-w-xs">{description}</p>}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm hover:bg-green-700 transition">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
