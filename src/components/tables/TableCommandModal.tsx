'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  TableResponse,
  CommandOrderResponse,
  CustomerResponse,
  getCustomers,
  openTableCommand,
  closeTableCommand,
  getOrder,
  CreateOrderPayload,
  OrderStatus,
} from '@/lib/api';
import { Loader2, Users, Clock, UserCircle, Table as TableIcon, X, CheckCircle2, Ban, PlusCircle, Wallet } from 'lucide-react';
import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { AddItemsModal } from './AddItemsModal';

interface TableCommandModalProps {
  table: TableResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => Promise<void> | void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
};

export function TableCommandModal({ table, isOpen, onClose, onRefresh }: TableCommandModalProps) {
  const [localTable, setLocalTable] = useState<TableResponse | null>(table);
  const [order, setOrder] = useState<CommandOrderResponse | null>(null);
  const [customers, setCustomers] = useState<CustomerResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [openForm, setOpenForm] = useState({ numberOfPeople: 1, customerId: '', notes: '' });
  const [closeNotes, setCloseNotes] = useState('');
  const [cancelReason, setCancelReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showCancelSection, setShowCancelSection] = useState(false);
  const [isAddItemsOpen, setIsAddItemsOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'cash' | 'pix' | 'credit_card'>('cash');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const paymentMethodLabels: Record<string, string> = {
    cash: 'Dinheiro',
    pix: 'PIX',
    credit_card: 'Cartão',
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setLocalTable(table);
    setError(null);
    setCloseNotes('');
    setCancelReason('');
    setShowCancelSection(false);

    const fetchCustomersAndOrder = async () => {
      try {
        setIsLoading(true);
        const [customersData, orderData] = await Promise.all([
          getCustomers().catch((err) => {
            console.error('Erro ao carregar clientes:', err);
            return [] as CustomerResponse[];
          }),
          table?.status === 'occupied' && table.currentOrderId
            ? getOrder(table.currentOrderId).catch((err) => {
                console.error('Erro ao carregar comanda da mesa:', err);
                return null;
              })
            : Promise.resolve(null),
        ]);

        setCustomers(Array.isArray(customersData) ? customersData : []);
        setOrder(orderData);

        setOpenForm({
          numberOfPeople: table?.currentCustomerCount || table?.capacity || 1,
          customerId: '',
          notes: '',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomersAndOrder();
  }, [isOpen, table]);

  const tableStatus = localTable?.status ?? table?.status ?? 'available';
  const canOpenCommand = tableStatus === 'available' || tableStatus === 'reserved';
  const hasActiveCommand = tableStatus === 'occupied' && (localTable?.currentOrderId || table?.currentOrderId);

  const handleOpenCommand = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!localTable) return;

    try {
      setIsSaving(true);
      setError(null);
      const payload = {
        numberOfPeople: openForm.numberOfPeople,
        customerId: openForm.customerId || undefined,
        notes: openForm.notes || undefined,
      };
      const response = await openTableCommand(localTable.id, payload);
      setOrder(response.order);
      setLocalTable(response.table);
      await onRefresh();
    } catch (err: any) {
      console.error('Erro ao abrir comanda:', err);
      const message = err?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(', ') : message || 'Não foi possível abrir a comanda.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleItemsAdded = async () => {
    if (!localTable?.currentOrderId) return;
    const updatedOrder = await getOrder(localTable.currentOrderId);
    setOrder(updatedOrder);
    await onRefresh();
  };

  const handleCloseCommand = async (
    status: 'closed' | 'cancelled',
    options?: { paymentMethod?: 'cash' | 'pix' | 'credit_card'; paymentAmount?: number },
  ) => {
    if (!localTable) return;

    if (status === 'cancelled' && !cancelReason.trim()) {
      setError('Informe o motivo do cancelamento.');
      return;
    }

    if (status === 'closed' && (!options || !options.paymentMethod)) {
      setError('Selecione o método de pagamento.');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const response = await closeTableCommand(localTable.id, {
        status,
        notes: closeNotes || undefined,
        cancellationReason: status === 'cancelled' ? cancelReason : undefined,
        registerPayment: status === 'closed',
        paymentMethod: options?.paymentMethod,
        paymentAmount: options?.paymentAmount,
      });
      setOrder(response.order);
      setLocalTable(response.table);
      await onRefresh();
      if (status === 'closed') {
        const paymentInfo = response.payment;
        if (paymentInfo) {
          const methodLabel = paymentMethodLabels[paymentInfo.paymentMethod as keyof typeof paymentMethodLabels] || paymentInfo.paymentMethod;
          const amountFormatted = formatCurrency(paymentInfo.amount);
          setSuccessMessage(`Comanda finalizada. Pagamento ${methodLabel} no valor de ${amountFormatted} registrado.`);
        } else {
          setSuccessMessage('Comanda finalizada e pagamento registrado com sucesso.');
        }
        setIsPaymentModalOpen(false);
      } else {
        onClose();
      }
      setCloseNotes('');
      setCancelReason('');
    } catch (err: any) {
      console.error('Erro ao encerrar comanda:', err);
      const message = err?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(', ') : message || 'Não foi possível encerrar a comanda.');
    } finally {
      setIsSaving(false);
    }
  };

  const orderTotalItems = useMemo(() => {
    if (!order) return 0;
    return order.orderItems.reduce((total, item) => total + item.quantity, 0);
  }, [order]);

  const totalConsumed = useMemo(() => {
    if (!order) return 0;
    return order.orderItems.reduce((sum, item) => sum + (Number(item.totalPrice ?? 0)), 0);
  }, [order]);

  useEffect(() => {
    if (order) {
      setPaymentAmount(totalConsumed);
    }
  }, [order, totalConsumed]);

  useEffect(() => {
    if (!isOpen) {
      setSuccessMessage(null);
      setIsPaymentModalOpen(false);
    }
  }, [isOpen]);

  if (!isOpen || !localTable) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Mesa {localTable.name}</h3>
            <p className="text-sm text-gray-500">Status atual: {tableStatus === 'available' ? 'Livre' : tableStatus === 'occupied' ? 'Ocupada' : tableStatus === 'reserved' ? 'Reservada' : 'Indisponível'}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {error && (
            <div className="mx-6 mt-4 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 py-4">
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Clientes na mesa</p>
                  <p className="text-lg font-semibold text-gray-900">{localTable.currentCustomerCount ?? '-'}</p>
                </div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                  <Clock className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Abertura</p>
                  <p className="text-sm font-medium text-gray-900">{formatDateTime(localTable.openedAt)}</p>
                </div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                  <TableIcon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Capacidade</p>
                  <p className="text-lg font-semibold text-gray-900">{localTable.capacity} lugares</p>
                </div>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-indigo-500" />
              <p className="ml-3 text-sm text-gray-600">Carregando informações da mesa...</p>
            </div>
          ) : (
            <div className="px-6 pb-6 space-y-6">
              {canOpenCommand && (
                <form onSubmit={handleOpenCommand} className="card p-5 space-y-4 border-indigo-100">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Abrir comanda</h4>
                    <p className="text-sm text-gray-500">Informe a quantidade de pessoas e, se desejar, vincule a um cliente.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Número de pessoas</label>
                      <input
                        type="number"
                        min={1}
                        value={openForm.numberOfPeople}
                        onChange={(event) => setOpenForm((prev) => ({ ...prev, numberOfPeople: Number(event.target.value) || 1 }))}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="input-label">Cliente (opcional)</label>
                      <select
                        value={openForm.customerId}
                        onChange={(event) => setOpenForm((prev) => ({ ...prev, customerId: event.target.value }))}
                        className="input-field"
                      >
                        <option value="">Balcão / Avulso</option>
                        {customers.map((customer) => (
                          <option key={customer.id} value={customer.id}>
                            {customer.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="input-label">Observações</label>
                    <textarea
                      value={openForm.notes}
                      onChange={(event) => setOpenForm((prev) => ({ ...prev, notes: event.target.value }))}
                      rows={2}
                      className="input-field"
                      placeholder="Observações importantes para esta comanda..."
                    />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" disabled={isSaving} className="btn-primary">
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Abrir comanda'}
                    </button>
                  </div>
                </form>
              )}

              {successMessage && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4">
                  {successMessage}
                </div>
              )}

              {hasActiveCommand && order && (
                <div className="space-y-6">
                  <div className="card p-5 border-green-100">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Comanda #{order.id.slice(0, 8)}</h4>
                        <p className="text-sm text-gray-500">Total consumido: {formatCurrency(totalConsumed)}</p>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => setIsAddItemsOpen(true)}
                          className="btn-secondary inline-flex items-center gap-2"
                        >
                          <PlusCircle className="h-4 w-4" /> Adicionar itens
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPaymentMethod('cash');
                            setPaymentAmount(totalConsumed);
                            setIsPaymentModalOpen(true);
                          }}
                          className="btn-primary inline-flex items-center gap-2"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Finalizar comanda
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowCancelSection((prev) => !prev)}
                          className="btn-ghost inline-flex items-center gap-2 text-red-600 hover:text-red-700"
                        >
                          <Ban className="h-4 w-4" /> Cancelar
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-400" />
                        <span>{order.numberOfPeople} pessoas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <UserCircle className="h-4 w-4 text-gray-400" />
                        <span>{order.customer?.name ?? 'Cliente avulso'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>Itens: {orderTotalItems}</span>
                      </div>
                    </div>

                    {showCancelSection && (
                      <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                        <div>
                          <label className="input-label">Motivo do cancelamento</label>
                          <textarea
                            rows={2}
                            value={cancelReason}
                            onChange={(event) => setCancelReason(event.target.value)}
                            className="input-field"
                            placeholder="Descreva o motivo do cancelamento..."
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 pr-3">
                            <label className="input-label">Observações adicionais</label>
                            <textarea
                              rows={2}
                              value={closeNotes}
                              onChange={(event) => setCloseNotes(event.target.value)}
                              className="input-field"
                              placeholder="Informações adicionais para registro interno"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCloseCommand('cancelled')}
                            disabled={isSaving}
                            className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors h-fit disabled:opacity-60"
                          >
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar cancelamento'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="card">
                    <div className="px-5 py-4 border-b border-gray-100">
                      <h4 className="text-lg font-semibold text-gray-900">Itens consumidos</h4>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {order.orderItems.length === 0 ? (
                        <p className="px-5 py-4 text-sm text-gray-500">Nenhum item adicionado até o momento.</p>
                      ) : (
                        order.orderItems.map((item) => (
                          <div key={item.id} className="px-5 py-4 flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{item.productName}</p>
                              <p className="text-sm text-gray-500">{item.quantity} x {formatCurrency(item.unitPrice)}</p>
                              {item.notes && <p className="text-xs text-gray-400 mt-1">Obs: {item.notes}</p>}
                            </div>
                            <div className="text-sm font-semibold text-gray-900">{formatCurrency(item.totalPrice)}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
          <button onClick={onClose} className="btn-secondary">
            Fechar
          </button>
        </div>
      </div>

      {localTable && order && (
        <AddItemsModal
          isOpen={isAddItemsOpen}
          tableId={localTable.id}
          onClose={() => setIsAddItemsOpen(false)}
          onItemsAdded={handleItemsAdded}
        />
      )}

      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Registrar pagamento</h3>
                  <p className="text-sm text-gray-500">Informe método e valor recebido.</p>
                </div>
              </div>
              <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                handleCloseCommand('closed', { paymentMethod: selectedPaymentMethod, paymentAmount });
              }}
              className="space-y-4"
            >
              <div>
                <label className="input-label">Método de pagamento</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                  {[
                    { value: 'cash', label: 'Dinheiro' },
                    { value: 'pix', label: 'PIX' },
                    { value: 'credit_card', label: 'Cartão' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSelectedPaymentMethod(option.value as 'cash' | 'pix' | 'credit_card')}
                      className={`px-4 py-2 rounded-xl border text-sm font-semibold transition ${selectedPaymentMethod === option.value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 text-gray-600 hover:border-indigo-200 hover:text-indigo-600'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="input-label">Valor recebido (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min={0}
                  value={paymentAmount}
                  onChange={(event) => setPaymentAmount(Number(event.target.value))}
                  className="input-field"
                />
                <p className="text-xs text-gray-500 mt-1">Total consumido: {formatCurrency(totalConsumed)}</p>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setIsPaymentModalOpen(false)} className="btn-secondary">
                  Voltar
                </button>
                <button type="submit" disabled={isSaving} className="btn-primary">
                  {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar pagamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

