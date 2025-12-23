import React, { useState, useEffect } from 'react';
import { Wallet, Plus, ArrowUpRight, History, CreditCard, Smartphone, Loader2, CheckCircle2, X } from 'lucide-react';
import { authService } from '../services/authService';
import { dataService } from '../services/dataService';
import { User } from '../types';

interface WalletWidgetProps {
  user: User;
  onBalanceUpdate: (user: User) => void;
}

const WalletWidget: React.FC<WalletWidgetProps> = ({ user, onBalanceUpdate }) => {

  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('500');
  const [transferAmount, setTransferAmount] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [provider, setProvider] = useState<'TELEBIRR' | 'CBE' | 'CHAPA'>('TELEBIRR');
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, [user.id, user.wallet_balance]);

  const handleTransfer = async () => {
    if (!user || !receiverPhone || !transferAmount) return;
    setIsLoading(true);
    try {
      const res = await dataService.transferFunds({
        senderId: Number(user.id),
        receiverPhone,
        amount: Number(transferAmount)
      });

      if (res.success) {
        setIsSuccess(true);
        onBalanceUpdate(res.user);
        fetchTransactions();
        setReceiverPhone('');
        setTransferAmount('');
        setTimeout(() => {
          setIsSuccess(false);
          setIsTransferOpen(false);
        }, 2000);
      } else {
        alert(res.error || 'Transfer failed');
      }
    } catch (error) {
      alert('Internal error');
    } finally {
      setIsLoading(false);
    }
  };



  const fetchTransactions = async () => {
    if (!user) return;
    const res = await dataService.getWalletTransactions(Number(user.id));
    if (res.success) {
      setTransactions(res.transactions || []);
    }
  };

  const handleTopUp = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      if (provider === 'CHAPA' || provider === 'TELEBIRR' || provider === 'CBE') {
        const res = await dataService.initializeChapaPayment({
          userId: Number(user.id),
          amount: Number(topUpAmount),
          fullName: user.full_name,
          email: user.email
        });

        if (res.success && res.checkout_url) {
          // Redirect to Chapa checkout
          window.location.href = res.checkout_url;
        } else {
          alert(res.error || 'Payment initialization failed');
        }
      } else {
        // Fallback or Mock
        const res = await dataService.simulatePayment(Number(user.id), Number(topUpAmount), provider);
        if (res.success) {
          setIsSuccess(true);
          onBalanceUpdate(res.user);
          fetchTransactions();
          setTimeout(() => {
            setIsSuccess(false);
            setIsTopUpOpen(false);
          }, 2000);
        }
      }
    } catch (error) {
      alert('Internal error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleActivate = async () => {
    setIsLoading(true);
    try {
      const res = await authService.activateWallet(user.id);
      if (res.success && res.user) {
        onBalanceUpdate(res.user);
      } else {
        alert('Activation failed. Please try again.');
      }
    } catch (err) {
      alert('Network error during activation');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  // Activation Screen
  if (!user.is_activated) {
    return (
      <div className="absolute top-16 right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
        <div className="bg-gradient-to-br from-[#00843D] to-[#006B31] p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -top-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-white/30 backdrop-blur-md">
              <Wallet size={32} className="text-[#FCDD09]" />
            </div>
            <h3 className="text-xl font-bold mb-1">Activate Your Wallet</h3>
            <p className="text-xs text-green-100 opacity-80">Setup your Afta wallet to start ordering and earn rewards.</p>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={12} className="text-[#00843D]" />
              </div>
              <p className="text-xs text-gray-600 font-medium">Get 1,000 ETB Welcome Bonus</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={12} className="text-[#00843D]" />
              </div>
              <p className="text-xs text-gray-600 font-medium">Quick Telebirr & CBE Integration</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 w-5 h-5 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 size={12} className="text-[#00843D]" />
              </div>
              <p className="text-xs text-gray-600 font-medium">Instant Cashbacks on Orders</p>
            </div>
          </div>
          <button
            onClick={handleActivate}
            disabled={isLoading}
            className="w-full py-3.5 bg-[#00843D] text-white rounded-xl font-bold hover:bg-[#006B31] transition-all shadow-lg shadow-green-500/20 active:scale-95 flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Activate Now (Free)'}
          </button>
          <p className="text-[10px] text-center text-gray-400">By activating, you agree to Afta Payment terms.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="absolute top-16 right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-5">

      <div className="bg-[#00843D] p-4 text-white relative overflow-hidden">
        {/* Decorative circle */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>

        <div className="flex justify-between items-center mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-1.5 rounded-lg">
              <Wallet size={16} className="text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider opacity-90">Afta Wallet</span>
          </div>
          <span className="bg-[#FCDD09] text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full">Verified Account</span>
        </div>

        <div className="text-3xl font-bold mb-1 relative z-10">
          {user.wallet_balance.toLocaleString()} <span className="text-sm font-normal opacity-80">ETB</span>
        </div>
        <div className="text-xs text-green-100 flex items-center gap-1 relative z-10">
          <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
          Balance is synchronised
        </div>
      </div>

      <div className="p-3 bg-gray-50 border-b border-gray-100">
        {!isTopUpOpen && !isTransferOpen ? (
          <div className="grid grid-cols-2 gap-3 mb-2">
            <button
              onClick={() => setIsTopUpOpen(true)}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-white hover:border-[#00843D] hover:text-[#00843D] transition-all shadow-sm group"
            >
              <Plus size={16} className="text-gray-400 group-hover:text-[#00843D]" /> Top Up
            </button>
            <button
              onClick={() => setIsTransferOpen(true)}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-white hover:border-[#00843D] hover:text-[#00843D] transition-all shadow-sm group"
            >
              <ArrowUpRight size={16} className="text-gray-400 group-hover:text-[#00843D]" /> Transfer
            </button>
          </div>
        ) : isTopUpOpen ? (
          <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase">Select Amount</span>
              <button
                onClick={() => {
                  setIsTopUpOpen(false);
                  setIsSuccess(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {['100', '500', '1000'].map(amt => (
                <button
                  key={amt}
                  onClick={() => setTopUpAmount(amt)}
                  className={`py-1.5 px-2 rounded-md text-xs font-bold transition-all ${topUpAmount === amt
                    ? 'bg-[#00843D] text-white shadow-md'
                    : 'bg-white border border-gray-200 text-gray-600 hover:border-[#00843D]'
                    }`}
                >
                  {amt} ETB
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">ETB</span>
              <input
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#00843D] outline-none"
                placeholder="Custom Amount"
              />
            </div>

            <div className="space-y-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase">Payment Method</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setProvider('CHAPA')}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${provider === 'CHAPA' ? 'border-[#00843D] bg-green-50' : 'border-gray-100 hover:border-gray-200'
                    }`}
                >
                  <CreditCard size={14} className={provider === 'CHAPA' ? 'text-[#00843D]' : 'text-gray-400'} />
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-gray-700">Chapa</p>
                    <p className="text-[8px] text-gray-500 whitespace-nowrap">Telebirr, CBE, Cards</p>
                  </div>
                </button>
                <button
                  onClick={() => setProvider('TELEBIRR')}
                  className={`flex items-center gap-2 p-2 rounded-lg border transition-all ${provider === 'TELEBIRR' ? 'border-[#00843D] bg-green-50' : 'border-gray-100 hover:border-gray-200'
                    }`}
                >
                  <Smartphone size={14} className={provider === 'TELEBIRR' ? 'text-[#00843D]' : 'text-gray-400'} />
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-gray-700">Direct</p>
                    <p className="text-[8px] text-gray-500">Telebirr / CBE Birr</p>
                  </div>
                </button>
              </div>
            </div>

            {isSuccess ? (
              <div className="py-2.5 bg-green-50 text-[#00843D] rounded-lg text-center flex items-center justify-center gap-2 font-bold text-sm">
                <CheckCircle2 size={16} /> Success!
              </div>
            ) : (
              <button
                onClick={handleTopUp}
                disabled={isLoading || !topUpAmount || Number(topUpAmount) <= 0}
                className="w-full py-2.5 bg-[#00843D] text-white rounded-lg text-sm font-bold hover:bg-[#006B31] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
              >
                {isLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <>
                    <Plus size={16} />
                    {provider === 'CHAPA' ? 'Pay with Chapa' : provider === 'TELEBIRR' ? 'Pay with Telebirr' : 'Pay with CBE'}
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-gray-500 uppercase">Transfer Funds</span>
              <button
                onClick={() => {
                  setIsTransferOpen(false);
                  setIsSuccess(false);
                  setReceiverPhone('');
                  setTransferAmount('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={14} />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Receiver Phone</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                  <input
                    type="text"
                    value={receiverPhone}
                    onChange={(e) => setReceiverPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#00843D] outline-none"
                    placeholder="0911..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Amount</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">ETB</span>
                  <input
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-1 focus:ring-[#00843D] outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              {isSuccess ? (
                <div className="py-2.5 bg-green-50 text-[#00843D] rounded-lg text-center flex items-center justify-center gap-2 font-bold text-sm">
                  <CheckCircle2 size={16} /> Transfer Sent!
                </div>
              ) : (
                <button
                  onClick={handleTransfer}
                  disabled={isLoading || !receiverPhone || !transferAmount || Number(transferAmount) <= 0}
                  className="w-full py-2.5 bg-[#00843D] text-white rounded-lg text-sm font-bold hover:bg-[#006B31] transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                >
                  {isLoading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <>
                      <ArrowUpRight size={16} /> Send Money
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Payment Provider Explainer */}
      {!isTopUpOpen && !isTransferOpen && (
        <div className="flex justify-center items-center gap-3 text-[10px] text-gray-500 bg-white/50 p-1.5 rounded-md mt-2">
          <span className="font-semibold">Secured by Chapa:</span>
          <div className="flex gap-2 opacity-80">
            <span className="flex items-center gap-1 font-bold text-yellow-600">Telebirr</span>
            <span className="flex items-center gap-1 font-bold text-purple-700">CBE Birr</span>
            <span className="flex items-center gap-1 font-bold text-blue-600">CBE</span>
          </div>
        </div>
      )}



      <div className="p-4 max-h-[300px] overflow-y-auto">
        <div className="flex justify-between items-center mb-3 sticky top-0 bg-white z-10 pb-1">
          <span className="text-xs font-bold text-gray-500 uppercase">Recent Activity</span>
          <button className="text-[#00843D] text-xs font-bold hover:underline">View All</button>
        </div>
        <div className="space-y-3">
          {transactions.length > 0 ? (
            transactions.map((txn, i) => (
              <div key={i} className="flex justify-between items-center group cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors border-l-2 border-transparent hover:border-[#00843D]">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${txn.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                    {txn.amount > 0 ? <Plus size={14} /> : <CreditCard size={14} />}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 truncate max-w-[140px]">{txn.description}</p>
                    <p className="text-[10px] text-gray-500">{new Date(txn.created_at).toLocaleString()}</p>
                  </div>
                </div>
                <span className={`text-sm font-bold ${txn.amount > 0 ? 'text-[#00843D]' : 'text-gray-900'}`}>
                  {txn.amount > 0 ? '+' : ''}{txn.amount.toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <div className="text-center py-6">
              <History size={32} className="mx-auto text-gray-200 mb-2" />
              <p className="text-xs text-gray-400">No transactions yet</p>
            </div>
          )}
        </div>
      </div>
    </div>

  );
};


export default WalletWidget;