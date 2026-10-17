import React, { useState } from 'react';
import {
  Send,
  X,
  CreditCard,
  Building2,
  User,
  ArrowRight,
  CheckCircle,
  Receipt,
  Share2,
  ShieldCheck,
  AlertTriangle,
  History,
  Phone,
  Sparkles,
} from 'lucide-react';
import { gameState } from '../game/gameState';
import { soundEngine } from '../audio/soundEngine';
import { TransferBeneficiary, BankTransferRecord } from '../types/game';

interface MoneyTransferModalProps {
  onClose: () => void;
  initialBeneficiaryId?: string;
  onTransferSuccess?: (record: BankTransferRecord, beneficiary?: TransferBeneficiary) => void;
}

export const NIGERIAN_BANKS = [
  { id: 'gtb', name: 'Guaranty Trust Bank (GTBank)', code: '058' },
  { id: 'opay', name: 'OPay Digital Services', code: '999992' },
  { id: 'palmpay', name: 'PalmPay Limited', code: '999991' },
  { id: 'kuda', name: 'Kuda Microfinance Bank', code: '50211' },
  { id: 'zenith', name: 'Zenith Bank PLC', code: '057' },
  { id: 'access', name: 'Access Bank', code: '044' },
  { id: 'uba', name: 'United Bank for Africa (UBA)', code: '033' },
  { id: 'firstbank', name: 'First Bank of Nigeria', code: '011' },
  { id: 'moniepoint', name: 'Moniepoint MFB', code: '50515' },
  { id: 'stanbic', name: 'Stanbic IBTC Bank', code: '221' },
];

export const PRESET_BENEFICIARIES: TransferBeneficiary[] = [
  {
    id: 'mama',
    name: 'Mama (Ibadan)',
    bankName: 'Guaranty Trust Bank',
    accountNumber: '0129482019',
    tag: 'Mother & Family Upkeep',
    avatarBg: 'bg-rose-600',
    category: 'family',
    suggestedAmounts: [5000, 10000, 20000, 50000],
    note: 'Sends love and blessings from home.',
    responseMessage:
      'Mama: "Oluwaseun! My dear child, God will continually bless your hustle in Lagos! The money just entered my GTBank. Eat well o!"',
    energyBonus: 25,
  },
  {
    id: 'tunde_mechanic',
    name: 'Tunde Mechanic (Ikeja)',
    bankName: 'Access Bank',
    accountNumber: '0038192841',
    tag: 'Car Service & Maintenance',
    avatarBg: 'bg-amber-600',
    category: 'artisan',
    suggestedAmounts: [3000, 8000, 15000, 25000],
    note: 'Toyota and Honda engine specialist.',
    responseMessage:
      'Tunde Mechanic: "Oga Chairman! Alert received sharply! Your vehicle suspension and brake pads are covered anytime you drive in."',
  },
  {
    id: 'baba_segun',
    name: 'Baba Segun (Security Guard)',
    bankName: 'OPay Digital',
    accountNumber: '8039281742',
    tag: 'Estate Compound Security',
    avatarBg: 'bg-emerald-600',
    category: 'artisan',
    suggestedAmounts: [1000, 2000, 5000],
    note: 'Gatekeeper at Ikeja GRA estate.',
    responseMessage:
      'Baba Segun: "Ah Chairman! God bless you sir! The estate gate is open for you day and night!"',
  },
  {
    id: 'tayo_colleague',
    name: 'Tayo (Desk Colleague - Dev)',
    bankName: 'Kuda Microfinance Bank',
    accountNumber: '2001928374',
    tag: 'PayLagos Workmate / Lunch Split',
    avatarBg: 'bg-sky-600',
    category: 'work',
    suggestedAmounts: [1500, 3000, 5000],
    note: 'Split amala bills and Uber rides.',
    responseMessage:
      'Tayo: "Alert confirmed bro! Thanks for clearing the lunch tab. Let us crush this afternoon sprint!"',
  },
  {
    id: 'funke_partner',
    name: 'Funke (Partner)',
    bankName: 'Zenith Bank',
    accountNumber: '2104829103',
    tag: 'Date Night & Shawarma Fund',
    avatarBg: 'bg-purple-600',
    category: 'family',
    suggestedAmounts: [5000, 12000, 25000],
    note: 'Always craving island shawarma.',
    responseMessage:
      'Funke: "Awww baby! Thank you so much! You are the sweetest guy in this entire Lagos city!"',
  },
  {
    id: 'phcn_nepa',
    name: 'EKEDC / PHCN Electric Meter',
    bankName: 'Moniepoint MFB',
    accountNumber: '4019284721',
    tag: 'Prepaid Token Recharge',
    avatarBg: 'bg-yellow-600',
    category: 'bills',
    suggestedAmounts: [3000, 5000, 10000],
    note: 'Generates 20-digit prepaid electric token.',
    responseMessage:
      'PHCN EKEDC: "Payment received. Prepaid Token: 4920-8192-3819-0193. 48.5 kWh loaded to your estate meter."',
  },
];

