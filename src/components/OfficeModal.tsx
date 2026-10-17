import React, { useState } from 'react';
import {
  Briefcase,
  X,
  CheckCircle,
  Clock,
  Zap,
  DollarSign,
  Coffee,
  AlertTriangle,
  Flame,
  MessageCircle,
  Play,
  LogOut,
  Power,
  Sparkles,
} from 'lucide-react';
import { gameState } from '../game/gameState';
import { soundEngine } from '../audio/soundEngine';

interface OfficeModalProps {
  onClose: () => void;
}

interface WorkTask {
  id: string;
  title: string;
  category: string;
  payout: number;
  energyCost: number;
  timeMins: number;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'High-Priority';
}

export const OfficeModal: React.FC<OfficeModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'tasks' | 'challenges' | 'breakroom' | 'colleagues'>('tasks');
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [inProgressTaskId, setInProgressTaskId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [standupStep, setStandupStep] = useState<number>(0);
  const [overtimeAccepted, setOvertimeAccepted] = useState<boolean>(false);
  const [clockOutSummary, setClockOutSummary] = useState<{ totalPayout: number; tasksCount: number } | null>(null);

  const stats = gameState.getStats();

  // Tasks definitions
  const tasks: WorkTask[] = [
    {
      id: 'task_nip',
      title: 'Audit NIP Interbank Settlement Discrepancies',
      category: 'Fintech Operations',
      payout: 14000,
      energyCost: 16,
      timeMins: 40,
      difficulty: 'Medium',
      description: 'Reconcile 1,420 pending mobile bank transfers between GTBank, Zenith and Access.',
    },
    {
      id: 'task_server',
      title: 'Mitigate High-Traffic Server Bottleneck',
      category: 'DevOps & Cloud',
      payout: 22000,
      energyCost: 22,
      timeMins: 55,
      difficulty: 'High-Priority',
      description: 'Scale up Kubernetes clusters to absorb midday shopping traffic surge from Tejuosho merchants.',
    },
    {
      id: 'task_pos',
      title: 'Resolve Balogun Merchant POS Dispute',
      category: 'Customer Escalations',
      payout: 12000,
      energyCost: 14,
      timeMins: 35,
      difficulty: 'Easy',
      description: 'Investigate duplicate debit of ₦85,000 for textile merchant at Balogun Market and issue instant reversal.',
    },
    {
      id: 'task_deck',
      title: 'Prepare Q3 Pan-African Remittance Slide Deck',
      category: 'Strategy & Growth',
      payout: 18000,
      energyCost: 18,
      timeMins: 45,
      difficulty: 'Medium',
      description: 'Finalize financial projections and cross-border remittance architecture for visiting Victoria Island investors.',
    },
  ];

  // Clock In handler
  const handleClockIn = () => {
    const result = gameState.clockInOffice();
    soundEngine.playCashSound();
    setFeedback(result.message);
  };

  // Clock Out handler
  const handleClockOut = () => {
    const summary = gameState.clockOutOffice();
    soundEngine.playCashSound();
    setClockOutSummary(summary);
    setFeedback(`Shift ended! Collected ₦${summary.totalPayout.toLocaleString()} in wages today.`);
  };

  // Execute task handler
  const handleStartTask = (task: WorkTask) => {
    if (!stats.isOnShift) {
      setFeedback('You must Clock In first to begin your shift and earn your salary!');
      return;
    }

    if (stats.energy < task.energyCost) {
      setFeedback('You are too exhausted! Visit the office break room for coffee or eat some hot Jollof.');
      return;
    }

    setInProgressTaskId(task.id);
    setFeedback(`Executing "${task.title}" on workstation...`);

    setTimeout(() => {
      gameState.completeWorkTask(task.title, task.payout);
      soundEngine.playCashSound();
      setCompletedTasks((prev) => [...prev, task.id]);
      setInProgressTaskId(null);
      setFeedback(`Completed: "${task.title}"! Earned ₦${task.payout.toLocaleString()}.`);
    }, 1200);
  };

  // Break room coffee
  const handleDrinkCoffee = () => {
    const success = gameState.officeCoffeeBreak();
    if (success) {
      soundEngine.playDoorSound();
      setFeedback('Sipped hot instant Nescafe! Restored +20 Energy.');
    } else {
      setFeedback('Your energy is already high!');
    }
  };

  // Break room snack
  const handleEatSnack = () => {
    const success = gameState.officePantrySnack();
    if (success) {
      soundEngine.playDoorSound();
      setFeedback('Munched on sweet plantain chips from the pantry! Hunger reduced by 25%.');
    } else {
      setFeedback('You are not hungry right now!');
    }
  };

  // Office generator toggle
  const handleToggleGenerator = () => {
    const newState = gameState.toggleOfficeGenerator();
    soundEngine.playDoorSound();
    if (newState === 'generator') {
      setFeedback('100KVA Perkins Diesel Generator roared to life! Full workstation power restored.');
    } else if (newState === 'grid') {
      setFeedback('NEPA mains power restored to Yaba Hub.');
    } else {
      setFeedback('Power outage! Office computers running on emergency backup.');
    }
  };

  // Standup meeting choices
  const handleStandupAnswer = (option: string) => {
    if (option === 'speed') {
      gameState.completeWorkTask('Fast-Track Feature Deployment', 10000);
      setFeedback('Oga Femi smiled: "Fast execution! The market waits for no one!" (+₦10,000)');
    } else {
      gameState.completeWorkTask('Rigorous Security QA Testing', 12000);
      setFeedback('Chioma from QA nodded: "Clean code prevents Lagos server outages!" (+₦12,000)');
    }
    setStandupStep(2);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative my-auto flex max-h-[92vh] w-full max-w-3xl flex-col rounded-3xl border-2 border-emerald-500/40 bg-zinc-950 text-white shadow-2xl overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-zinc-800 bg-emerald-950/40 px-5 py-3.5 gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md">
              <Briefcase className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white sm:text-xl">
                  PayLagos Tech Hub
                </h2>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    stats.isOnShift
                      ? 'bg-emerald-500 text-zinc-950 animate-pulse'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {stats.isOnShift ? 'ON SHIFT' : 'OFF SHIFT'}
                </span>
              </div>
              <p className="text-xs text-emerald-400/90 font-medium">
                Herbert Macaulay Way, Sabo Yaba • 09:00 AM Punctuality Target
              </p>
            </div>
          </div>

          {/* Right Controls: Shift Buttons & Close */}
          <div className="flex items-center gap-2">
            {!stats.isOnShift ? (
              <button
                onClick={handleClockIn}
                className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-black uppercase text-zinc-950 shadow-md hover:bg-emerald-400 transition"
              >
                <Play className="h-3.5 w-3.5 fill-zinc-950" />
                <span>Clock In</span>
              </button>
            ) : (
              <button
                onClick={handleClockOut}
                className="flex items-center gap-1.5 rounded-xl bg-red-600/90 px-3.5 py-2 text-xs font-black uppercase text-white shadow-md hover:bg-red-500 transition"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Clock Out</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="rounded-xl bg-zinc-900 p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Feedback / Alert Banner */}
        {feedback && (
          <div className="flex items-center justify-between border-b border-emerald-500/30 bg-emerald-950/70 px-5 py-2 text-xs font-semibold text-emerald-200">
            <span>{feedback}</span>
            <button onClick={() => setFeedback(null)} className="text-emerald-400 hover:text-white">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Shift Stats Ribbon */}
        <div className="grid grid-cols-2 gap-2 border-b border-zinc-800 bg-zinc-900/60 px-5 py-2.5 text-xs sm:grid-cols-4">
          <div className="rounded-xl bg-zinc-900/90 p-2 text-center border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Shift Earnings</span>
            <div className="font-mono text-sm font-black text-emerald-400">
              ₦{stats.shiftEarnings.toLocaleString()}
            </div>
          </div>
          <div className="rounded-xl bg-zinc-900/90 p-2 text-center border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Tasks Submitted</span>
            <div className="font-mono text-sm font-black text-white">
              {stats.shiftTasksCompleted}
            </div>
          </div>
          <div className="rounded-xl bg-zinc-900/90 p-2 text-center border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Energy Level</span>
            <div className="font-mono text-sm font-black text-sky-400">
              {Math.round(stats.energy)}%
            </div>
          </div>
          <div className="rounded-xl bg-zinc-900/90 p-2 text-center border border-zinc-800">
            <span className="text-[10px] uppercase font-bold text-zinc-400">Office Power</span>
            <div className="font-mono text-sm font-black text-amber-400 uppercase">
              {stats.officePowerState}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/40 px-5 gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`border-b-2 py-3 px-3 transition ${
              activeTab === 'tasks'
                ? 'border-emerald-500 text-emerald-300 font-bold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Work Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveTab('challenges')}
            className={`border-b-2 py-3 px-3 transition ${
              activeTab === 'challenges'
                ? 'border-emerald-500 text-emerald-300 font-bold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Office Challenges
          </button>
          <button
            onClick={() => setActiveTab('breakroom')}
            className={`border-b-2 py-3 px-3 transition ${
              activeTab === 'breakroom'
                ? 'border-emerald-500 text-emerald-300 font-bold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Break Room & Pantry
          </button>
          <button
            onClick={() => setActiveTab('colleagues')}
            className={`border-b-2 py-3 px-3 transition ${
              activeTab === 'colleagues'
                ? 'border-emerald-500 text-emerald-300 font-bold'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Team Standup Meeting
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* TAB 1: WORK TASKS */}
          {activeTab === 'tasks' && (
            <div className="space-y-3">
              {!stats.isOnShift && (
                <div className="flex items-center justify-between rounded-2xl border border-amber-500/40 bg-amber-950/20 p-4 text-xs text-amber-200">
                  <div>
                    <span className="font-bold">You are currently Off Shift.</span> Clock in above to start today's shift and log deliverables.
                  </div>
                  <button
                    onClick={handleClockIn}
                    className="shrink-0 rounded-lg bg-amber-500 px-3 py-1.5 font-bold text-zinc-950 hover:bg-amber-400 transition"
                  >
                    Clock In Now
                  </button>
                </div>
              )}

              {tasks.map((task) => {
                const isDone = completedTasks.includes(task.id);
                const isRunning = inProgressTaskId === task.id;

                return (
                  <div
                    key={task.id}
                    className={`flex flex-col justify-between gap-3 rounded-2xl border p-4 transition sm:flex-row sm:items-center ${
                      isDone
                        ? 'border-emerald-900/50 bg-emerald-950/20 opacity-80'
                        : 'border-zinc-800 bg-zinc-900/60 hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-zinc-100 text-sm">{task.title}</h4>
                        <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                          {task.category}
                        </span>
                        <span
                          className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                            task.difficulty === 'High-Priority'
                              ? 'bg-red-950 text-red-300 border border-red-500/30'
                              : 'bg-zinc-800 text-zinc-300'
                          }`}
                        >
                          {task.difficulty}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                        {task.description}
                      </p>
                      <div className="mt-2 flex items-center gap-4 text-xs font-medium text-zinc-400">
                        <span className="flex items-center gap-1 text-sky-400">
                          <Zap className="h-3.5 w-3.5" /> -{task.energyCost}% Energy
                        </span>
                        <span className="flex items-center gap-1 text-zinc-400">
                          <Clock className="h-3.5 w-3.5" /> ~{task.timeMins} mins
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                      <div className="font-mono text-base font-black text-emerald-400">
                        +₦{task.payout.toLocaleString()}
                      </div>
                      {isDone ? (
                        <span className="flex items-center gap-1 rounded-xl bg-emerald-900/60 px-3 py-1.5 text-xs font-bold text-emerald-300">
                          <CheckCircle className="h-3.5 w-3.5" /> Submitted
                        </span>
                      ) : (
                        <button
                          onClick={() => handleStartTask(task)}
                          disabled={isRunning || !stats.isOnShift}
                          className="flex items-center gap-1 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-40"
                        >
                          {isRunning ? 'Processing...' : 'Execute Task'}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 2: OFFICE CHALLENGES */}
          {activeTab === 'challenges' && (
            <div className="space-y-4">
              {/* Challenge 1: Generator / NEPA */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Power className="h-5 w-5 text-amber-400" />
                    <h4 className="font-bold text-white text-sm">Yaba Power Grid Status</h4>
                  </div>
                  <span className="font-mono text-xs font-bold text-amber-400 uppercase">
                    Status: {stats.officePowerState}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  Lagos power fluctuations can interrupt server syncing. Switch between NEPA mains, the central Perkins soundproof generator, and emergency inverters.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleToggleGenerator}
                    className="rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-zinc-950 hover:bg-amber-400 transition"
                  >
                    Toggle Office Generator / Power
                  </button>
                </div>
              </div>

              {/* Challenge 2: Overtime Client Request */}
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-4">
                <div className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-red-400" />
                  <h4 className="font-bold text-white text-sm">Urgent Client Escalation (Overtime)</h4>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  A high-volume fintech client in Victoria Island demands an emergency security hotfix before close of business.
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    disabled={overtimeAccepted}
                    onClick={() => {
                      setOvertimeAccepted(true);
                      gameState.completeWorkTask('Emergency Client Hotfix', 25000);
                      soundEngine.playCashSound();
                      setFeedback('Overtime hotfix deployed successfully! Earned +₦25,000 bonus.');
                    }}
                    className="rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-500 transition disabled:opacity-40"
                  >
                    {overtimeAccepted ? 'Overtime Completed' : 'Accept Overtime (+₦25,000)'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: BREAK ROOM */}
          {activeTab === 'breakroom' && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-600/20 text-amber-400 border border-amber-500/30">
                  <Coffee className="h-6 w-6" />
                </div>
                <h4 className="mt-3 font-bold text-white">Instant Coffee Dispenser</h4>
                <p className="mt-1 text-xs text-zinc-400">
                  Rich Nescafe blend with sweetened milk. Replenishes mental clarity for demanding software assignments.
                </p>
                <button
                  onClick={handleDrinkCoffee}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-amber-600 py-2.5 text-xs font-bold text-white hover:bg-amber-500 transition"
                >
                  <Coffee className="h-4 w-4" />
                  <span>Drink Coffee (+20 Energy)</span>
                </button>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
                  <Sparkles className="h-6 w-6" />
                </div>
                <h4 className="mt-3 font-bold text-white">Office Pantry Canteen</h4>
                <p className="mt-1 text-xs text-zinc-400">
                  Fresh Agege bread slices, crunchy plantain chips, and bottled water for on-duty developers.
                </p>
                <button
                  onClick={handleEatSnack}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-500 transition"
                >
                  <span>Grab Pantry Snack (-25% Hunger)</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: TEAM STANDUP */}
          {activeTab === 'colleagues' && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-emerald-400" />
                <h4 className="font-bold text-white">Morning Engineering Standup (Yaba Team)</h4>
              </div>
              <p className="mt-1 text-xs text-zinc-400">
                Oga Femi (Engineering Lead) stands by the whiteboard with Tayo (Frontend) and Chioma (QA).
              </p>

              {standupStep === 0 && (
                <div className="mt-4 space-y-3">
                  <div className="rounded-xl bg-zinc-800/80 p-3 text-xs text-zinc-200">
                    <span className="font-bold text-emerald-400">Oga Femi:</span> "Team, our Lagos interbank gateway is experiencing higher transaction volumes today. How should we prioritize this sprint?"
                  </div>
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleStandupAnswer('speed')}
                      className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-left text-xs font-medium text-white hover:border-emerald-500 hover:bg-zinc-700 transition"
                    >
                      Option A: "Deploy fast caching immediately to keep payments lightning fast!"
                    </button>
                    <button
                      onClick={() => handleStandupAnswer('quality')}
                      className="rounded-xl border border-zinc-700 bg-zinc-800 p-3 text-left text-xs font-medium text-white hover:border-emerald-500 hover:bg-zinc-700 transition"
                    >
                      Option B: "Run thorough regression tests on Access and GTBank connectors first to prevent duplicate debits."
                    </button>
                  </div>
                </div>
              )}

              {standupStep === 2 && (
                <div className="mt-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 p-4 text-xs text-emerald-200">
                  Standup completed! Your input was highly appreciated by leadership. You received compensation for your contribution.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Clock Out Payslip Summary Card */}
        {clockOutSummary && (
          <div className="border-t border-zinc-800 bg-zinc-950 p-4 text-xs">
            <div className="flex items-center justify-between font-bold text-white">
              <span>Daily Shift Payslip Generated:</span>
              <span className="font-mono text-emerald-400">
                Total Credited: ₦{clockOutSummary.totalPayout.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
