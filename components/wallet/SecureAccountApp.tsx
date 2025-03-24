'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AccountCreation } from './AccountCreation';
import { AccountList } from './AccountList';
import { AccountDetail } from './AccountDetail';
import { Window } from '../window/window';
import { Key, Plus, List, X } from 'lucide-react';

interface Account {
  address: string;
  name: string;
  username: string;
  lastAccessed: number;
  createdAt: number;
}

export function SecureAccountApp() {
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [activeTab, setActiveTab] = useState<string>('accounts');
  const [isOpen, setIsOpen] = useState(true);

  const handleAccountCreated = (address: string) => {
    // Switch to accounts tab to show the newly created account
    setActiveTab('accounts');
  };

  const handleAccountSelected = (account: Account) => {
    setSelectedAccount(account);
    setActiveTab('details');
  };

  const handleDeleteAccount = () => {
    if (selectedAccount && activeTab === 'details') {
      // Reset selected account and go back to accounts list
      setSelectedAccount(null);
      setActiveTab('accounts');
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <Window
      title="Secure Account Manager"
      icon={<Key className="h-5 w-5" />}
      defaultSize={{ width: 900, height: 700 }}
      defaultPosition={{ x: 40, y: 40 }}
      className="bg-background"
      onClose={handleClose}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 flex-1 overflow-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="accounts" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Accounts
              </TabsTrigger>
              <TabsTrigger value="create" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Account
              </TabsTrigger>
              <TabsTrigger 
                value="details" 
                disabled={!selectedAccount}
                className="flex items-center gap-2"
              >
                <Key className="h-4 w-4" />
                Account Details
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="accounts" className="h-full">
              <AccountList 
                onSelectAccount={handleAccountSelected}
                onDeleteAccount={handleDeleteAccount}
                className="h-full"
              />
            </TabsContent>
            
            <TabsContent value="create" className="h-full">
              <AccountCreation onAccountCreated={handleAccountCreated} />
            </TabsContent>
            
            <TabsContent value="details" className="h-full">
              {selectedAccount ? (
                <AccountDetail address={selectedAccount.address} className="h-full" />
              ) : (
                <Card className="h-full">
                  <CardHeader>
                    <CardTitle>No Account Selected</CardTitle>
                    <CardDescription>Please select an account from the accounts tab</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Select an account to view its details and manage operations.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Window>
  );
} 