# Ethereum Wallet Components

This directory contains components for the Ethereum wallet functionality in the AbroOS application.

## Components Overview

### EthereumWalletWrapper

The `EthereumWalletWrapper` component provides:

- **Auto-reconnection**: Automatically reconnects to a previously connected wallet on page reload if credentials were saved
- **Secure credential storage**: Manages secure storage of wallet credentials with a "Remember Me" feature
- **Reconnection prompts**: Shows a reconnection prompt if auto-reconnect is disabled but saved credentials exist

```tsx
import { EthereumWalletWrapper } from '@/components/wallet/EthereumWalletWrapper';

// In your component:
<EthereumWalletWrapper>
  {/* Your wallet UI components */}
</EthereumWalletWrapper>
```

#### Props

- `children`: React nodes to render inside the wrapper
- `autoReconnect`: Boolean flag to enable/disable auto-reconnection (default: true)
- `showReconnectPrompt`: Boolean flag to show/hide the reconnect prompt (default: true)

### WalletApp

The main wallet application component that integrates:

- Wallet connection and creation forms
- Token and transaction management
- Wallet assistant chat interface
- Network switching
- "Remember Me" functionality for persistent sessions

### useWalletPersistence Hook

A custom hook for managing wallet credential persistence:

```tsx
import { useWalletPersistence } from '@/components/wallet/EthereumWalletWrapper';

function MyComponent() {
  const { saveCredentials, clearCredentials } = useWalletPersistence();
  
  // Save credentials
  const handleLogin = (username, password, rememberMe) => {
    // Login logic...
    
    // Save credentials if rememberMe is true
    if (rememberMe) {
      saveCredentials(username, password, rememberMe);
    }
  };
  
  // Clear credentials on logout
  const handleLogout = () => {
    // Logout logic...
    clearCredentials();
  };
}
```

## Security Features

- Credentials are secured using local storage encryption
- Auto-lock timeout for wallet sessions
- Clear credentials on disconnect
- Wallet browser ID verification
- Password-based key derivation with salt and iterations

## Usage Example

```tsx
import { WalletApp } from '@/components/wallet/WalletApp';
import { EthereumWalletWrapper } from '@/components/wallet/EthereumWalletWrapper';
import { WalletProvider } from '@/contexts/WalletContext';

function MyApp() {
  return (
    <WalletProvider>
      <EthereumWalletWrapper>
        <WalletApp onClose={() => {/* close handler */}} />
      </EthereumWalletWrapper>
    </WalletProvider>
  );
}
```

## Wallet Context

The `WalletContext` provides the following state and operations:

- **Wallet State**: wallet, address, isConnected, isLoading, walletExists
- **Network State**: currentNetwork, availableNetworks, customNetworks, network
- **Wallet Operations**: connect, createWallet, disconnect, clearWallet
- **Network Operations**: setNetwork, addCustomNetwork, removeCustomNetwork, switchNetwork
- **Transaction Operations**: sendNativeCurrency, sendToken, getNativeBalance, getTokenBalance
- **Signing Operations**: signMessage, signTypedData
- **Contract Operations**: callContractMethod, executeContractMethod
- **Utility Functions**: getExplorerUrl, formatAddress 