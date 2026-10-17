import React, { useState } from 'react';
import {
  Smartphone,
  X,
  MessageSquare,
  CreditCard,
  Radio,
  Battery,
  Wifi,
  ChevronRight,
  Send,
  MapPin,
  Users,
  SendHorizontal,
  Check,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { gameState } from '../game/gameState';
import { soundEngine } from '../audio/soundEngine';

interface PhoneModalProps {
  onClose: () => void;
  currentZoneName?: string;
  onOpenTransfer?: (beneficiaryId?: string) => void;
}

interface Message {
  from: 'them' | 'me';
  text: string;
  time: string;
}

interface ReplyChoice {
  label: string;
  myReply: string;
  theirResponse: string;
  moneyCost?: number;
  effectMessage?: string;
}

interface Chat {
  id: string;
  sender: string;
  category: 'nearby' | 'distant';
  role: string;
  locationTag?: string;
  preview: string;
  time: string;
  unread: boolean;
  messages: Message[];
  replies?: ReplyChoice[];
}

export const PhoneModal: React.FC<PhoneModalProps> = ({
  onClose,
  currentZoneName = 'Ikeja GRA',
  onOpenTransfer,
}) => {
  const [activeTab, setActiveTab] = useState<'home' | 'messages' | 'bank' | 'traffic'>('home');
  const [messageCategory, setMessageCategory] = useState<'all' | 'nearby' | 'distant'>('all');
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [customInputText, setCustomInputText] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const stats = gameState.getStats();

  // Chats state with dual context (Nearby vs Distant)
  const [chats, setChats] = useState<Chat[]>([
    // NEARBY CONTACTS (Immediate Vicinity)
    {
      id: 'guard',
      sender: 'Baba Segun (Security Guard)',
      category: 'nearby',
      role: 'Estate Gate Security',
      locationTag: 'Ikeja GRA Compound',
      preview: 'Oga good morning! Shall I lock the compound gate behind you?',
      time: '06:12 AM',
      unread: true,
      messages: [
        { from: 'them', text: 'Oga good morning sir! Your personal sedan is parked in front.', time: '06:10 AM' },
        { from: 'them', text: 'Shall I open the main compound iron gate for you as you leave for work?', time: '06:12 AM' },
      ],
      replies: [
        {
          label: 'Yes Baba, please open the gate for me! (-₦500 tip)',
          myReply: 'Yes Baba Segun, opening now. Take this ₦500 for morning recharge card.',
          theirResponse: 'Ah Chairman! God will bless your hustle today in Lagos! The gate is wide open for you.',
          moneyCost: 500,
          effectMessage: 'Tipped Baba Segun ₦500. Gate swung open smoothly!',
        },
        {
          label: 'Thanks Baba, I will lock it behind me.',
          myReply: 'Good morning Baba, thank you. I will close the lock gently behind me.',
          theirResponse: 'Alright Oga, have a safe and stress-free trip to the island!',
        },
      ],
    },
    {
      id: 'colleague',
      sender: 'Tayo (Desk Colleague - Frontend)',
      category: 'nearby',
      role: 'Software Engineer',
      locationTag: 'PayLagos Yaba Hub',
      preview: 'Guy! After the sprint demo, make we chop Amala at Sabo?',
      time: '06:30 AM',
      unread: false,
      messages: [
        { from: 'them', text: 'Bro, I pushed the updated responsive checkout UI to staging.', time: '06:25 AM' },
        { from: 'them', text: 'After the sprint demo with Oga Femi, make we chop Amala at Sabo?', time: '06:30 AM' },
      ],
      replies: [
        {
          label: 'Definite yes! Amala & goat meat after standup.',
          myReply: 'Guy you already know! Amala with gbegiri and cold drink right after standup.',
          theirResponse: 'Oya na! Make sure you arrive before 9 AM so Oga Femi gives us morning bonus.',
        },
      ],
    },
    {
      id: 'buka_cook',
      sender: "Mama Ngozi's Buka",
      category: 'nearby',
      role: 'Food Vendor',
      locationTag: 'Ikeja / Yaba Buka Stall',
      preview: 'Hot firewood Party Jollof and goat meat is fresh!',
      time: '06:45 AM',
      unread: false,
      messages: [
        { from: 'them', text: 'Good morning customer! Firewood jollof and fresh fried dodo ready early today.', time: '06:45 AM' },
      ],
      replies: [
        {
          label: 'Keep a portion of Jollof & chicken for me!',
          myReply: 'Mama Ngozi, keep a hot plate of Jollof rice and soft chicken for me o!',
          theirResponse: 'I have kept it warm for you my son! Come anytime.',
        },
      ],
    },

    // DISTANT CONTACTS (WhatsApp & SMS Remote)
    {
      id: 'boss',
      sender: 'Oga Femi (Engineering Lead)',
      category: 'distant',
      role: 'PayLagos Tech Hub',
      locationTag: 'Remote Office',
      preview: 'Morning standup is 09:00 AM sharp. Avoid go-slow on Third Mainland.',
      time: '06:15 AM',
      unread: true,
      messages: [
        { from: 'them', text: 'Good morning! Make sure you beat the morning Third Mainland Bridge bottleneck.', time: '06:05 AM' },
        { from: 'them', text: 'Morning sprint standup is 09:00 AM sharp. Board members are attending.', time: '06:15 AM' },
      ],
      replies: [
        {
          label: 'Navigating now, will arrive well before 9:00 AM!',
          myReply: 'Good morning Oga Femi! On the road now, on track to arrive well before 9:00 AM.',
          theirResponse: 'Excellent! That is the Lagos tech champion discipline. See you at the hub.',
        },
        {
          label: 'Third Mainland has a slight crawl, but moving through.',
          myReply: 'Morning Oga, slight go-slow around Anthony, but navigating smoothly.',
          theirResponse: 'Drive safe. Join immediately you park your car.',
        },
      ],
    },
    {
      id: 'mama',
      sender: 'Mama (Ibadan)',
      category: 'distant',
      role: 'Family',
      locationTag: 'Ibadan, Oyo State',
      preview: 'Bamidele my son, hope you have eaten? Send ₦3,000 for medicine if you have extra.',
      time: '05:50 AM',
      unread: true,
      messages: [
        { from: 'them', text: 'Bamidele my son, how is Lagos today? Hope you slept well?', time: '05:48 AM' },
        { from: 'them', text: 'Hope you have eaten breakfast? Please send ₦3,000 for my blood pressure medicine if you have extra.', time: '05:50 AM' },
      ],
      replies: [
        {
          label: 'Send ₦3,000 for medicine now (-₦3,000)',
          myReply: 'Good morning Mama! I am sending ₦3,000 into your account right now. Take your drugs properly.',
          theirResponse: 'Ose my precious son! God will enlarge your coast in Lagos and keep you safe on the roads!',
          moneyCost: 3000,
          effectMessage: 'Transferred ₦3,000 to Mama via GTBank. Mama sent her heartfelt blessings!',
        },
        {
          label: 'Promise to send after today\'s work salary.',
          myReply: 'Mama, once today\'s salary is credited at the office, I will transfer it immediately.',
          theirResponse: 'No problem my son, may your hustle yield great fruit today. Love you!',
        },
      ],
    },
    {
      id: 'mechanic',
      sender: 'Tunde (Mechanic - Ikeja)',
      category: 'distant',
      role: 'Automobile Care',
      locationTag: 'Ikeja Underbridge Workshop',
      preview: 'Check your engine coolant and brake fluid before long drives.',
      time: 'Yesterday',
      unread: false,
      messages: [
        { from: 'them', text: 'Oga, your car is in good shape. Just remember to buy quality fuel from reputable filling stations.', time: 'Yesterday' },
      ],
      replies: [
        {
          label: 'Thanks Tunde, will do!',
          myReply: 'Thanks Tunde, I always refuel at Total station. Appreciate the checkup.',
          theirResponse: 'Anytime Chairman! Safe driving on the expressway.',
        },
      ],
    },
  ]);

  const trafficUpdates = [
    { road: 'Third Mainland Bridge', status: 'Moving freely at 75 km/h toward Island', color: 'text-emerald-400' },
    { road: 'Ikorodu Road (Maryland)', status: 'Moderate crawl near underbridge bottleneck', color: 'text-amber-400' },
    { road: 'Herbert Macaulay (Yaba)', status: 'Smooth traffic into Sabo Tech Hub', color: 'text-emerald-400' },
    { road: 'Lekki Toll Gate & Admiralty', status: 'Electronic tolling lanes open, fast flow', color: 'text-emerald-400' },
    { road: 'Allen Avenue (Ikeja)', status: 'Normal morning commercial movement', color: 'text-emerald-400' },
  ];

  const filteredChats = chats.filter((c) => {
    if (messageCategory === 'all') return true;
    return c.category === messageCategory;
  });

  const selectedChat = chats.find((c) => c.id === selectedChatId);


  // Generates intelligent, realistic, and contextually related responses for Lagos characters
  const generateRealisticChatResponse = (
    chatId: string,
    userText: string
  ): { response: string; followUps?: ReplyChoice[] } => {
    const text = userText.toLowerCase();

    // 1. OGA FEMI (Engineering Lead - PayLagos)
    if (chatId === 'boss') {
      if (text.includes('traffic') || text.includes('third mainland') || text.includes('go-slow') || text.includes('hold up') || text.includes('jam') || text.includes('late')) {
        return {
          response:
            'Understood. Morning rush on Third Mainland Bridge is notoriously heavy today. Take the service lane if needed, drive safe, and join the sprint standup the moment you clock in.',
          followUps: [
            {
              label: 'Navigating through now, will arrive shortly!',
              myReply: 'Navigating through the bottleneck now, will arrive well before standup.',
              theirResponse: 'Good. We will review the payment webhook latency first thing.',
            },
            {
              label: 'Code is reviewed and ready on staging.',
              myReply: 'All my PRs and database migrations are already merged on staging.',
              theirResponse: 'Excellent! That is the Lagos engineering discipline I like.',
            },
          ],
        };
      }
      if (text.includes('lift') || text.includes('elevator') || text.includes('floor') || text.includes('roof')) {
        return {
          response:
            'I am currently on Floor 2 reviewing quarterly CBN regulatory compliance with Dr. Adeleke, then heading to the Floor 1 Datacenter. Check in at your dev workstation on Ground Floor.',
          followUps: [
            {
              label: 'Understood, heading to my workstation desk.',
              myReply: 'Understood Oga Femi, heading straight to my desk on Ground Floor.',
              theirResponse: 'See you in the bullpen.',
            },
          ],
        };
      }
      if (text.includes('salary') || text.includes('money') || text.includes('bonus') || text.includes('pay') || text.includes('transfer')) {
        return {
          response:
            'Performance bonuses and daily salaries are automatically disbursed via NIBSS instant transfer once you complete your work sprint tickets at the office workstation.',
          followUps: [
            {
              label: 'Will hit 100% work progress today!',
              myReply: 'Understood Oga, I will clear all pending tickets today to hit the performance bonus!',
              theirResponse: 'That is the spirit. Keep up the high velocity.',
            },
          ],
        };
      }
      if (text.includes('code') || text.includes('bug') || text.includes('deploy') || text.includes('pr') || text.includes('react') || text.includes('standup')) {
        return {
          response:
            'PayLagos processed over ₦4.2 Billion in transactions today. Ensure our microservices maintain 99.99% uptime and zero dropped webhooks.',
          followUps: [
            {
              label: 'Tests are passing with 100% coverage.',
              myReply: 'All payment test cases passed on staging with zero regressions.',
              theirResponse: 'Great work! Proceed with deployment when Chidinma gives QA signoff.',
            },
          ],
        };
      }
      return {
        response:
          'Copy that, Senior Dev. Keep the sprint velocity high. We demo to the board on Floor 2 at midday.',
        followUps: [
          {
            label: 'On track and ready to demo!',
            myReply: 'Everything is tested and ready to demo on the conference screen.',
            theirResponse: 'Solid. Let us make this release flawless.',
          },
        ],
      };
    }

    // 2. MAMA (Ibadan - Family)
    if (chatId === 'mama') {
      if (text.includes('money') || text.includes('transfer') || text.includes('3000') || text.includes('3,000') || text.includes('send') || text.includes('account') || text.includes('alert')) {
        return {
          response:
            'Ose oko mi! My precious child, I just saw the GTBank credit alert! God will continually supply all your needs in Lagos and preserve you from every harm. I am going straight to buy the medicine.',
          followUps: [
            {
              label: 'Take your medicine with warm water Mama.',
              myReply: 'Please take the medicine properly with warm water and rest well Mama.',
              theirResponse: 'I will do so immediately my dear son. Salute your colleagues for me!',
            },
            {
              label: 'I will send more after my salary today.',
              myReply: 'Once my work salary credits today I will send extra for groceries Mama.',
              theirResponse: 'God bless your work! You will never lack in this life.',
            },
          ],
        };
      }
      if (text.includes('health') || text.includes('feeling') || text.includes('how are you') || text.includes('body') || text.includes('drugs')) {
        return {
          response:
            'By God\'s grace I am feeling much better today. The knee pain has reduced and I had warm tea with Agege bread. How is your work in Lagos? Hope you are not overworking yourself?',
          followUps: [
            {
              label: 'Doing great Mama, work is smooth.',
              myReply: 'I am doing great Mama, work at the tech hub is going very well.',
              theirResponse: 'Glory be to God! May you find favour before your bosses.',
            },
          ],
        };
      }
      if (text.includes('traffic') || text.includes('car') || text.includes('drive') || text.includes('road')) {
        return {
          response:
            'Ehyah, that Lagos road is full of wahala. Please don\'t drag road with those yellow danfo buses o! Drive with patient care, the angels of God are guarding your vehicle.',
          followUps: [
            {
              label: 'I will drive very carefully Mama.',
              myReply: 'Yes Mama, I always drive cautiously and obey all traffic signs.',
              theirResponse: 'Good boy! Safe journey to your office.',
            },
          ],
        };
      }
      if (text.includes('food') || text.includes('eat') || text.includes('jollof') || text.includes('amala')) {
        return {
          response:
            'Very good! A hungry person cannot write computer code properly. Eat nutritious food and drink lots of water in that Lagos afternoon sun.',
          followUps: [
            {
              label: 'Yes Mama, eating lunch with colleagues.',
              myReply: 'Yes Mama, I am having amala and fresh goat meat with colleagues for lunch.',
              theirResponse: 'Enjoy your food my son. God bless you!',
            },
          ],
        };
      }
      return {
        response:
          'My dear child, hearing from you always gladdens my heart. Keep shining in Lagos, I am always praying for your success.',
        followUps: [
          {
            label: 'Thank you for your prayers Mama!',
            myReply: 'Thank you so much Mama, your prayers are my biggest strength.',
            theirResponse: 'God will continue to uphold you in all your ways, my child.',
          },
        ],
      };
    }

    // 3. TAYO (Frontend Colleague - PayLagos)
    if (chatId === 'colleague') {
      if (text.includes('amala') || text.includes('food') || text.includes('lunch') || text.includes('buka') || text.includes('eat') || text.includes('chop')) {
        return {
          response:
            'Guy! You already know! Mama Ngozi\'s buka at Sabo has piping hot black amala with gbegiri, ewedu and soft goat meat. 12:30 PM sharp after the sprint demo!',
          followUps: [
            {
              label: '100% deal! I need that hot pepper soup.',
              myReply: '100% deal! I will order extra assorted meat and cold drink.',
              theirResponse: 'Now you are talking! Let us finish this code quickly.',
            },
            {
              label: 'Let us chill on the Floor 3 rooftop terrace first.',
              myReply: 'Let us take the lift to Floor 3 rooftop terrace to catch the breeze first.',
              theirResponse: 'Solid plan! The view of the lagoon from the rooftop is therapeutic.',
            },
          ],
        };
      }
      if (text.includes('lift') || text.includes('elevator') || text.includes('floor') || text.includes('roof')) {
        return {
          response:
            'Bro, the new elevator to Floor 1, 2, and 3 is amazing! Floor 1 has the server datacenter, Floor 2 has the executive suites, and Floor 3 rooftop has beanbags with a full view of Lagos!',
          followUps: [
            {
              label: 'Let\'s check out the rooftop lounge during break.',
              myReply: 'Let\'s take the lift to Floor 3 rooftop during our lunch break.',
              theirResponse: 'Definitely! Grab a cold drink from the pantry and let us go up.',
            },
          ],
        };
      }
      if (text.includes('traffic') || text.includes('third mainland') || text.includes('danfo') || text.includes('jam')) {
        return {
          response:
            'Omo! Third Mainland was choked this morning! A container truck was stalled near Maryland and danfos were honking furiously. Glad you navigated through safely!',
          followUps: [
            {
              label: 'Lagos traffic is pure character building.',
              myReply: 'Lagos traffic will test your patience, but we made it!',
              theirResponse: 'Haha, facts! That is why we work in fintech to build solutions.',
            },
          ],
        };
      }
      if (text.includes('react') || text.includes('code') || text.includes('bug') || text.includes('ui') || text.includes('tailwind')) {
        return {
          response:
            'Check out the responsive checkout modal I pushed to staging. Clean design, zero pills, and buttery smooth animations. Test it on your dual monitors at your workstation!',
          followUps: [
            {
              label: 'Checking it out on my workstation right now.',
              myReply: 'Testing the checkout flow on my workstation screens now. Looks pixel-perfect!',
              theirResponse: 'Thanks boss! Team PayLagos to the moon!',
            },
          ],
        };
      }
      return {
        response:
          'Loud and clear my guy! PayLagos to the world. Let us smash these sprint deliverables today.',
        followUps: [
          {
            label: 'Let\'s get this money!',
            myReply: 'Let us hit our milestone bonus today!',
            theirResponse: 'You know the vibes! Full focus mode activated.',
          },
        ],
      };
    }

    // 4. BABA SEGUN (Security Guard - Estate Gate)
    if (chatId === 'guard') {
      if (text.includes('gate') || text.includes('open') || text.includes('car') || text.includes('drive') || text.includes('park')) {
        return {
          response:
            'Oga mi! The iron gate is swung wide open for your car anytime! I cleared the driveway and swept your parking shade under the mango tree. Safe journey to work!',
          followUps: [
            {
              label: 'Thank you Baba, appreciate your vigilance!',
              myReply: 'Thank you Baba Segun, your vigilance gives us great peace of mind.',
              theirResponse: 'Salute Chairman! That is my duty 24/7. More blessings on your business today!',
            },
          ],
        };
      }
      if (text.includes('nepa') || text.includes('light') || text.includes('power') || text.includes('generator')) {
        return {
          response:
            'NEPA took the light earlier this morning, but I checked our estate generator shed. The fuel tank is 70% full, standing standby whenever you want me to turn it on!',
          followUps: [
            {
              label: 'Great, thanks for keeping generator fueled.',
              myReply: 'Thanks for keeping the generator tank full Baba.',
              theirResponse: 'Anytime Oga! Light must shine for our estate.',
            },
          ],
        };
      }
      return {
        response:
          'Salute Chairman! Estate security is 100% intact. No unauthorized movement on this street today!',
        followUps: [
          {
            label: 'Keep up the great work Baba.',
            myReply: 'Keep up the solid work Baba Segun.',
            theirResponse: 'Thank you Oga mi! May God bring you back safely tonight.',
          },
        ],
      };
    }

    // 5. MAMA NGOZI (Buka Cook)
    if (chatId === 'buka_cook') {
      if (text.includes('jollof') || text.includes('amala') || text.includes('food') || text.includes('chicken') || text.includes('rice') || text.includes('order')) {
        return {
          response:
            'Customer dada! The firewood party jollof is steaming hot, and the goat meat amala is fresh from the pot! I have set aside your favourite soft portion.',
          followUps: [
            {
              label: 'Keep a portion for me, coming during lunch!',
              myReply: 'Keep a plate of jollof and fried plantain for me Mama Ngozi, coming at lunch!',
              theirResponse: 'I have covered it with warm foil for you my son. Come anytime!',
            },
          ],
        };
      }
      return {
        response:
          'Welcome my good customer! Fresh food brings good health. Whenever you are hungry just come to the buka!',
        followUps: [
          {
            label: 'Will definitely stop by today!',
            myReply: 'I will definitely stop by today for my afternoon lunch.',
            theirResponse: 'I am waiting for you with cold malt and hot soup!',
          },
        ],
      };
    }

    // 6. TUNDE (Mechanic - Ikeja)
    if (chatId === 'mechanic') {
      if (text.includes('brake') || text.includes('fluid') || text.includes('stopping') || text.includes('pads')) {
        return {
          response:
            'Oga, in this Lagos stop-and-go go-slow, your brake pads are your life. If the pedal feels spongy or pulls to one side, bring it to my Ikeja workshop immediately.',
          followUps: [
            {
              label: 'Brakes feel sharp and responsive!',
              myReply: 'Brakes feel very sharp and responsive today, thanks Tunde!',
              theirResponse: 'Good! Quality brake fluid makes all the difference. Drive safe.',
            },
          ],
        };
      }
      if (text.includes('fuel') || text.includes('petrol') || text.includes('engine') || text.includes('oil')) {
        return {
          response:
            'Always buy clean fuel from major filling stations like Total or Oando so your fuel injectors don\'t get clogged with kerosene impurities. Call me if the check engine light blinks.',
          followUps: [
            {
              label: 'Only buying from Total and Oando.',
              myReply: 'Yes Tunde, only refueling at certified Total and Oando stations.',
              theirResponse: 'Smart driver! That will preserve your engine for years.',
            },
          ],
        };
      }
      return {
        response:
          'Anytime Chairman! Your car is in top mechanical shape. Just check your tyre pressure before expressway runs.',
        followUps: [
          {
            label: 'Thanks Tunde, appreciate the advice!',
            myReply: 'Thanks Tunde, appreciate the professional advice.',
            theirResponse: 'Anytime Oga! Safe driving on the expressway.',
          },
        ],
      };
    }

    // Default fallback
    return {
      response: `Received loud and clear! Lagos hustle continues strong.`,
      followUps: [
        {
          label: 'Moving smoothly today.',
          myReply: 'Moving smoothly through today\'s schedule.',
          theirResponse: 'Great to hear! Wishing you a productive day.',
        },
      ],
    };
  };

  const handleSelectReply = (reply: ReplyChoice) => {
    if (!selectedChat) return;

    if (reply.moneyCost && stats.money < reply.moneyCost) {
      setFeedback('Insufficient funds in your account for this action!');
      return;
    }

    if (reply.moneyCost) {
      stats.money -= reply.moneyCost;
      gameState.addGTBankNotification(
        'DEBIT ALERT',
        `Transfer to ${selectedChat.sender}: -₦${reply.moneyCost.toLocaleString()}`
      );
    }

    soundEngine.playCashSound();

    const newTime = `${Math.floor(stats.timeMinutes / 60)
      .toString()
      .padStart(2, '0')}:${Math.floor(stats.timeMinutes % 60)
      .toString()
      .padStart(2, '0')}`;

    const updatedMessages: Message[] = [
      ...selectedChat.messages,
      { from: 'me', text: reply.myReply, time: newTime },
      { from: 'them', text: reply.theirResponse, time: newTime },
    ];

    // Compute dynamic intelligent follow-up suggestions based on context
    const followUpGen = generateRealisticChatResponse(selectedChat.id, reply.myReply);

    setChats((prev) =>
      prev.map((c) =>
        c.id === selectedChat.id
          ? {
              ...c,
              unread: false,
              preview: reply.theirResponse,
              messages: updatedMessages,
              replies: followUpGen.followUps, // Continues realistic dialogue
            }
          : c
      )
    );

    if (reply.effectMessage) {
      setFeedback(reply.effectMessage);
    }
  };

  const handleSendCustomMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customInputText.trim() || !selectedChat) return;

    const userInput = customInputText.trim();
    const newTime = `${Math.floor(stats.timeMinutes / 60)
      .toString()
      .padStart(2, '0')}:${Math.floor(stats.timeMinutes % 60)
      .toString()
      .padStart(2, '0')}`;

    // Generate intelligent, realistic response tailored specifically to what the user said
    const { response, followUps } = generateRealisticChatResponse(selectedChat.id, userInput);

    const updatedMessages: Message[] = [
      ...selectedChat.messages,
      { from: 'me', text: userInput, time: newTime },
      { from: 'them', text: response, time: newTime },
    ];

    setChats((prev) =>
      prev.map((c) =>
        c.id === selectedChat.id
          ? {
              ...c,
              preview: response,
              messages: updatedMessages,
              replies: followUps,
            }
          : c
      )
    );

    setCustomInputText('');
    soundEngine.playDoorSound();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-4 backdrop-blur-md overflow-y-auto">
      <div className="relative my-auto flex h-[620px] w-full max-w-[360px] flex-col overflow-hidden rounded-[42px] border-4 border-zinc-700 bg-zinc-950 text-white shadow-2xl">
        {/* Phone Notch & Status Bar */}
        <div className="flex items-center justify-between bg-zinc-900 px-6 pt-3.5 pb-2 text-[11px] font-semibold text-zinc-300 select-none">
          <span>MTN-NG 5G</span>
          <div className="h-4 w-24 rounded-full bg-zinc-950" /> {/* Dynamic Island */}
          <div className="flex items-center gap-1.5">
            <Wifi className="h-3 w-3" />
            <span className="flex items-center gap-0.5 font-mono">
              <Battery className="h-3.5 w-3.5" />
              {Math.round(stats.phoneBattery)}%
            </span>
          </div>
        </div>

        {/* Feedback Alert Pill */}
        {feedback && (
          <div className="flex items-center justify-between border-b border-emerald-500/40 bg-emerald-950/90 px-4 py-2 text-[11px] font-bold text-emerald-200">
            <span className="truncate">{feedback}</span>
            <button onClick={() => setFeedback(null)} className="text-emerald-400 hover:text-white ml-2">
              <X className="h-3 w-3" />
            </button>
          </div>
        )}

        {/* Phone Body Area */}
        <div className="flex-1 overflow-y-auto">
          {/* HOME SCREEN */}
          {activeTab === 'home' && (
            <div className="p-5">
              <div className="mt-4 text-center">
                <div className="font-mono text-4xl font-light tracking-tight text-white">
                  {Math.floor(stats.timeMinutes / 60)
                    .toString()
                    .padStart(2, '0')}
                  :
                  {Math.floor(stats.timeMinutes % 60)
                    .toString()
                    .padStart(2, '0')}
                </div>
                <div className="mt-1 text-xs font-medium text-emerald-400">
                  Day {stats.day} • {currentZoneName}
                </div>
              </div>

              {/* App Icons Grid */}
              <div className="mt-8 grid grid-cols-3 gap-5 text-center">
                <button
                  onClick={() => setActiveTab('messages')}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 shadow-lg transition group-hover:scale-105 active:scale-95">
                    <MessageSquare className="h-7 w-7 text-white" />
                    {chats.some((c) => c.unread) && (
                      <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-black text-white">
                        !
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-zinc-200">Messages</span>
                </button>

                <button
                  onClick={() => setActiveTab('bank')}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-600 shadow-lg transition group-hover:scale-105 active:scale-95">
                    <CreditCard className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-200">GTBank</span>
                </button>

                <button
                  onClick={() => setActiveTab('traffic')}
                  className="flex flex-col items-center gap-1.5 group"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-600 shadow-lg transition group-hover:scale-105 active:scale-95">
                    <Radio className="h-7 w-7 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-zinc-200">Traffic NG</span>
                </button>
              </div>

              {/* Work & Location Status Card */}
              <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-4">
                <div className="flex items-center justify-between text-xs text-zinc-400">
                  <span className="font-bold text-emerald-400 uppercase">Current Schedule</span>
                  <span className="font-mono">09:00 - 17:00</span>
                </div>
                <h4 className="mt-1 text-sm font-bold text-white">PayLagos Tech Hub (Yaba)</h4>
                <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
                  Head to Herbert Macaulay Way to punch your timecard and complete engineering tasks.
                </p>
              </div>
            </div>
          )}

          {/* DUAL-CONTEXT MESSAGING APP (NEARBY VS DISTANT) */}
          {activeTab === 'messages' && (
            <div className="flex h-full flex-col p-4">
              {/* Messages Header */}
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                {selectedChat ? (
                  <button
                    onClick={() => setSelectedChatId(null)}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-400"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back to Chats
                  </button>
                ) : (
                  <h3 className="font-bold text-white text-sm">WhatsApp & SMS</h3>
                )}

                <button
                  onClick={() => setActiveTab('home')}
                  className="text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Home
                </button>
              </div>

              {!selectedChat ? (
                <>
                  {/* Category Filter Pills (Nearby vs Distant) */}
                  <div className="mt-3 flex rounded-xl bg-zinc-900 p-1 text-xs font-semibold">
                    <button
                      onClick={() => setMessageCategory('all')}
                      className={`flex-1 rounded-lg py-1.5 transition ${
                        messageCategory === 'all' ? 'bg-zinc-800 text-white shadow-xs' : 'text-zinc-400'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setMessageCategory('nearby')}
                      className={`flex-1 rounded-lg py-1.5 transition flex items-center justify-center gap-1 ${
                        messageCategory === 'nearby'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'text-zinc-400'
                      }`}
                    >
                      <MapPin className="h-3 w-3" /> Nearby
                    </button>
                    <button
                      onClick={() => setMessageCategory('distant')}
                      className={`flex-1 rounded-lg py-1.5 transition flex items-center justify-center gap-1 ${
                        messageCategory === 'distant'
                          ? 'bg-sky-600 text-white shadow-xs'
                          : 'text-zinc-400'
                      }`}
                    >
                      <Users className="h-3 w-3" /> Distant
                    </button>
                  </div>

                  {/* Chat List */}
                  <div className="mt-3 space-y-2 overflow-y-auto flex-1">
                    {filteredChats.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedChatId(c.id);
                          c.unread = false;
                        }}
                        className={`cursor-pointer rounded-2xl border p-3 transition hover:bg-zinc-800 ${
                          c.unread
                            ? 'border-emerald-500/50 bg-emerald-950/20'
                            : 'border-zinc-800/80 bg-zinc-900/60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">{c.sender}</span>
                            <span
                              className={`rounded-md px-1.5 py-0.2 text-[9px] font-bold ${
                                c.category === 'nearby'
                                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-sky-950 text-sky-300 border border-sky-500/30'
                              }`}
                            >
                              {c.category === 'nearby' ? '📍 Nearby' : '📱 Remote'}
                            </span>
                          </div>
                          <span className="text-[10px] text-zinc-500 font-mono">{c.time}</span>
                        </div>
                        <div className="text-[10px] text-zinc-400">{c.locationTag}</div>
                        <p className="mt-1 line-clamp-1 text-xs text-zinc-300">{c.preview}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* Chat Conversation View */
                <div className="mt-2 flex flex-1 flex-col overflow-hidden">
                  <div className="border-b border-zinc-800 pb-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{selectedChat.sender}</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            if (onOpenTransfer) {
                              const match = selectedChat.id === 'guard' ? 'baba_segun' : selectedChat.id === 'colleague' ? 'tayo_colleague' : selectedChat.id;
                              onOpenTransfer(match);
                            }
                          }}
                          className="flex items-center gap-1 rounded-md bg-amber-600/90 px-2 py-0.5 text-[9px] font-bold text-white hover:bg-amber-500 transition"
                        >
                          <Send className="h-2.5 w-2.5" /> Send ₦
                        </button>
                        <span className="rounded-md bg-zinc-800 px-2 py-0.5 text-[9px] text-zinc-400 font-mono">
                          {selectedChat.role}
                        </span>
                      </div>
                    </div>
                    <div className="text-[10px] text-zinc-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="h-3 w-3 text-emerald-400" />
                      <span>{selectedChat.locationTag}</span>
                    </div>
                  </div>

                  {/* Messages Bubble List */}
                  <div className="flex-1 space-y-2 overflow-y-auto py-3">
                    {selectedChat.messages.map((m, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col ${m.from === 'me' ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed ${
                            m.from === 'me'
                              ? 'bg-emerald-600 text-white rounded-br-none'
                              : 'bg-zinc-800 text-zinc-200 rounded-bl-none'
                          }`}
                        >
                          {m.text}
                        </div>
                        <span className="mt-0.5 font-mono text-[9px] text-zinc-500">{m.time}</span>
                      </div>
                    ))}
                  </div>

                  {/* Reply Choice Options (Interactive Replies) */}
                  {selectedChat.replies && selectedChat.replies.length > 0 && (
                    <div className="border-t border-zinc-800 pt-2 pb-1 space-y-1.5">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase">
                        Quick Reply Options:
                      </span>
                      {selectedChat.replies.map((reply, rIdx) => (
                        <button
                          key={rIdx}
                          onClick={() => handleSelectReply(reply)}
                          className="w-full text-left rounded-xl border border-zinc-700 bg-zinc-800/90 p-2.5 text-xs text-white hover:border-emerald-500 hover:bg-zinc-700 transition"
                        >
                          {reply.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Custom Text Input Form */}
                  <form onSubmit={handleSendCustomMessage} className="mt-2 flex items-center gap-1.5 border-t border-zinc-800 pt-2">
                    <input
                      type="text"
                      placeholder="Type message in Lagos..."
                      value={customInputText}
                      onChange={(e) => setCustomInputText(e.target.value)}
                      className="flex-1 rounded-xl bg-zinc-900 border border-zinc-800 px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-hidden focus:border-emerald-500"
                    />
                    <button
                      type="submit"
                      disabled={!customInputText.trim()}
                      className="rounded-xl bg-emerald-600 p-2 text-white hover:bg-emerald-500 transition disabled:opacity-40"
                    >
                      <SendHorizontal className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}

          {/* GTBANK MOBILE BANKING */}
          {activeTab === 'bank' && (
            <div className="p-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="font-bold text-amber-400">GTBank Mobile Banking</h3>
                <button onClick={() => setActiveTab('home')} className="text-xs font-semibold text-amber-400">
                  Home
                </button>
              </div>

              {/* Orange GTBank Card */}
              <div className="mt-4 rounded-2xl bg-gradient-to-br from-amber-600 to-amber-950 p-4 shadow-lg border border-amber-500/30">
                <div className="text-[10px] uppercase font-bold tracking-wider text-amber-200">
                  Available Naira Balance
                </div>
                <div className="mt-1 font-mono text-2xl font-black text-white">
                  ₦{stats.money.toLocaleString()}
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-amber-200/90 font-mono">
                  <span>ACCT: 014****892</span>
                  <span>TIER 3 SAVINGS</span>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenTransfer) {
                      onOpenTransfer();
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 py-3 text-xs font-bold text-white shadow-lg hover:from-amber-500 hover:to-amber-600 transition"
                >
                  <Send className="h-4 w-4" /> Send / Transfer Money
                </button>
              </div>

              {/* Recent Notifications / Alerts */}
              <div className="mt-4 space-y-2 text-xs">
                <div className="font-bold text-zinc-400 uppercase text-[10px]">
                  Real-Time SMS & Alerts
                </div>
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                  {gameState.getBankAlerts().length > 0 ? (
                    gameState.getBankAlerts().map((alert) => (
                      <div key={alert.id} className="rounded-xl border border-zinc-800 bg-zinc-900/90 p-2.5">
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-bold ${
                              alert.type.includes('CREDIT') ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {alert.type}
                          </span>
                          <span className="font-mono text-[9px] text-zinc-500">{alert.time}</span>
                        </div>
                        <p className="mt-0.5 text-zinc-300 text-[11px]">{alert.details}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-3 text-center text-zinc-500">
                      No recent transaction notifications today.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* LAGOS TRAFFIC RADIO */}
          {activeTab === 'traffic' && (
            <div className="p-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="font-bold text-sky-400">Lagos Traffic Radio 96.1</h3>
                <button onClick={() => setActiveTab('home')} className="text-xs font-semibold text-sky-400">
                  Home
                </button>
              </div>

              <div className="mt-3 space-y-2 overflow-y-auto max-h-[460px]">
                {trafficUpdates.map((t, idx) => (
                  <div key={idx} className="rounded-2xl border border-zinc-800 bg-zinc-900/90 p-3">
                    <div className="text-xs font-bold text-white">{t.road}</div>
                    <div className={`mt-0.5 text-xs font-semibold ${t.color}`}>{t.status}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Home Indicator Bar */}
        <div className="flex items-center justify-center bg-zinc-950 py-3 border-t border-zinc-900">
          <button
            onClick={onClose}
            className="h-1.5 w-28 rounded-full bg-zinc-600 hover:bg-white transition"
            title="Close Phone"
          />
        </div>
      </div>
    </div>
  );
};