export const MoneyTransferModal: React.FC<MoneyTransferModalProps> = ({
  onClose,
  initialBeneficiaryId,
  onTransferSuccess,
}) => {
  const stats = gameState.getStats();

  const [mode, setMode] = useState<'quick' | 'custom' | 'history'>('quick');
  const [selectedBeneficiary, setSelectedBeneficiary] = useState<TransferBeneficiary | null>(
    initialBeneficiaryId ? PRESET_BENEFICIARIES.find((b) => b.id === initialBeneficiaryId) || null : null
  );

  // Custom Transfer Fields
  const [targetBank, setTargetBank] = useState(NIGERIAN_BANKS[0].name);
  const [accountNumber, setAccountNumber] = useState('');
  const [resolvedAccountName, setResolvedAccountName] = useState<string | null>(null);
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [narration, setNarration] = useState('');
  const [pinCode, setPinCode] = useState('1234');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Completed Receipt View
  const [activeReceipt, setActiveReceipt] = useState<BankTransferRecord | null>(null);

  // Simulate account lookup when 10 digits are typed
  const handleAccountChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 10);
    setAccountNumber(cleaned);
    if (cleaned.length === 10) {
      const names = [
        'CHUKWUEMEKA O. OKONKWO',
        'KUNLE ADELABU ENTERPRISES',
        'ZAINAB BELLO TRADING',
        'OLUWASEUN ADEKUNLE',
        'EMMANUEL OKECHUKWU',
      ];
      const name = names[parseInt(cleaned.slice(-1), 10) % names.length];
      setResolvedAccountName(name);
    } else {
      setResolvedAccountName(null);
    }
  };

  const handleExecuteTransfer = (
    recipientName: string,
    bankName: string,
    acctNum: string,
    amount: number,
    narr: string,
    beneficiaryRef?: TransferBeneficiary
  ) => {
    if (amount <= 0) {
      setErrorMsg('Please enter a valid transfer amount in Naira (₦)');
      return;
    }
    const fee = bankName.toLowerCase().includes('opay') || bankName.toLowerCase().includes('kuda') ? 0 : 10.75;
    if (stats.money < amount + fee) {
      setErrorMsg(`Insufficient balance. Required: ₦${(amount + fee).toLocaleString()}, Available: ₦${stats.money.toLocaleString()}`);
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    setTimeout(() => {
      setIsProcessing(false);
      const res = gameState.transferMoney(recipientName, bankName, acctNum, amount, narr, fee);

      if (res.success && res.record) {
        soundEngine.playCashSound();
        setActiveReceipt(res.record);

        // If family upkeep (Mama), boost energy & morale!
        if (beneficiaryRef?.energyBonus) {
          gameState.boostEnergy(beneficiaryRef.energyBonus);
        }

        if (onTransferSuccess) {
          onTransferSuccess(res.record, beneficiaryRef);
        }
      } else {
        setErrorMsg(res.message);
      }
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-amber-500/30 bg-zinc-950 text-white shadow-2xl">
        {/* GTBank Header */}
        <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-zinc-900 px-6 py-5 border-b border-amber-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500 text-zinc-950 font-black shadow-lg">
                GT
              </div>
              <div>
                <h2 className="text-base font-black tracking-wide text-white">GTWorld Naira Transfer</h2>
                <div className="flex items-center gap-2 text-xs text-amber-200 font-mono">
                  <span>Balance: ₦{stats.money.toLocaleString()}</span>
                  <span>•</span>
                  <span>TIER 3 SAVINGS</span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full bg-zinc-900/60 p-2 text-zinc-300 hover:bg-zinc-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        {!activeReceipt && (
          <div className="flex border-b border-zinc-800 bg-zinc-900/50 p-2 gap-1.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('quick');
                setErrorMsg(null);
              }}
              className={`flex-1 rounded-xl py-2 transition ${
                mode === 'quick' ? 'bg-amber-600 text-white shadow-xs' : 'text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              Saved Beneficiaries
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('custom');
                setErrorMsg(null);
              }}
              className={`flex-1 rounded-xl py-2 transition ${
                mode === 'custom' ? 'bg-amber-600 text-white shadow-xs' : 'text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              Send to Any Bank
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('history');
                setErrorMsg(null);
              }}
              className={`flex-1 rounded-xl py-2 transition ${
                mode === 'history' ? 'bg-amber-600 text-white shadow-xs' : 'text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              Receipts History
            </button>
          </div>
        )}

        {/* Body View */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* RECEIPT VIEW (When transfer completes) */}
          {activeReceipt ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-5 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-600 text-white">
                  <CheckCircle className="h-7 w-7" />
                </div>
                <h3 className="mt-2 text-base font-black text-white">Transfer Successful!</h3>
                <div className="font-mono text-2xl font-black text-emerald-400 mt-1">
                  ₦{activeReceipt.amount.toLocaleString()}
                </div>
                <div className="text-[11px] text-zinc-400 font-mono mt-0.5">
                  Ref: {activeReceipt.reference}
                </div>
              </div>

              {/* Official Receipt Breakdown */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4 space-y-2.5 text-xs font-mono">
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">Recipient Name</span>
                  <span className="font-bold text-white">{activeReceipt.recipientName}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">Destination Bank</span>
                  <span className="text-zinc-200">{activeReceipt.bankName}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">Account Number</span>
                  <span className="text-zinc-200">{activeReceipt.accountNumber}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">Transfer Fee</span>
                  <span className="text-zinc-200">₦{activeReceipt.fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-800 pb-2">
                  <span className="text-zinc-400">Narration</span>
                  <span className="text-zinc-200">{activeReceipt.narration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Transaction Time</span>
                  <span className="text-zinc-300">{activeReceipt.timestamp}</span>
                </div>
              </div>

              {/* Recipient Reaction Quote */}
              {selectedBeneficiary && (
                <div className="rounded-2xl border border-amber-500/30 bg-amber-950/30 p-3.5 text-xs text-amber-200">
                  <div className="font-bold text-white text-[11px] uppercase tracking-wider mb-1">
                    SMS Response Received:
                  </div>
                  <p className="italic">"{selectedBeneficiary.responseMessage}"</p>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveReceipt(null);
                    setSelectedBeneficiary(null);
                  }}
                  className="flex-1 rounded-xl border border-zinc-700 bg-zinc-800 py-3 text-xs font-bold text-white hover:bg-zinc-700 transition"
                >
                  Make Another Transfer
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl bg-amber-600 py-3 text-xs font-bold text-white hover:bg-amber-500 transition"
                >
                  Done
                </button>
              </div>
            </div>
          ) : mode === 'quick' ? (
            /* QUICK BENEFICIARIES LIST */
            <div className="space-y-4">
              {!selectedBeneficiary ? (
                <>
                  <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                    Select Contact / Beneficiary:
                  </div>
                  <div className="space-y-2">
                    {PRESET_BENEFICIARIES.map((b) => (
                      <div
                        key={b.id}
                        onClick={() => setSelectedBeneficiary(b)}
                        className="flex cursor-pointer items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/70 p-3.5 transition hover:border-amber-500 hover:bg-zinc-850"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-white shadow-md ${b.avatarBg}`}
                          >
                            {b.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-xs font-bold text-white">{b.name}</div>
                            <div className="text-[10px] text-zinc-400">
                              {b.bankName} • {b.accountNumber}
                            </div>
                            <div className="text-[10px] text-amber-400 font-semibold">{b.tag}</div>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-zinc-500" />
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* Selected Beneficiary Transfer Form */
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-bold text-white ${selectedBeneficiary.avatarBg}`}
                      >
                        {selectedBeneficiary.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white">{selectedBeneficiary.name}</div>
                        <div className="text-[10px] text-zinc-400">
                          {selectedBeneficiary.bankName} • {selectedBeneficiary.accountNumber}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedBeneficiary(null)}
                      className="text-xs font-semibold text-amber-400 hover:underline"
                    >
                      Change
                    </button>
                  </div>

                  {/* Preset Amount Chips */}
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Quick Amount:
                    </label>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {selectedBeneficiary.suggestedAmounts.map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setTransferAmount(amt.toString())}
                          className={`rounded-xl border py-2.5 text-xs font-mono font-bold transition ${
                            transferAmount === amt.toString()
                              ? 'border-amber-500 bg-amber-600 text-white'
                              : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                          }`}
                        >
                          ₦{amt.toLocaleString()}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Amount Input */}
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Or Enter Amount (₦):
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 5000"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      className="mt-1.5 w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 font-mono text-sm text-white focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Narration */}
                  <div>
                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                      Narration / Note:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. For food & support"
                      value={narration}
                      onChange={(e) => setNarration(e.target.value)}
                      className="mt-1.5 w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Security PIN Confirmation */}
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-white">4-Digit Security PIN</div>
                      <div className="text-[10px] text-zinc-400">Default Sandbox PIN: 1234</div>
                    </div>
                    <input
                      type="password"
                      maxLength={4}
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      className="w-20 rounded-xl bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-center font-mono text-sm tracking-widest text-white focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  {errorMsg && (
                    <div className="rounded-xl bg-red-950/80 border border-red-500/40 p-3 text-xs text-red-200">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={isProcessing || !transferAmount || Number(transferAmount) <= 0}
                    onClick={() =>
                      handleExecuteTransfer(
                        selectedBeneficiary.name,
                        selectedBeneficiary.bankName,
                        selectedBeneficiary.accountNumber,
                        Number(transferAmount),
                        narration || `Transfer to ${selectedBeneficiary.name}`,
                        selectedBeneficiary
                      )
                    }
                    className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-600 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-amber-500 transition disabled:opacity-40"
                  >
                    <Send className="h-4 w-4" />
                    {isProcessing ? 'Authorizing with NIBSS...' : `Send ₦${Number(transferAmount || 0).toLocaleString()} Now`}
                  </button>
                </div>
              )}
            </div>
          ) : mode === 'custom' ? (
            /* SEND TO ANY NIGERIAN BANK */
            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Select Recipient Bank:
                </label>
                <select
                  value={targetBank}
                  onChange={(e) => setTargetBank(e.target.value)}
                  className="mt-1.5 w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-xs text-white focus:border-amber-500 focus:outline-hidden"
                >
                  {NIGERIAN_BANKS.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  10-Digit NUBAN Account Number:
                </label>
                <input
                  type="text"
                  placeholder="e.g. 0123456789"
                  value={accountNumber}
                  onChange={(e) => handleAccountChange(e.target.value)}
                  className="mt-1.5 w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 font-mono text-sm text-white focus:border-amber-500 focus:outline-hidden"
                />
                {resolvedAccountName && (
                  <div className="mt-1.5 flex items-center gap-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 px-3 py-1.5 text-[11px] text-emerald-300 font-mono">
                    <CheckCircle className="h-3.5 w-3.5 shrink-0" />
                    <span>Verified: {resolvedAccountName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Amount to Send (₦):
                </label>
                <input
                  type="number"
                  placeholder="e.g. 10000"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="mt-1.5 w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 font-mono text-sm text-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Narration:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Lagos hustle payment"
                  value={narration}
                  onChange={(e) => setNarration(e.target.value)}
                  className="mt-1.5 w-full rounded-xl bg-zinc-900 border border-zinc-800 px-3.5 py-2 text-xs text-white focus:border-amber-500 focus:outline-hidden"
                />
              </div>

              {errorMsg && (
                <div className="rounded-xl bg-red-950/80 border border-red-500/40 p-3 text-xs text-red-200">
                  {errorMsg}
                </div>
              )}

              <button
                type="button"
                disabled={
                  isProcessing ||
                  accountNumber.length !== 10 ||
                  !transferAmount ||
                  Number(transferAmount) <= 0
                }
                onClick={() =>
                  handleExecuteTransfer(
                    resolvedAccountName || 'BENEFICIARY ACCOUNT',
                    targetBank,
                    accountNumber,
                    Number(transferAmount),
                    narration || 'Online Transfer'
                  )
                }
                className="w-full flex items-center justify-center gap-2 rounded-2xl bg-amber-600 py-3.5 text-xs font-bold text-white shadow-lg hover:bg-amber-500 transition disabled:opacity-40"
              >
                <Send className="h-4 w-4" />
                {isProcessing ? 'Processing Transaction...' : 'Transfer Funds Now'}
              </button>
            </div>
          ) : (
            /* TRANSACTION RECEIPTS HISTORY */
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Recent Outgoing Transfers:
              </div>
              {gameState.getTransferHistory().length > 0 ? (
                gameState.getTransferHistory().map((t: BankTransferRecord) => (
                  <div
                    key={t.id}
                    onClick={() => setActiveReceipt(t)}
                    className="flex cursor-pointer items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/80 p-3.5 transition hover:border-amber-500"
                  >
                    <div>
                      <div className="text-xs font-bold text-white">{t.recipientName}</div>
                      <div className="text-[10px] text-zinc-400">
                        {t.bankName} • {t.timestamp}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">Ref: {t.reference}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs font-black text-emerald-400">
                        -₦{t.amount.toLocaleString()}
                      </div>
                      <span className="rounded-md bg-emerald-950 px-1.5 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                        SUCCESSFUL
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 text-center text-xs text-zinc-500">
                  No transfers performed yet. Use "Saved Beneficiaries" or "Send to Any Bank" above to transfer money.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
