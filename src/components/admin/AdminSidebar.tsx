import type { FC } from 'react';
import { Link } from 'react-router-dom';

interface AdminSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isSuperAdmin: boolean;
}

const AdminSidebar: FC<AdminSidebarProps> = ({
  isOpen,
  onToggle,
  activeTab,
  onTabChange,
  isSuperAdmin
}) => {
  const navigationItems = [
    { name: 'Overview', icon: 'bx-grid-alt', tab: 'overview' },
    { name: 'Vouchers', icon: 'bx-barcode', tab: 'vouchers' },
    { name: 'Users', icon: 'bx-user', tab: 'users' },
    { name: 'Support Tickets', icon: 'bx-message-square-detail', tab: 'tickets' },
    ...(isSuperAdmin ? [{ name: 'Locations', icon: 'bx-map', tab: 'locations' }] : [])
  ];

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-800 text-white transition-transform duration-300 ease-in-out transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center justify-center h-16 px-4 bg-gray-900">
          <img src="/assets/CT-logo.png" alt="Logo" className="h-8 w-auto" />
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => onTabChange(item.tab)}
              className={`flex items-center px-4 py-2 text-sm font-medium rounded-md w-full transition-colors ${
                activeTab === item.tab
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <i className={`bx ${item.icon} mr-3 text-lg`}></i>
              {item.name}
            </button>
          ))}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="bx bx-user-circle text-2xl text-gray-300"></i>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-white">Admin User</p>
              <p className="text-xs text-gray-300">{isSuperAdmin ? 'Super Admin' : 'Admin'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar; 