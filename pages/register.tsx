import RegisterForm from '@/components/PrivateComponente/RegisterForm';
import { useEffect } from 'react';

const Register = () => {
  useEffect(() => {
    console.log(
      'selectedPriceId en localStorage al cargar register.tsx:',
      localStorage.getItem('selectedPriceId')
    );
  }, []);
  return (
    <div>
      <RegisterForm />
    </div>
  );
};

export default Register;
