import React from 'react';
import Level0Nav from "../Level0Nav/Level0Nav";

import { UserInfoForm } from '../../organisms/UserInfoForm/UserInfoForm';
import { PageHeader } from '../../atoms/PageHeader/PageHeader';
import { User, Users } from 'lucide-react';




const UserInfoEntry: React.FC = () => {
  return (
    <>
      <Level0Nav />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-9xl mx-auto">
          <PageHeader
            title="Create Your Profile"
            subtitle="We need a few details to get started"
            icon={<User className="h-5 w-5 text-gray-400" />}         
          />

          <UserInfoForm />
        </div>
      </div>
    </>
  );
};

export default UserInfoEntry;