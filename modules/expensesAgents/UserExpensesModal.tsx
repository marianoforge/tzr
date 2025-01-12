import React, { useState } from 'react';
import { TrashIcon } from '@heroicons/react/24/outline';

import ModalDelete from '@/components/PrivateComponente/CommonComponents/Modal';
import { ModalProps, Expense } from '@/common/types';
import { formatDate } from '@/common/utils/formatDate';
import { formatNumber } from '@/common/utils/formatNumber';

interface UserExpensesModalProps extends ModalProps {
  expenses: Expense[];
  currencySymbol: string;
  onDeleteExpense: (expenseId: string, agentId: string) => void;
  agentId: string;
}

const UserExpensesModal: React.FC<UserExpensesModalProps> = ({
  isOpen,
  onClose,
  expenses,
  currencySymbol,
  onDeleteExpense,
  agentId,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState<string | null>(
    null
  );

  const openDeleteModal = (expenseId: string) => {
    setSelectedExpenseId(expenseId);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedExpenseId(null);
  };

  const confirmDelete = () => {
    if (selectedExpenseId) {
      onDeleteExpense(selectedExpenseId, agentId);
      closeDeleteModal();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg text-center font-bold w-[800px] h-auto flex flex-col justify-center items-center">
        <h2 className="text-2xl mb-4">Detalles de Gastos</h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-lightBlue/10 text-center text-sm">
              <th className="py-3 px-4 font-semibold">Fecha</th>
              <th className="py-3 px-4 font-semibold">Descripción</th>
              <th className="py-3 px-4 font-semibold">Monto en ARS</th>
              <th className="py-3 px-4 font-semibold">Monto en USD</th>
              <th className="py-3 px-4 font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="border-b text-center">
                <td className="py-3 px-4">{formatDate(expense.date)}</td>
                <td className="py-3 px-4">{expense.description}</td>
                <td className="py-3 px-4">
                  {currencySymbol}
                  {formatNumber(expense.amount)}
                </td>
                <td className="py-3 px-4">
                  {currencySymbol}
                  {formatNumber(expense.amountInDollars)}
                </td>
                <td className="py-3 px-4">
                  <button
                    onClick={() => openDeleteModal(expense.id || '')}
                    className="text-red-500 hover:text-red-700"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={onClose}
          className="bg-mediumBlue text-white p-2 rounded hover:bg-lightBlue transition-all duration-300 font-bold mt-4"
        >
          Cerrar
        </button>
      </div>

      <ModalDelete
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        message="¿Estás seguro de querer eliminar este gasto?"
        onSecondButtonClick={confirmDelete}
        secondButtonText="Borrar Operación"
        className="w-[450px]"
      />
    </div>
  );
};

export default UserExpensesModal;
