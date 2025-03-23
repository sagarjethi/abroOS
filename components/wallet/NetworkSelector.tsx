"use client";

import { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NetworkConfig } from '@/lib/wallet/wallet-service';

export function NetworkSelector() {
  const {
    currentNetwork,
    availableNetworks,
    customNetworks,
    setNetwork,
    addCustomNetwork,
    removeCustomNetwork,
  } = useWallet();

  const [isAddingNetwork, setIsAddingNetwork] = useState(false);
  const [newNetwork, setNewNetwork] = useState<NetworkConfig>({
    chainId: 1,
    name: '',
    rpcUrl: '',
    symbol: '',
    blockExplorerUrl: '',
  });

  const handleAddNetwork = () => {
    if (
      !newNetwork.chainId ||
      !newNetwork.name ||
      !newNetwork.rpcUrl ||
      !newNetwork.symbol
    ) {
      return;
    }

    const success = addCustomNetwork(newNetwork.chainId.toString(), newNetwork);
    if (success) {
      setIsAddingNetwork(false);
      setNewNetwork({
        chainId: 1,
        name: '',
        rpcUrl: '',
        symbol: '',
        blockExplorerUrl: '',
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[200px] justify-start">
            {currentNetwork.name}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[200px]">
          <DropdownMenuLabel>Networks</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.entries(availableNetworks).map(([id, network]) => (
            <DropdownMenuItem
              key={id}
              onClick={() => setNetwork(id)}
              className="cursor-pointer"
            >
              {network.name}
            </DropdownMenuItem>
          ))}
          {Object.keys(customNetworks).length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Custom Networks</DropdownMenuLabel>
              {Object.entries(customNetworks).map(([id, network]) => (
                <DropdownMenuItem
                  key={id}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <span onClick={() => setNetwork(id)}>{network.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 opacity-0 group-hover:opacity-100"
                    onClick={() => removeCustomNetwork(id)}
                  >
                    Remove
                  </Button>
                </DropdownMenuItem>
              ))}
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setIsAddingNetwork(true)}
            className="cursor-pointer"
          >
            Add Network
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isAddingNetwork} onOpenChange={setIsAddingNetwork}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Custom Network</DialogTitle>
            <DialogDescription>
              Enter the details of the custom network you want to add.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="chainId">Chain ID</Label>
              <Input
                id="chainId"
                type="number"
                value={newNetwork.chainId}
                onChange={(e) =>
                  setNewNetwork({ ...newNetwork, chainId: parseInt(e.target.value, 10) || 1 })
                }
                placeholder="e.g., 1, 137"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Network Name</Label>
              <Input
                id="name"
                value={newNetwork.name}
                onChange={(e) =>
                  setNewNetwork({ ...newNetwork, name: e.target.value })
                }
                placeholder="e.g., Ethereum Mainnet"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="rpcUrl">RPC URL</Label>
              <Input
                id="rpcUrl"
                value={newNetwork.rpcUrl}
                onChange={(e) =>
                  setNewNetwork({ ...newNetwork, rpcUrl: e.target.value })
                }
                placeholder="e.g., https://mainnet.infura.io/v3/your-api-key"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="symbol">Currency Symbol</Label>
              <Input
                id="symbol"
                value={newNetwork.symbol}
                onChange={(e) =>
                  setNewNetwork({ ...newNetwork, symbol: e.target.value })
                }
                placeholder="e.g., ETH"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="explorer">Block Explorer URL</Label>
              <Input
                id="explorer"
                value={newNetwork.blockExplorerUrl}
                onChange={(e) =>
                  setNewNetwork({
                    ...newNetwork,
                    blockExplorerUrl: e.target.value,
                  })
                }
                placeholder="e.g., https://etherscan.io"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingNetwork(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNetwork}>Add Network</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
} 