// rewardful.d.ts
declare global {
  interface Window {
    rewardful?: {
      (event: string, callback?: () => void): void;
      referral?: string;
    };
  }
}

export {};
