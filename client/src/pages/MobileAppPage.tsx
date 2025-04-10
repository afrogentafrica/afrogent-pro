import React from 'react';
import MobileApp from '@/components/mobile/MobileApp';

const MobileAppPage: React.FC = () => {
  return (
    <div className="container mx-auto py-4">
      <h1 className="text-2xl font-bold mb-4">AfroGents Mobile Experience</h1>
      <p className="text-gray-600 mb-6">
        This is a preview of the mobile booking experience for clients. 
        Stylists and services are pulled directly from the database.
      </p>
      <MobileApp />
    </div>
  );
};

export default MobileAppPage;