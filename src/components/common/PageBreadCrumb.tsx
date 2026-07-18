import React from "react";
import { Link } from "react-router";

interface BreadcrumbProps {
  pageTitle: string;
  hideTitle?: boolean;
}

const PageBreadcrumb: React.FC<BreadcrumbProps> = ({ pageTitle, hideTitle }) => {
  const breadcrumbContent = (
    <div className="flex items-center gap-3 text-base text-gray-500 dark:text-gray-400 font-medium tracking-wide">
      <Link to="/" className="hover:text-brand-500 transition-colors">
        NeuroDiverse
      </Link>
      <span className="text-gray-400 dark:text-gray-500 text-sm font-normal">&gt;</span>
      <span>
        {pageTitle}
      </span>
    </div>
  );

  if (hideTitle) {
    return <div>{breadcrumbContent}</div>;
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
