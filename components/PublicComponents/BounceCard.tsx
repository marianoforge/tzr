import { motion } from 'framer-motion';
import React from 'react';
import Image from 'next/image';

interface BounceCardProps {
  title: React.ReactNode; // Change from string to React.ReactNode
  description: string;
  delay: number; // Añadir delay como prop
}

const BounceCard: React.FC<BounceCardProps> = ({
  title,
  description,
  delay,
}) => {
  return (
    <motion.div
      className="card"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 3,
        ease: [0, 0.71, 0.2, 1.01],
        scale: {
          type: 'spring',
          damping: 5,
          stiffness: 80,
          restDelta: 0.001,
        },
        delay: delay,
      }}
    >
      <div className="bg-white p-10 shadow-lg w-[500px] text-center rounded-xl flex flex-row items-center justify-center">
        <div className="icon w-[20%]">
          <Image
            src="/tpLogo.png"
            alt="Logo"
            width={150}
            height={150}
            className="w-16 h-14"
          />
        </div>
        <div className="flex flex-col justify-center w-[80%]">
          <h3>{title}</h3>
          <p>{description}</p>
        </div>
      </div>
    </motion.div>
  );
};
// .card {
//   background-color: white;
//   border-radius: 8px;
//   padding: 20px;
//   box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
//   width: 300px;
//   text-align: center;
// }
export default BounceCard;
