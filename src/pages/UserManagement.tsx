import React from 'react';
import UserManagement from '../components/admin/UserManagement';
import AdminDashboardLayout from '../components/AdminDashboardLayout';

const UserManagementPage: React.FC = () => {
  return (
    <AdminDashboardLayout>
      <UserManagement locations={[]} selectedLocation={null} />
    </AdminDashboardLayout>
  );
};

export default UserManagementPage; 