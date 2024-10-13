import { ReactNode } from "react";
import Loader from "../Loader";

interface OperationsContainerProps {
  isLoading: boolean;
  title: string;
  operationsLength: number;
  children: ReactNode;
}

const OperationsContainer: React.FC<OperationsContainerProps> = ({
  isLoading,
  title,
  operationsLength,
  children,
}) => {
  return (
    <div className="bg-white p-4 mt-20 rounded-xl shadow-md">
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>
          {operationsLength === 0 ? (
            <p className="text-center text-gray-600">No existen operaciones</p>
          ) : (
            children
          )}
        </>
      )}
    </div>
  );
};

export default OperationsContainer;
