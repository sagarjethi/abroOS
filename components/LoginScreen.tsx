"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClientTime } from './ClientTime';
import { LogIn, User, ShieldCheck, Wallet } from 'lucide-react';
import { useWallet } from '@/contexts/WalletContext';

interface LoginScreenProps {
  onLogin: (username: string) => void;
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [currentDate, setCurrentDate] = useState('');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [isWalletLoading, setIsWalletLoading] = useState(false);
  const { loadWallet } = useWallet();
  
  // Update date on component mount and when date changes
  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      };
      setCurrentDate(now.toLocaleDateString('en-US', options));
    };
    
    updateDate();
    
    // Set an interval to check date change (run once a minute)
    const interval = setInterval(() => {
      updateDate();
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  const handleUserLogin = async (username: string) => {
    setSelectedUser(username);
    
    // If user selects "Local User", attempt to load/create their wallet
    if (username === "Local User") {
      setIsWalletLoading(true);
      
      try {
        // Load/create wallet using username as password for simplicity
        await loadWallet(username, username);
      } catch (error) {
        console.error("Failed to load wallet:", error);
      } finally {
        setIsWalletLoading(false);
      }
    }
    
    // Continue with login after wallet operations
    setTimeout(() => {
      onLogin(username);
    }, 600);
  };
  
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 z-0 opacity-60">
        {/* Grid background */}
        <div 
          className="absolute inset-0 bg-[linear-gradient(to_right,#171717_1px,transparent_1px),linear-gradient(to_bottom,#171717_1px,transparent_1px)] bg-[size:40px_40px]"
        />
        
        {/* Glowing orb */}
        <motion.div
          initial={{ x: '10%', y: '30%' }}
          animate={{ 
            x: ['10%', '80%', '30%', '10%'], 
            y: ['30%', '10%', '80%', '30%'] 
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            repeatType: 'loop', 
            ease: 'easeInOut'
          }}
          className="absolute w-64 h-64 rounded-full bg-purple-500/20 filter blur-[80px]"
        />
        
        {/* Secondary glow */}
        <motion.div
          initial={{ x: '70%', y: '60%' }}
          animate={{ 
            x: ['70%', '20%', '90%', '70%'], 
            y: ['60%', '80%', '20%', '60%'] 
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            repeatType: 'loop', 
            ease: 'easeInOut'
          }}
          className="absolute w-72 h-72 rounded-full bg-indigo-500/10 filter blur-[80px]"
        />
        
        {/* Animated lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <motion.linearGradient
              id="gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
              animate={{
                x1: ["0%", "100%", "0%"],
                y1: ["0%", "100%", "0%"],
                x2: ["100%", "0%", "100%"],
                y2: ["100%", "0%", "100%"],
              }}
              transition={{ duration: 10, repeat: Infinity }}
            >
              <stop offset="0%" stopColor="#4338ca" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#7e22ce" stopOpacity="0.2" />
            </motion.linearGradient>
          </defs>
          <motion.rect
            width="100%"
            height="100%"
            fill="url(#gradient)"
            animate={{
              opacity: [0.05, 0.1, 0.05],
            }}
            transition={{ duration: 5, repeat: Infinity }}
          />
        </svg>
      </div>
      
      {/* Content container with backdrop blur */}
      <div className="relative z-10 flex flex-col items-center justify-center backdrop-blur-sm p-8 rounded-lg bg-black/50">
        {/* Version indicator */}
        <div className="absolute top-3 left-3 text-gray-500 text-xs">
          abroOS v1.0
        </div>
        
        {/* Clock */}
        <div className="mb-12 text-center">
          <ClientTime 
            format="custom"
            customFormat={(date) => {
              return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            }}
            className="text-white text-7xl font-light"
          />
          <div className="text-gray-400 text-lg mt-1">
            {currentDate}
          </div>
        </div>
        
        {/* User Selection */}
        <div className="w-full max-w-xs">
          <div className="text-white text-xl mb-5 text-center">Select Account</div>
          
          <div className="space-y-3">
            <UserOption
              name="Local User"
              icon={<User size={18} />}
              secondaryIcon={<Wallet size={14} className="text-purple-300" />}
              secondaryLabel="With Ethereum Wallet"
              isActive={selectedUser === "Local User"}
              isLoading={isWalletLoading && selectedUser === "Local User"}
              onClick={() => handleUserLogin("Local User")}
            />
            
            <UserOption
              name="abroOs Account"
              icon={<ShieldCheck size={18} />}
              highlight="bg-purple-900/50 border-purple-800"
              isActive={selectedUser === "abroOs Account"}
              onClick={() => handleUserLogin("abroOs Account")}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

interface UserOptionProps {
  name: string;
  icon: React.ReactNode;
  secondaryIcon?: React.ReactNode;
  secondaryLabel?: string;
  highlight?: string;
  isActive?: boolean;
  isLoading?: boolean;
  onClick: () => void;
}

function UserOption({ 
  name, 
  icon,
  secondaryIcon,
  secondaryLabel,
  highlight = "bg-gray-900/50 border-gray-800",
  isActive = false,
  isLoading = false,
  onClick 
}: UserOptionProps) {
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      whileTap={{ y: 1 }}
      className={`
        flex items-center gap-3 p-3 border rounded-md cursor-pointer
        ${isActive ? highlight : 'bg-gray-900/30 border-gray-800/50 hover:bg-gray-900/50'}
        backdrop-blur-sm bg-black/20
      `}
      onClick={onClick}
    >
      <div className="bg-black/30 p-2 rounded-full">
        <div className="text-white">
          {icon}
        </div>
      </div>
      
      <div className="flex-1">
        <div className="text-white">{name}</div>
        {secondaryLabel && (
          <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
            {secondaryIcon}
            <span>{secondaryLabel}</span>
          </div>
        )}
      </div>
      
      {isActive && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="ml-auto"
        >
          {isLoading ? (
            <div className="h-4 w-4 rounded-full border-2 border-t-transparent border-white/80 animate-spin" />
          ) : (
            <LogIn size={16} className="text-white/80" />
          )}
        </motion.div>
      )}
    </motion.div>
  );
} 