import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface SkeletonLoaderProps {
  height?: number;
  count?: number;
  width?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  height = "",
  count = 10,
  width = "",
}) => {
  return <Skeleton height={height} count={count} width={width} />;
};

export default SkeletonLoader;
