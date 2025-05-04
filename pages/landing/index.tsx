import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Head from 'next/head';

const LandingPage = () => {
  return (
    <div className="flex flex-col w-full min-h-screen">
      <Head>
        <title>RealtorTrackPro - Gestión inmobiliaria profesional</title>
        <meta
          name="description"
          content="RealtorTrackPro, solución para gestionar operaciones inmobiliarias"
        />
      </Head>

      {/* Hero Section */}
      <section className="text-white relative flex flex-col text-center sm:text-center md:text-start gap-8 md:flex-row w-full pb-16 pt-16 sm:pb-32 sm:pt-24 md:pb-48 md:pt-20 items-center justify-center bg-gradient-to-r from-mediumBlue via-lightBlue to-darkBlue">
        <div className="flex flex-col justify-center w-full px-4 sm:px-8 md:px-16 text-white">
          <div className="flex justify-center items-center w-full">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium mt-2 text-center">
              Gestioná tus operaciones inmobiliarias como un profesional
            </h1>
          </div>
          <div className="flex flex-col justify-center items-center w-full">
            <h3 className="text-base sm:text-xl text-center mt-8">
              Con RealtorTrackPro, organizá tus propiedades, operaciones y
              finanzas en un solo lugar. Optimización real para asesores
              inmobiliarios.
            </h3>
            <Link href="/register">
              <button className="w-[220px] px-4 mt-10 sm:px-4 py-3 sm:py-3 text-md sm:text-md font-bold rounded-full bg-white text-mediumBlue hover:bg-opacity-90 transition-all">
                Empieza Gratis
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 w-full">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-16">
            ¿Por qué RealtorTrackPro?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: 'Organización Total',
                description:
                  'Controlá todas tus operaciones y propiedades en una sola plataforma.',
                delay: 0.1,
              },
              {
                title: 'Optimización Financiera',
                description:
                  'Gestioná tus ingresos, egresos y resultados con reportes claros y automáticos.',
                delay: 0.3,
              },
              {
                title: 'Acceso Desde Cualquier Lugar',
                description:
                  'Usá la app desde tu computadora o celular, estés donde estés.',
                delay: 0.5,
              },
              {
                title: 'Fácil de Usar',
                description:
                  'Interfaz simple e intuitiva. Aprendé rápido con nuestros tutoriales.',
                delay: 0.7,
              },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-lg p-6 h-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: benefit.delay }}
              >
                <h3 className="text-xl font-bold mb-4 text-mediumBlue">
                  {benefit.title}
                </h3>
                <p className="text-gray-700">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50 w-full">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Tu trabajo inmobiliario, simplificado en 3 pasos
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-center gap-8 mb-12">
            {[
              {
                step: '1',
                description: 'Registrate gratis en RealtorTrackPro.',
                delay: 0.1,
              },
              {
                step: '2',
                description: 'Cargá tus propiedades y operaciones.',
                delay: 0.3,
              },
              {
                step: '3',
                description: 'Gestioná tus finanzas y seguí tu crecimiento.',
                delay: 0.5,
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                className="bg-white rounded-xl shadow-lg p-8 text-center w-full md:w-1/3"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: step.delay }}
              >
                <div className="w-12 h-12 bg-mediumBlue text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                  {step.step}
                </div>
                <p className="text-gray-700">{step.description}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <Link href="/register">
              <button className="px-8 py-3 text-md font-bold rounded-full bg-mediumBlue text-white hover:bg-opacity-90 transition-all">
                Crear mi cuenta
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-mediumBlue via-lightBlue to-darkBlue text-white w-full">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Empieza hoy a trabajar de forma más inteligente
          </h2>
          <p className="text-xl mb-10 max-w-2xl mx-auto">
            Crecé tu negocio inmobiliario con las herramientas correctas. Prueba
            RealtorTrackPro.
          </p>
          <Link href="/register">
            <button className="px-8 py-4 text-lg font-bold rounded-full bg-white text-mediumBlue hover:bg-opacity-90 transition-all">
              Quiero Empezar
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
