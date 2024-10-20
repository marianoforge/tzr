import { useEffect, useState } from "react";

interface UserData {
  trialEndsAt: any; // Adjust the type based on your actual data structure
}

const useTrialDaysLeft = (userData: UserData | null) => {
  const [daysLeft, setDaysLeft] = useState<number | null>(null);

  useEffect(() => {
    if (userData && userData.trialEndsAt) {
      console.log(
        "Valor de trialEndsAt desde Firestore:",
        userData.trialEndsAt
      );

      let trialEndDate: Date | null = null;

      if ("toDate" in userData.trialEndsAt) {
        trialEndDate = userData.trialEndsAt.toDate();
        console.log(
          "trialEndsAt convertido a Date:",
          trialEndDate?.toISOString() || "null"
        );
      } else if (userData.trialEndsAt instanceof Date) {
        trialEndDate = userData.trialEndsAt;
        console.log(
          "trialEndsAt ya es un objeto Date:",
          trialEndDate.toISOString()
        );
      } else if (typeof userData.trialEndsAt === "string") {
        trialEndDate = new Date(userData.trialEndsAt);
        console.log(
          "trialEndsAt como string convertido a Date:",
          trialEndDate.toISOString()
        );
      }

      if (trialEndDate && !isNaN(trialEndDate.getTime())) {
        const currentDate = new Date();
        const timeDiff = trialEndDate.getTime() - currentDate.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        setDaysLeft(daysDiff >= 0 ? daysDiff : 0);
      } else {
        console.error("Fecha de trialEndDate inválida o null:", trialEndDate);
      }
    } else {
      console.error("userData o trialEndsAt no disponible");
    }
  }, [userData]);

  return daysLeft;
};

export default useTrialDaysLeft;
