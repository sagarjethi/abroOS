"use client";

import { useEffect, useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Transaction {
  hash: string;
  type: 'send' | 'receive';
  amount: string;
  address: string;
  timestamp: Date;
  status: 'pending' | 'confirmed' | 'failed';
}

export function TransactionHistory() {
  const { wallet } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTransactions();
  }, [wallet]);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      // This would be replaced with actual transaction loading logic
      // For now, just show example transactions
      setTransactions([
        {
          hash: '0x1234...5678',
          type: 'send',
          amount: '0.5 ETH',
          address: '0xabcd...efgh',
          timestamp: new Date(),
          status: 'confirmed'
        },
        {
          hash: '0x8765...4321',
          type: 'receive',
          amount: '1.0 ETH',
          address: '0xijkl...mnop',
          timestamp: new Date(Date.now() - 86400000), // 1 day ago
          status: 'confirmed'
        }
      ]);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2">
        {transactions.map((tx) => (
          <Card key={tx.hash} className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center",
                  tx.type === 'send' ? "bg-red-100" : "bg-green-100"
                )}>
                  {tx.type === 'send' ? (
                    <Icons.arrowUp className="h-4 w-4 text-red-600" />
                  ) : (
                    <Icons.arrowDown className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <div>
                  <h4 className="font-medium">
                    {tx.type === 'send' ? 'Sent' : 'Received'} {tx.amount}
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {tx.type === 'send' ? 'To:' : 'From:'} {formatAddress(tx.address)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={
                  tx.status === 'confirmed' ? 'default' :
                  tx.status === 'pending' ? 'secondary' : 'destructive'
                }>
                  {tx.status}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  {formatDate(tx.timestamp)}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
} 