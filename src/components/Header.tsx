import React from 'react';
import { Shield, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <Shield size={32} />
          <span className="text-xl font-bold mr-2">لوحة تحكم الحماية المدنية الجزائرية</span>
        </Link>
        <nav>
          <ul className="flex space-x-4 items-center">
            {user && (
              <>
                <li><Link to="/" className="hover:underline">اللوحة العامة</Link></li>
                <li><Link to="/wilayas" className="hover:underline">لوحات الولايات</Link></li>
                <li>
                  <button
                    onClick={logout}
                    className="flex items-center space-x-1 hover:underline"
                  >
                    <LogOut size={18} />
                    <span className="mr-1">تسجيل الخروج</span>
                  </button>
                </li>
              </>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;