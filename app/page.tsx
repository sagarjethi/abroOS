"use client";

import React, { useState, useEffect } from 'react';
import Desktop from "@/components/Desktop";
import Taskbar from "@/components/Taskbar";
import { WindowsProvider } from "@/contexts/WindowsContext";
import { FileSystemProvider } from "@/contexts/FileSystemContext";
import { AssistantGuide } from "@/components/AssistantGuide";
import { LoginScreen } from "@/components/LoginScreen";
import { LogoutDialog } from "@/components/LogoutDialog";

const Page: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  
  // Initialize login state
  useEffect(() => {
    // Check for saved login state
    if (typeof window !== 'undefined') {
      const savedLoginState = localStorage.getItem('abroOs_isLoggedIn');
      const savedUser = localStorage.getItem('abroOs_currentUser');
      
      if (savedLoginState === 'true' && savedUser) {
        setIsLoggedIn(true);
        setCurrentUser(savedUser);
      } else {
        // Always show login screen on initial load if no saved state
        setIsLoggedIn(false);
      }
    }
  }, []);
  
  const handleLogin = (username: string) => {
    setIsLoggedIn(true);
    setCurrentUser(username);
    
    // Save login state
    if (typeof window !== 'undefined') {
      localStorage.setItem('abroOs_isLoggedIn', 'true');
      localStorage.setItem('abroOs_currentUser', username);
    }
  };
  
  const handleLogout = () => {
    // Show the logout dialog
    setShowLogoutDialog(true);
  };
  
  const handleConfirmLogout = () => {
    // Clear login state
    setIsLoggedIn(false);
    setCurrentUser('');
    
    // Remove from localStorage
    localStorage.removeItem('abroOs_isLoggedIn');
    localStorage.removeItem('abroOs_currentUser');
    
    // Close the dialog
    setShowLogoutDialog(false);
  };
  
  const handleCancelLogout = () => {
    // Just close the dialog
    setShowLogoutDialog(false);
  };

  return (
    <FileSystemProvider>
      <WindowsProvider>
        {/* Show login screen if not logged in */}
        {!isLoggedIn && <LoginScreen onLogin={handleLogin} />}
        
        {/* Desktop environment - only visible after login */}
        <div className={`h-screen w-screen overflow-visible flex flex-col ${!isLoggedIn ? 'hidden' : ''}`}>
          <div className="animated-gradient" aria-hidden="true" />
          <Desktop currentUser={currentUser} />
          <Taskbar onLogout={handleLogout} />
          <AssistantGuide currentUser={currentUser} />
          
          {/* Logout confirmation dialog */}
          <LogoutDialog 
            isOpen={showLogoutDialog}
            onClose={handleCancelLogout}
            onConfirm={handleConfirmLogout}
            username={currentUser}
          />
        </div>
      </WindowsProvider>
    </FileSystemProvider>
  );
};

export default Page;
