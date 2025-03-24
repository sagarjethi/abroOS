"use client";

import React, { useState } from 'react';
import { useWallet } from '@/contexts/WalletContext';
import { 
  Clock, 
  Send, 
  RefreshCw, 
  Copy, 
  ExternalLink, 
  Plus, 
  ChevronDown, 
  ArrowUpRight, 
  ArrowDownLeft,
  FileText,
  Check,
  AlertTriangle,
  Loader,
  Repeat,
  Globe,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Checkbox } from "@/components/ui/checkbox";
import { TransactionStatus, TransactionType, TransactionRecord } from '@/lib/wallet/transaction-service';
import { TokenWithBalance } from '@/lib/wallet/token-service';
import { toast } from '@/hooks/use-toast';
import { ethers } from 'ethers';

// AddTokenDialog component
function AddTokenDialog() {
  const { addCustomToken } = useWallet();
  const [tokenAddress, setTokenAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  
  const handleAddToken = async () => {
    setIsLoading(true);
    try {
      const success = await addCustomToken(tokenAddress);
      if (success) {
        setTokenAddress('');
        setIsOpen(false);
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="ml-auto"
        >
          <Plus size={16} className="mr-1" />
          Add Token
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Custom Token</DialogTitle>
          <DialogDescription>
            Enter the contract address of the ERC-20 token you want to add to your wallet.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="tokenAddress">Token Contract Address</Label>
            <Input
              id="tokenAddress"
              placeholder="0x..."
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleAddToken} 
            disabled={!tokenAddress || isLoading}
          >
            {isLoading ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
                Adding...
              </>
            ) : (
              <>Add Token</>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Custom network dialog component
function AddNetworkDialog() {
  const { addCustomNetwork, customNetworks, removeCustomNetwork } = useWallet();
  const [isOpen, setIsOpen] = useState(false);
  const [networkId, setNetworkId] = useState('');
  const [networkName, setNetworkName] = useState('');
  const [rpcUrl, setRpcUrl] = useState('');
  const [chainId, setChainId] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('');
  const [blockExplorerUrl, setBlockExplorerUrl] = useState('');
  const [isTestnet, setIsTestnet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('add'); // 'add' or 'manage'
  
  const resetForm = () => {
    setNetworkId('');
    setNetworkName('');
    setRpcUrl('');
    setChainId('');
    setCurrencySymbol('');
    setBlockExplorerUrl('');
    setIsTestnet(false);
    setActiveTab('add');
  };
  
  const handleClose = () => {
    resetForm();
    setIsOpen(false);
  };
  
  const handleAddNetwork = async () => {
    setIsLoading(true);
    try {
      const chainIdNum = parseInt(chainId, 10);
      if (isNaN(chainIdNum)) {
        toast({
          title: "Invalid Chain ID",
          description: "Chain ID must be a number",
          variant: "destructive"
        });
        return;
      }
      
      const success = await addCustomNetwork(networkId, {
        name: networkName,
        rpcUrl,
        chainId: chainIdNum,
        currencySymbol,
        blockExplorerUrl,
        isTestnet
      });
      
      if (success) {
        resetForm();
        setActiveTab('manage');
      }
    } catch (error) {
      console.error('Error adding network:', error);
      toast({
        title: "Error",
        description: "Failed to add network",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRemoveNetwork = async (id: string) => {
    await removeCustomNetwork(id);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Globe size={14} className="mr-1" />
          Networks
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Network Management</DialogTitle>
          <DialogDescription>
            Add and manage custom blockchain networks.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="add" className="flex-1">Add Network</TabsTrigger>
            <TabsTrigger value="manage" className="flex-1">Manage Networks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="add" className="mt-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="networkId">Network ID</Label>
                  <Input
                    id="networkId"
                    placeholder="e.g., arbitrum"
                    value={networkId}
                    onChange={(e) => setNetworkId(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="networkName">Network Name</Label>
                  <Input
                    id="networkName"
                    placeholder="e.g., Arbitrum One"
                    value={networkName}
                    onChange={(e) => setNetworkName(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="rpcUrl">RPC URL</Label>
                <Input
                  id="rpcUrl"
                  placeholder="e.g., https://arb1.arbitrum.io/rpc"
                  value={rpcUrl}
                  onChange={(e) => setRpcUrl(e.target.value)}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="chainId">Chain ID</Label>
                  <Input
                    id="chainId"
                    placeholder="e.g., 42161"
                    value={chainId}
                    onChange={(e) => setChainId(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currencySymbol">Currency Symbol</Label>
                  <Input
                    id="currencySymbol"
                    placeholder="e.g., ETH"
                    value={currencySymbol}
                    onChange={(e) => setCurrencySymbol(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="blockExplorerUrl">Block Explorer URL (optional)</Label>
                <Input
                  id="blockExplorerUrl"
                  placeholder="e.g., https://arbiscan.io"
                  value={blockExplorerUrl}
                  onChange={(e) => setBlockExplorerUrl(e.target.value)}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isTestnet" 
                  checked={isTestnet} 
                  onCheckedChange={(checked) => setIsTestnet(checked === true)} 
                />
                <Label htmlFor="isTestnet">This is a testnet</Label>
              </div>
              
              <Button 
                onClick={handleAddNetwork} 
                disabled={!networkId || !networkName || !rpcUrl || !chainId || !currencySymbol || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader size={16} className="mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>Add Network</>
                )}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="manage" className="mt-4">
            <ScrollArea className="h-[300px] pr-4">
              <div className="space-y-2">
                {Object.entries(customNetworks).length > 0 ? (
                  Object.entries(customNetworks).map(([id, network]) => (
                    <div 
                      key={id} 
                      className="flex items-center justify-between p-3 border rounded-md"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${network.isTestnet ? 'bg-yellow-500' : 'bg-green-500'}`} />
                        <div>
                          <h4 className="font-medium">{network.name}</h4>
                          <p className="text-xs text-muted-foreground">ID: {id} • Chain ID: {network.chainId}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveNetwork(id)}
                      >
                        <Trash2 size={16} className="text-destructive" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <p>No custom networks added yet</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Network Switcher component
function NetworkSwitcher() {
  const { currentNetwork, availableNetworks, switchNetwork, isLoading } = useWallet();
  
  const handleSwitchNetwork = async (networkId: string) => {
    await switchNetwork(networkId);
  };
  
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" disabled={isLoading} className="h-8 text-xs">
            <span className={`w-2 h-2 rounded-full ${currentNetwork.isTestnet ? 'bg-yellow-500' : 'bg-green-500'} mr-2`} />
            {currentNetwork.name}
            <ChevronDown size={14} className="ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>Select Network</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {Object.entries(availableNetworks).map(([id, network]) => (
            <DropdownMenuItem
              key={id}
              onClick={() => handleSwitchNetwork(id)}
              disabled={network.name === currentNetwork.name}
              className={network.name === currentNetwork.name ? "bg-muted" : ""}
            >
              <div className="flex items-center w-full">
                <span 
                  className={`w-2 h-2 rounded-full mr-2 ${
                    network.isTestnet ? "bg-yellow-500" : "bg-green-500"
                  }`} 
                />
                <span className="flex-1">{network.name}</span>
                {network.name === currentNetwork.name && (
                  <Check size={14} className="text-primary" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      <AddNetworkDialog />
    </div>
  );
}

// Token interfaces
interface TokenItemProps {
  token: TokenWithBalance;
  onSelect: (token: TokenWithBalance) => void;
}

// TokenItem component
function TokenItem({ token, onSelect }: TokenItemProps) {
  return (
    <div 
      className="flex items-center p-2 hover:bg-muted rounded-md cursor-pointer"
      onClick={() => onSelect(token)}
    >
      <div className="w-8 h-8 mr-3 rounded-full flex items-center justify-center bg-muted">
        {token.logoURI ? (
          <img 
            src={token.logoURI} 
            alt={token.symbol} 
            className="w-6 h-6 rounded-full" 
            onError={(e) => {
              e.currentTarget.src = '';
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
            {token.symbol.substring(0, 2)}
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1">
        <div className="font-medium text-sm">{token.symbol}</div>
        <div className="text-xs text-muted-foreground">{token.name}</div>
      </div>
      <div className="text-right">
        <div className="font-medium text-sm">{parseFloat(token.formattedBalance).toFixed(4)}</div>
        <div className="text-xs text-muted-foreground">
          {token.symbol}
        </div>
      </div>
    </div>
  );
}

// Interface for the token to send
interface SendableToken {
  address?: string;
  symbol: string;
  name: string;
  formattedBalance: string;
  decimals: number;
  logoURI?: string;
}

// SendToken dialog props
interface SendTokenDialogProps {
  isOpen: boolean;
  onClose: () => void;
  token: SendableToken;
}

// SendTokenDialog component
function SendTokenDialog({ isOpen, onClose, token }: SendTokenDialogProps) {
  const { sendTransaction, sendToken, isLoading, currentNetwork } = useWallet();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  
  const isNativeToken = !token.address;
  const handleSend = async () => {
    if (isNativeToken) {
      await sendTransaction(recipientAddress, amount);
    } else {
      await sendToken(token.address as string, recipientAddress, amount);
    }
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{`Send ${token.symbol}`}</DialogTitle>
          <DialogDescription>
            Enter the recipient address and amount to send.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Token info */}
          <div className="flex items-center p-2 bg-muted rounded-md">
            <div className="w-8 h-8 mr-3 rounded-full flex items-center justify-center bg-background">
              {token.logoURI ? (
                <img 
                  src={token.logoURI} 
                  alt={token.symbol} 
                  className="w-6 h-6 rounded-full" 
                  onError={(e) => {
                    e.currentTarget.src = '';
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-bold">
                  {token.symbol.substring(0, 2)}
                </div>
              )}
            </div>
            <div className="flex flex-col flex-1">
              <div className="font-medium">{token.symbol}</div>
              <div className="text-xs text-muted-foreground">{token.name}</div>
            </div>
            <div className="text-right">
              <div className="font-medium">{parseFloat(token.formattedBalance).toFixed(4)}</div>
              <div className="text-xs text-muted-foreground">
                {token.symbol}
              </div>
            </div>
          </div>
          
          {/* Recipient address */}
          <div className="grid gap-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input 
              id="recipient"
              placeholder="0x..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
            />
          </div>
          
          {/* Amount */}
          <div className="grid gap-2">
            <div className="flex justify-between">
              <Label htmlFor="amount">Amount</Label>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setAmount(token.formattedBalance)}
                className="h-5 text-xs px-2"
              >
                Max
              </Button>
            </div>
            <Input 
              id="amount"
              type="number"
              placeholder="0.0"
              min="0"
              step="0.001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            onClick={handleSend} 
            disabled={!recipientAddress || !amount || isLoading}
          >
            {isLoading ? (
              <>
                <Loader size={16} className="mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send size={16} className="mr-2" />
                Send {token.symbol}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Transaction icon props
interface TransactionIconProps {
  type: TransactionType;
  status: TransactionStatus;
}

// Transaction icon based on type and status
function TransactionIcon({ type, status }: TransactionIconProps) {
  const getIcon = () => {
    if (status === TransactionStatus.PENDING) {
      return <Loader size={16} className="animate-spin" />;
    }
    
    if (status === TransactionStatus.FAILED) {
      return <AlertTriangle size={16} className="text-destructive" />;
    }
    
    switch (type) {
      case TransactionType.SEND:
        return <ArrowUpRight size={16} className="text-orange-500" />;
      case TransactionType.RECEIVE:
        return <ArrowDownLeft size={16} className="text-green-500" />;
      case TransactionType.TOKEN_SEND:
        return <ArrowUpRight size={16} className="text-orange-500" />;
      case TransactionType.TOKEN_RECEIVE:
        return <ArrowDownLeft size={16} className="text-green-500" />;
      case TransactionType.CONTRACT_INTERACTION:
        return <FileText size={16} className="text-blue-500" />;
      default:
        return <FileText size={16} />;
    }
  };
  
  return (
    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
      {getIcon()}
    </div>
  );
}

// Transaction item props
interface TransactionItemProps {
  tx: TransactionRecord;
  formatAddress: (address: string) => string;
  getExplorerUrl: (hashOrAddress: string, type: 'address' | 'tx') => string;
}

// Transaction item component
function TransactionItem({ tx, formatAddress, getExplorerUrl }: TransactionItemProps) {
  const getTitle = () => {
    switch (tx.type) {
      case TransactionType.SEND:
        return 'Sent ETH';
      case TransactionType.RECEIVE:
        return 'Received ETH';
      case TransactionType.TOKEN_SEND:
        return `Sent ${tx.metadata?.tokenSymbol || 'Token'}`;
      case TransactionType.TOKEN_RECEIVE:
        return `Received ${tx.metadata?.tokenSymbol || 'Token'}`;
      case TransactionType.CONTRACT_INTERACTION:
        return 'Contract Interaction';
      default:
        return 'Transaction';
    }
  };
  
  const getStatusClass = () => {
    switch (tx.status) {
      case TransactionStatus.PENDING:
        return 'text-yellow-500';
      case TransactionStatus.CONFIRMED:
        return 'text-green-500';
      case TransactionStatus.FAILED:
        return 'text-destructive';
      default:
        return '';
    }
  };
  
  const getStatusText = () => {
    switch (tx.status) {
      case TransactionStatus.PENDING:
        return 'Pending';
      case TransactionStatus.CONFIRMED:
        return 'Completed';
      case TransactionStatus.FAILED:
        return 'Failed';
      default:
        return '';
    }
  };
  
  const openInExplorer = () => {
    window.open(getExplorerUrl(tx.hash, 'tx'), '_blank');
  };
  
  const date = new Date(tx.timestamp);
  const formattedDate = date.toLocaleDateString();
  const formattedTime = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  return (
    <div className="flex items-center p-3 hover:bg-muted rounded-md cursor-pointer" onClick={openInExplorer}>
      <TransactionIcon type={tx.type} status={tx.status} />
      <div className="flex flex-col ml-3 flex-1">
        <div className="flex justify-between">
          <div className="font-medium text-sm">{getTitle()}</div>
          <div className="text-sm">
            {tx.type === TransactionType.SEND || tx.type === TransactionType.TOKEN_SEND ? '-' : '+'}
            {tx.type === TransactionType.TOKEN_SEND || tx.type === TransactionType.TOKEN_RECEIVE 
              ? tx.metadata?.tokenAmount || '0'
              : ethers.utils.formatEther(tx.value || '0')
            }
            {tx.type === TransactionType.TOKEN_SEND || tx.type === TransactionType.TOKEN_RECEIVE 
              ? ` ${tx.metadata?.tokenSymbol || 'Tokens'}`
              : ' ETH'
            }
          </div>
        </div>
        <div className="flex justify-between mt-1">
          <div className="text-xs text-muted-foreground">
            {formattedDate} {formattedTime}
          </div>
          <div className={`text-xs ${getStatusClass()}`}>
            {getStatusText()}
          </div>
        </div>
      </div>
    </div>
  );
}

export function Wallet() {
  const { 
    walletAddress, 
    walletBalance, 
    isLoading, 
    refreshBalance,
    refreshTokens,
    refreshTransactions,
    formatAddress,
    getExplorerUrl,
    tokens,
    transactions,
    currentNetwork
  } = useWallet();
  
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedToken, setSelectedToken] = useState<SendableToken | null>(null);
  
  // Copy address to clipboard
  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      });
    }
  };
  
  // Open address in block explorer
  const openInExplorer = () => {
    if (walletAddress) {
      window.open(getExplorerUrl(walletAddress, 'address'), '_blank');
    }
  };
  
  // Handle token selection for sending
  const handleSendToken = (token: TokenWithBalance) => {
    setSelectedToken(token);
    setSendDialogOpen(true);
  };
  
  // Handle native token send
  const handleSendNative = () => {
    setSelectedToken({
      symbol: currentNetwork.currencySymbol,
      name: currentNetwork.name + ' ' + currentNetwork.currencySymbol,
      formattedBalance: walletBalance,
      decimals: 18
    });
    setSendDialogOpen(true);
  };
  
  // Manual refresh of all data
  const handleRefresh = async () => {
    await Promise.all([
      refreshBalance(),
      refreshTokens(),
      refreshTransactions()
    ]);
    
    toast({
      title: "Refreshed",
      description: "Wallet data updated"
    });
  };
  
  if (!walletAddress) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center h-40">
            <p className="text-muted-foreground">No wallet connected</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Ethereum Wallet</CardTitle>
          <div className="flex items-center gap-2">
            <NetworkSwitcher />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-8 w-8"
            >
              <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
            </Button>
          </div>
        </div>
        <CardDescription>
          Manage your cryptocurrency
        </CardDescription>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs defaultValue="balance" className="w-full">
          <div className="px-6 pt-2 pb-0">
            <TabsList className="w-full">
              <TabsTrigger value="balance" className="flex-1">Balance</TabsTrigger>
              <TabsTrigger value="tokens" className="flex-1">Tokens</TabsTrigger>
              <TabsTrigger value="activity" className="flex-1">Activity</TabsTrigger>
            </TabsList>
          </div>
          
          {/* Balance tab */}
          <TabsContent value="balance" className="p-6 pt-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="flex flex-col space-y-4">
                {/* Balance display */}
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">Current Balance</span>
                  <div className="flex items-end gap-2">
                    <span className="text-3xl font-bold">
                      {parseFloat(walletBalance).toFixed(4)}
                    </span>
                    <span className="text-muted-foreground mb-1">
                      {currentNetwork.currencySymbol}
                    </span>
                  </div>
                </div>
                
                {/* Address display */}
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground">Your Address</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-background rounded px-2 py-1 text-xs break-all">
                      {walletAddress}
                    </code>
                    <Button variant="ghost" size="icon" onClick={copyAddress} className="h-7 w-7">
                      <Copy size={14} />
                    </Button>
                  </div>
                </div>
                
                {/* Buttons */}
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button 
                    variant="default" 
                    className="w-full flex items-center gap-2"
                    onClick={handleSendNative}
                  >
                    <Send size={14} />
                    Send {currentNetwork.currencySymbol}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center gap-2"
                    onClick={openInExplorer}
                  >
                    <ExternalLink size={14} />
                    View on Explorer
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Tokens tab */}
          <TabsContent value="tokens" className="px-0 py-2">
            <div className="px-6 pb-2 flex justify-between items-center">
              <h3 className="text-sm font-medium">Your Tokens</h3>
              <AddTokenDialog />
            </div>
            
            <ScrollArea className="h-[350px] pr-6">
              <div className="space-y-1 px-6">
                {tokens.length > 0 ? (
                  tokens.map((token) => (
                    <TokenItem
                      key={token.address}
                      token={token}
                      onSelect={handleSendToken}
                    />
                  ))
                ) : (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    <p>No tokens found on this network</p>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="px-6 pt-2">
              <Separator />
              <p className="text-xs text-muted-foreground mt-2">
                Only showing tokens on {currentNetwork.name}. Switch networks to see tokens on other chains.
              </p>
            </div>
          </TabsContent>
          
          {/* Activity tab */}
          <TabsContent value="activity" className="px-0 py-2">
            <ScrollArea className="h-[380px] pr-6">
              <div className="space-y-1 px-6">
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <TransactionItem
                      key={tx.id}
                      tx={tx}
                      formatAddress={formatAddress}
                      getExplorerUrl={getExplorerUrl}
                    />
                  ))
                ) : (
                  <div className="py-4 text-center text-sm text-muted-foreground">
                    <p>No transactions found on this network</p>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <div className="px-6 pt-2">
              <Separator />
              <p className="text-xs text-muted-foreground mt-2">
                Only showing recent transactions on {currentNetwork.name}.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-1 pb-4 px-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock size={12} />
          <span>{currentNetwork.name}</span>
        </div>
        <div>
          {formatAddress(walletAddress)}
        </div>
      </CardFooter>
      
      {/* Send token dialog */}
      {selectedToken && (
        <SendTokenDialog
          isOpen={sendDialogOpen}
          onClose={() => setSendDialogOpen(false)}
          token={selectedToken}
        />
      )}
    </Card>
  );
} 