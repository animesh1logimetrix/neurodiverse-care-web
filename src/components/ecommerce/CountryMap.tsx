// Map visualization currently replaced with placeholder
// Note: @react-jvectormap causes Webpack CSS loader issues in Vite

interface CountryMapProps {
  mapColor?: string;
}

const CountryMap: React.FC<CountryMapProps> = () => {
  return (
    <div className="flex h-full min-h-[300px] w-full items-center justify-center rounded-xl bg-gray-50/50 dark:bg-gray-800/10">
      <div className="flex flex-col items-center justify-center space-y-3 text-center px-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          World Map visualization has been disabled.<br/>
          <span className="text-xs opacity-75">(@react-jvectormap is incompatible with Vite)</span>
        </p>
      </div>
    </div>
  );
};

export default CountryMap;
