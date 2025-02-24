import { useAuthStore } from '@/stores/authStore';

const DownloadOperations = () => {
  const { getAuthToken } = useAuthStore();

  const handleDownload = async () => {
    try {
      const token = await getAuthToken();
      if (!token) throw new Error('Usuario no autenticado');

      const res = await fetch('/api/operations/export', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Error descargando el archivo');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'operaciones.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('❌ Error al descargar operaciones:', error);
    }
  };

  return (
    <button
      onClick={handleDownload}
      className="bg-blue-500 text-white px-4 py-2 rounded"
    >
      Descargar Operaciones en Excel
    </button>
  );
};

export default DownloadOperations;
