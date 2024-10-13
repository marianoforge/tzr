import React from "react";
import Slider from "react-slick";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import useUsersWithOperations from "@/hooks/useUserWithOperations";
import Loader from "../Loader";
import { UserData } from "@/types";
import { formatNumber } from "@/utils/formatNumber";

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

  const honorariosBrokerTotales = data.reduce((acc, usuario) => {
    return (
      acc +
      usuario.operaciones.reduce((sum, op) => sum + op.honorarios_broker, 0)
    );
  }, 0);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  return (
    <>
      <Slider {...settings}>
        {data.map((usuario) => (
          <div key={usuario.uid} className="p-4 expense-card">
            <div className="bg-mediumBlue text-lightPink p-4 rounded-xl shadow-md flex justify-center space-x-4 h-auto min-h-[300px]">
              <div className="space-y-2 sm:space-y-4 flex flex-col w-[100%]">
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
                  <strong>Aporte a la Facturación Bruta</strong>{" "}
                  {usuario.operaciones.length > 0 ? (
                    <ul>
                      <li>
                        {formatNumber(
                          (usuario.operaciones.reduce(
                            (acc, op) => acc + op.honorarios_broker,
                            0
                          ) *
                            100) /
                            honorariosBrokerTotales
                        )}
                        %
                      </li>
                    </ul>
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
                  <strong>Puntas Vendedoras:</strong>{" "}
                  {usuario.operaciones.reduce(
                    (acc, op) => acc + (op.punta_vendedora ? 1 : 0),
                    0
                  )}
                </p>
                <p>
                  <strong>Puntas totales:</strong>{" "}
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
