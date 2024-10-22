import { ReactNode } from "react";
import { useRouter } from "next/router"; // Importa useRouter de next/router
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
  const router = useRouter(); // Obtén el objeto router

  // Define la clase de margen superior basada en la ruta actual
  const marginTopClass = router.pathname.includes("dashboard")
    ? "mt-10"
    : "mt-20";

  return (
    <div className={`bg-white p-4 ${marginTopClass} rounded-xl shadow-md`}>
      {isLoading ? (
        <Loader />
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4 text-center">{title}</h2>
          {operationsLength === 0 ? (
            <p className="text-center ">No existen operaciones</p>
          ) : (
            children
          )}
        </>
      )}
    </div>
  );
};

export default OperationsContainer;
