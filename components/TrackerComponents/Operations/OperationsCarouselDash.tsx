import React from 'react';

import OperationsCarousel from './OperationsCarousel';

export type FilterType = 'all' | 'open' | 'closed' | 'currentYear' | 'year2023';

const OperationsCarouselDash: React.FC = () => {
  return (
    <div className="bg-white p-6 mt-10 lg:mt-20 rounded-xl shadow-md pb-10 ">
      <OperationsCarousel />
    </div>
  );
};

export default OperationsCarouselDash;
