'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { AlertCircle, ChevronRight, Key, Trash2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useRouter } from 'next/navigation';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';

interface Account {
  address: string;
  name: string;
  username: string;
  lastAccessed: number;
  createdAt: number;
}

interface AccountListProps {
  onSelectAccount?: (account: Account) => void;
  onDeleteAccount?: (address: string) => void;
  className?: string;
}

export function AccountList({ onSelectAccount, onDeleteAccount, className = '' }: AccountListProps) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const router = useRouter();

  const fetchAccounts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/account');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch accounts');
      }
      
      setAccounts(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleViewAccount = (account: Account) => {
    if (onSelectAccount) {
      onSelectAccount(account);
    } else {
      router.push(`/account/${account.address}`);
    }
  };

  const handleDeleteAccount = async () => {
    if (!accountToDelete) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/account?address=${accountToDelete.address}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }
      
      // Remove from list
      setAccounts(accounts.filter(a => a.address !== accountToDelete.address));
      
      // Notify parent
      if (onDeleteAccount) {
        onDeleteAccount(accountToDelete.address);
      }
      
      setIsDialogOpen(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsDeleting(false);
      setAccountToDelete(null);
    }
  };

  const confirmDelete = (account: Account) => {
    setAccountToDelete(account);
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Your Accounts</CardTitle>
          <CardDescription>Loading your secure accounts...</CardDescription>
        </CardHeader>
        <CardContent>
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b">
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-3 w-[200px]" />
              </div>
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <CardTitle>Your Accounts</CardTitle>
          <CardDescription>Select an account to view details or sign messages</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {accounts.length === 0 ? (
            <div className="text-center p-4 border rounded-md">
              <p className="text-gray-500">No accounts found. Create an account to get started.</p>
            </div>
          ) : (
            accounts.map((account) => (
              <div 
                key={account.address} 
                className="flex items-center justify-between p-4 border rounded-md hover:bg-gray-50"
              >
                <div className="flex-1">
                  <h3 className="font-medium">{account.name || account.username}</h3>
                  <p className="text-sm text-gray-500 truncate">{account.address}</p>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => confirmDelete(account)}
                    title="Delete account"
                  >
                    <Trash2 className="h-4 w-4 text-gray-500" />
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleViewAccount(account)}
                    title="View account details"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Account Deletion</DialogTitle>
            <DialogDescription>
              {accountToDelete && (
                <>
                  Are you sure you want to delete the account {accountToDelete.name || accountToDelete.username}? 
                  This action cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 