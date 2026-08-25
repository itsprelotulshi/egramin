import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { HoldingDepositRequest, HoldingWithdrawRequest } from '../../types';
import { StatusBadge, PriorityBadge, DeletionPendingBadge } from '../common/Badge';
import {
  WalletCards,
  ArrowDownRight,
  ArrowUpRight,
  Info,
  Plus,
  Download,
  Building,
  CheckCircle2,
  Clock,
  FileText,
  ShieldCheck,
  Search,
  ExternalLink
} from 'lucide-react';

export const HoldingRequestsView: React.FC = () => {
  const {
    requests,
    setActiveRequest,
    openCreateModal,
    triggerExportCSV,
    permissions,
  } = useApp();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'deposits' | 'withdrawals'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Visible requests for current user
  const userVisibleReqs = requests.filter(
    r => (user.role !== 'client' || r.clientId === user.id) && (r.type === 'deposit' || r.type === 'withdraw')
  );

  const deposits = userVisibleReqs.filter(r => r.type === 'deposit') as HoldingDepositRequest[];
  const withdrawals = userVisibleReqs.filter(r => r.type === 'withdraw') as HoldingWithdrawRequest[];

  const totalDepositUSD = deposits.reduce((acc, c) => acc + (c.amount || 0), 0);
  const totalWithdrawUSD = withdrawals.reduce((acc, c) => acc + (c.amount || 0), 0);
  const pendingCount = userVisibleReqs.filter(r => r.status === 'pending').length;

  const displayList = userVisibleReqs
    .filter(r => {
      if (activeTab === 'deposits') return r.type === 'deposit';
      if (activeTab === 'withdrawals') return r.type === 'withdraw';
      return true;
    })
    .filter(r => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        r.ticketNumber.toLowerCase().includes(q) ||
        r.clientName.toLowerCase().includes(q) ||
        r.title.toLowerCase().includes(q) ||
        (r.type === 'deposit' && (r as HoldingDepositRequest).transactionReferenceId.toLowerCase().includes(q)) ||
        (r.type === 'withdraw' && (r as HoldingWithdrawRequest).beneficiaryAccountNumberOrAddress.toLowerCase().includes(q))
      );
    });

  const canCreate = user?.role === 'client' && (permissions[user?.role || 'client']?.canCreateRequest ?? true);

  return (
    <div id="holding-requests-view" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400">
              <WalletCards className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Limit (Holding) Update
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Limit (Holding) fulfillment queue for client holding accounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {canCreate && (
            <div className="flex items-center gap-2">
              <button
                id="log-deposit-slip-btn"
                onClick={() => openCreateModal('deposit')}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all active:scale-98"
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>Deposit Update</span>
              </button>

              <button
                id="request-withdraw-btn"
                onClick={() => openCreateModal('withdraw')}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all active:scale-98"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Withdraw Request</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeTab === 'all'
              ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            All Limit Requests ({userVisibleReqs.length})
          </button>
          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'deposits'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            Deposits ({deposits.length})
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${activeTab === 'withdrawals'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400'
              }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            Withdrawals ({withdrawals.length})
          </button>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search wire ref, amount, client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Holding Requests List */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-2">
        {displayList.map(item => {
          const isDeposit = item.type === 'deposit';
          const dep = item as HoldingDepositRequest;
          const wdr = item as HoldingWithdrawRequest;

          return (
            <div
              key={item.id}
              onClick={() => setActiveRequest(item)}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className=''>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {item.ticketNumber}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${isDeposit
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        }`}
                    >
                      {isDeposit ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
                      {isDeposit ? 'Deposit Update' : 'Withdrawal'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.deleteRequested && <DeletionPendingBadge />}
                    <StatusBadge status={item.status} />
                  </div>
                </div>
                <div className='grid grid-cols-2 gap-2'>
                  <div>
                    <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                      {isDeposit ? dep.currency : wdr.currency} {(isDeposit ? dep.amount : wdr.amount)?.toLocaleString()}
                    </div>

                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {item.description}
                    </div>
                  </div>

                  {/* Proof & Reference detail */}
                  <div className="p-2.5 rounded-xl text-xs space-y-1">
                    {isDeposit ? (
                      <>
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                          <span className="text-slate-400">Method:</span>
                          <span className="font-semibold capitalize">{dep.depositMethod?.replace('_', ' ')}</span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
                          <span className="text-slate-400">Wire Ref / TxID:</span>
                          <span className="font-mono font-medium truncate max-w-45">{dep.transactionReferenceId}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-end gap-1 text-slate-600 dark:text-slate-300">
                          <span className="text-slate-400">Beneficiary:</span>
                          <span className="font-semibold truncate max-w-45">{wdr.beneficiaryAccountName}</span>
                        </div>
                        <div className="flex items-center justify-end gap-1 text-slate-600 dark:text-slate-300">
                          <span className="text-slate-400">Account/IBAN:</span>
                          <span className="font-mono font-medium truncate max-w-45">{wdr.beneficiaryAccountNumberOrAddress}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-1 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium text-slate-600 dark:text-slate-300 truncate max-w-37.5">
                  {item.clientName} ({item.clientCompany || 'Client'})
                </span>
                <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline">
                  Inspect Proof <ExternalLink className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
