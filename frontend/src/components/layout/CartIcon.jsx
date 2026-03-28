// frontend/src/components/layout/CartIcon.jsx
// Drop this inside your Navbar component
import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function CartIcon() {
  const { itemCount } = useCart();
  return (
    <Link to="/cart" className="relative p-2 text-gray-600 hover:text-green-700 transition">
      <ShoppingCart size={22} />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center leading-none">
          {itemCount > 99 ? '99+' : itemCount}
        </span>
      )}
    </Link>
  );
}
