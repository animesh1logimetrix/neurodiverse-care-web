import React from 'react';
import PageMeta from '../../components/common/PageMeta';

const ParentDashboard: React.FC = () => {
  return (
    <>
      <PageMeta
        title="Parent Dashboard | NeuroCare"
        description="Parent and Guardian Dashboard for NeuroCare"
      />
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Parent / Guardian Dashboard</h1>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <p className="text-gray-600 dark:text-gray-300">
            Welcome to the Parent Dashboard. Here you can view updates, therapy logs, and track your child's progress.
          </p>
        </div>
      </div>
    </>
  );
};

export default ParentDashboard;
