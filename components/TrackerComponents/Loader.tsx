import React from 'react';

interface LoadingStateProps {
  message?: string;
}

const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading...',
}) => {
  return (
    <div className="flex flex-col justify-center items-center h-64 bg-transparent px-5 py-8 rounded-xl min-h-[374px]">
      <div className="loader mb-4"></div>
      <p className="text-lg font-semibold">{message}</p>
    </div>
  );
};

export default LoadingState;
