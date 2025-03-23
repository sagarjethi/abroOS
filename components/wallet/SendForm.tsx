"use client";

import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';

export function SendForm() {
  const { wallet, sendTransaction } = useWallet();
  const { toast } = useToast();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toAddress || !amount || !wallet) return;

    try {
      setIsLoading(true);
      const tx = await sendTransaction(toAddress, amount);
      toast({
        title: "Transaction sent!",
        description: `Transaction hash: ${tx.hash}`,
      });
      setToAddress('');
      setAmount('');
    } catch (error) {
      console.error('Error sending transaction:', error);
      toast({
        title: "Transaction failed",
        description: error instanceof Error ? error.message : "Failed to send transaction",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <form onSubmit={handleSend} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="to-address">To Address</Label>
          <Input
            id="to-address"
            placeholder="Enter recipient address"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            className="bg-muted/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <Input
              id="amount"
              type="number"
              step="any"
              min="0"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-muted/50 pr-16"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-sm text-muted-foreground">ETH</span>
            </div>
          </div>
        </div>
        <Button 
          type="submit" 
          className="w-full"
          disabled={isLoading || !toAddress || !amount}
        >
          {isLoading ? (
            <>
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            'Send'
          )}
        </Button>
      </form>
    </Card>
  );
} 