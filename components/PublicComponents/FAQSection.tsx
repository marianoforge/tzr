const FAQSection = () => {
  return (
    <section className="relative flex flex-col  items-center justify-center w-full">
      <div className="flex flex-col justify-around items-center mb-[120px] mt-32">
        <h3 className="text-sm text-gray-400 font-bold">
          PREGUNTAS FRECUENTES
        </h3>
        <h1 className="text-5xl mt-2 font-semibold">Te sacamos las dudas</h1>
      </div>
      <div className="flex flex-col gap-4 w-1/3">
        <h3 className="text-sm text-gray-400 font-bold">
          ¿Qué medidas de seguridad existen para proteger los datos de los
          usuarios?
        </h3>
        <h1 className="text-sm mt-2 font-semibold">
          La seguridad de tus datos es nuestra máxima prioridad, lo cual es
          irónico si consideramos que en el mundo inmobiliario a veces se pasa
          por alto la privacidad. Para evitar que nuestros clientes se muden,
          por así decirlo, a otra plataforma o que terminemos figurando en los
          titulares por un desastre de datos, utilizamos métodos de seguridad
          robustos: cifrado de datos, centros de datos ultra-seguros y
          auditorías regulares para asegurarnos de que todo permanezca a salvo.
          Ni tus cifras ni tus secretos inmobiliarios saldrán por la puerta sin
          tu permiso.
        </h1>
      </div>
    </section>
  );
};

export default FAQSection;
