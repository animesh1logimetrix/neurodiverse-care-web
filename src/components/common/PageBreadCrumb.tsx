import React from "react";
import { Link } from "react-router";

interface BreadcrumbProps {
  pageTitle: string;
  hideTitle?: boolean;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle, hideTitle }) => {
  const breadcrumbContent = (
    <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
      <Link to="/" className="text-gray-400 dark:text-gray-500 hover:text-brand-500 transition-colors">
        NeuroDiverse
      </Link>
      <span className="text-gray-400 dark:text-gray-500">&gt;</span>
      <span className="text-gray-700 dark:text-gray-300 font-semibold">
        {pageTitle}
      </span>
    </div>
  );

  if (hideTitle) {
    return <div className="mb-2">{breadcrumbContent}</div>;
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
      <h2
        className="text-xl font-semibold text-gray-800 dark:text-white/90"
        x-text="pageName"
      >
        {pageTitle}
      </h2>
      <nav>
        {breadcrumbContent}
      </nav>
    </div>
  );
};

export default PageBreadcrumb;
