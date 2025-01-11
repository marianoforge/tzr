import axios from 'axios';

export const fetchAgentExpenses = async (ids: string) => {
  const response = await axios.get(
    `/api/teamMembers/${ids}/expenses?ids=${ids}`
  );
  return response.data.usersWithExpenses;
};
