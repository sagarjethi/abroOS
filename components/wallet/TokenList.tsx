"use client";

import { useEffect, useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Card } from '@/components/ui/card';
import { Icons } from '@/components/icons';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Token {
  symbol: string;
  name: string;
  balance: string;
  value: string;
  icon?: string;
}

export function TokenList() {
  const { wallet } = useWallet();
  const [tokens, setTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTokens();
  }, [wallet]);

  const loadTokens = async () => {
    try {
      setIsLoading(true);
      // This would be replaced with actual token loading logic
      // For now, just show ETH as an example
      setTokens([
        {
          symbol: 'ETH',
          name: 'Ethereum',
          balance: '1.5',
          value: '$3,000',
          icon: '/icons/eth.svg'
        }
      ]);
    } catch (error) {
      console.error('Error loading tokens:', error);
    } finally {
      setIsLoading(false);
    }
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
        {tokens.map((token) => (
          <Card key={token.symbol} className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {token.icon ? (
                <img src={token.icon} alt={token.name} className="w-8 h-8" />
              ) : (
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium">{token.symbol[0]}</span>
                </div>
              )}
              <div>
                <h4 className="font-medium">{token.name}</h4>
                <p className="text-sm text-muted-foreground">{token.symbol}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-medium">{token.balance} {token.symbol}</p>
              <p className="text-sm text-muted-foreground">{token.value}</p>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
} 