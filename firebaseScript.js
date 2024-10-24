const admin = require("firebase-admin");
const { format } = require("date-fns");

// Inicializar Firebase Admin SDK con tu servicio
const serviceAccount = require("./serviceAccKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

// ID del documento que quieres actualizar
const operationId = "0uE8Iz8sCzcXdSusAPjm"; // Cambia esto por el ID de la operación

const updateSingleDate = async () => {
  const docRef = db.collection("operations").doc(operationId); // Cambia por tu colección

  try {
    // Obtener el documento
    const docSnapshot = await docRef.get();

    if (!docSnapshot.exists) {
      console.log("No se encontró el documento.");
      return;
    }

    const data = docSnapshot.data();
    const oldDate = data.fecha_operacion; // Cambia el campo según tu documento

    if (oldDate instanceof admin.firestore.Timestamp) {
      // Convertir el timestamp a una fecha ISO y luego al formato YYYY-MM-DD
      const dateObject = oldDate.toDate();
      const formattedDate = format(dateObject, "yyyy-MM-dd");

      // Actualizar el campo de fecha en el documento
      await docRef.update({ fecha_operacion: formattedDate });
      console.log(`Fecha actualizada exitosamente a: ${formattedDate}`);
    } else {
      console.log("El campo no es un timestamp válido.");
    }
  } catch (error) {
    console.error("Error actualizando la fecha:", error);
  }
};

updateSingleDate();
