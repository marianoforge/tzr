import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface ExpenseData {
  date: string;
  amount: number;
  amountInDollars: number;
  otherType?: string;
  expenseType: string;
  description?: string;
  dollarRate: number;
}

export const useAddExpenseToAgent = (onSuccessCallback: () => void) => {
  const mutation = useMutation({
    mutationFn: async (data: { agentId: string; expense: ExpenseData }) => {
      const response = await axios.post(
        `/api/teamMembers/${data.agentId}/expenses`,
        data.expense
      );
      return response.data;
    },
    onSuccess: () => {
      onSuccessCallback();
    },
    onError: (error) => {
      console.error('Error adding expense to agent:', error);
    },
  });

  return mutation;
};
