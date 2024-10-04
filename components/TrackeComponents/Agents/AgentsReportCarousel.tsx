import React from "react";
import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import useUsersWithOperations from "@/hooks/useUserWithOperations";
import Loader from "../Loader";
import { UserData } from "@/types";

const AgentsReportCarousel = ({ currentUser }: { currentUser: UserData }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };
  const { data, loading, error } = useUsersWithOperations(currentUser);

  if (loading) {
    return <Loader />; // Usar el componente Loader
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <>
      <Slider {...settings}>
        {data.map((usuario) => (
          <div key={usuario.uid} className="p-4 expense-card">
            <div className="bg-[#5DADE2]/10 text-[#2E86C1] p-4 rounded-xl shadow-md flex justify-center space-x-4 h-[300px] min-h-[300px] max-h-[300px]">
              <div className="space-y-2 sm:space-y-4 flex flex-col justify-around">
                <p>
                  <strong>Nombre:</strong> {usuario.firstName}{" "}
                  {usuario.lastName}
                </p>
                <p>
                  <strong>Email:</strong> {usuario.email}
                </p>
                <p>
                  <strong>Total Facturacion Bruta:</strong>{" "}
                  {usuario.operaciones.length > 0 ? (
                    `$${usuario.operaciones.reduce(
                      (acc, op) => acc + op.honorarios_asesor,
                      0
                    )}`
                  ) : (
                    <span>No operations</span>
                  )}
                </p>
                <p>
                  <strong>Cantidad de Operaciones:</strong>{" "}
                  {usuario.operaciones.length > 0 ? (
                    usuario.operaciones.length
                  ) : (
                    <span>No operations</span>
                  )}
                </p>
                <p>
                  <strong>Puntas Compradoras:</strong>{" "}
                  {usuario.operaciones.reduce(
                    (acc, op) => acc + (op.punta_compradora ? 1 : 0),
                    0
                  )}
                </p>
                <p>
                  <strong>Puntas Vendedora:</strong>{" "}
                  {usuario.operaciones.reduce(
                    (acc, op) => acc + (op.punta_vendedora ? 1 : 0),
                    0
                  )}
                </p>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </>
  );
};

export default AgentsReportCarousel;
