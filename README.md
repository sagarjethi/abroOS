# abroOs - Desktop Environment Portfolio Project 🎨


## Overview

abroOs is an interactive, web-based desktop operating system environment built as a portfolio project, drawing inspiration from Dustin Brett's daedalOS as well as LinuxOnTheWeb. It demonstrates a wide range of frontend and systems programming skills, focusing on a blend of user experience, scalability, and optimization. The goal is to emulate desktop-like functionality, providing a platform where users can interact with applications, files, and features within a web browser.

## Featured Products

### 0G Storage 💾

0G Storage is a decentralized file storage solution built on the 0G network. It allows you to:

- **Store files securely** on the decentralized 0G network
- **Access your files** from anywhere with a wallet connection
- **No central points of failure** compared to traditional storage
- **Transparent fees** with preview before upload
- **Testnet integration** for development and testing

The 0G Storage application in abroOs provides a seamless interface for:
- Uploading files to the 0G network
- Browsing your stored files
- Downloading files when needed
- Tracking your storage activity
- Viewing transaction details on the block explorer

### 0G Compute ⚡

0G Compute provides decentralized computing resources for demanding tasks. Key features include:

- **Scalable compute power** for AI, rendering, and data processing
- **Pay-as-you-go pricing** for efficient resource usage
- **Multiple service tiers** for different performance needs
- **API-based integration** with secure authentication
- **Real-time chat interface** for interacting with compute services

The 0G Compute application in abroOs includes:
- Service selection from available compute options
- Interactive chat interface for queries and tasks
- Real-time responses from the compute network
- API key management and service status monitoring
- Settings configuration for optimal performance

### Ethereum Wallet Integration 💼

The abroOs environment includes a fully-featured Ethereum wallet that integrates with 0G services:

- **AI-powered wallet assistant** for guided interactions
- **Transaction management** for 0G storage payments
- **Network switching** to connect to 0G Testnet
- **Secure account creation** with encrypted storage
- **Real-time balance and token updates**

The wallet integration provides:
- Seamless connection to 0G services
- Payment processing for storage and compute resources
- Transaction history with explorer links
- Simplified wallet creation and management
- Interactive help through AI assistant

## Features

- 💻 Full desktop environment with window management
- 🪟 Draggable, resizable, and focusable windows
- 📁 File system with create, rename, delete operations
- 🖱️ Context menus for desktop and files
- 📱 Responsive design that works across devices
- 🔄 Persistent state with localStorage and Origin Private File System
- 🤖 AI Agent Integration with Zero-Knowledge Proofs
- 🔒 Trusted Execution Environment (TEE) Support
- 💾 Decentralized Storage with 0G Storage
- ⚡ Decentralized Computing with 0G Compute
- 💼 Ethereum Wallet with 0G Integration
- ⚙️ System applications including:
  - File Explorer
  - Text Editor
  - Weather App
  - Calculator
  - Calendar
  - Memory Game
  - Browser
  - Code Indexer
  - ZK Prover Service
  - TEE Manager
  - 0G Storage App
  - 0G Compute Window
  - Ethereum Wallet

## Technologies Used

- **TypeScript**: Strongly typed, good for scalable and maintainable code
- **React/Next.js**: For dynamic rendering and routing
- **Shadcn UI**: Component library built on Radix UI
- **Tailwind CSS**: For styling and responsive design
- **Framer Motion**: For fluid animations and transitions
- **Lucide React**: For consistent iconography
- **LocalStorage/OPFS**: For data persistence
- **WebAssembly**: For high-performance ZK proof generation
- **Rust**: For secure and efficient ZK prover implementation
- **TEE SDK**: For trusted execution environment support
- **Ethers.js**: For blockchain interactions
- **0G SDK**: For integration with 0G Storage and Compute services

## Decentralized Services Integration

### 0G Storage Integration

The 0G Storage component provides a user-friendly interface to the decentralized 0G storage network:

- **Wallet Integration**: Seamlessly connect your crypto wallet
- **File Management**: Upload, download, and manage files stored on the 0G network
- **Fee Transparency**: View storage fees before confirming uploads
- **Progress Tracking**: Real-time progress indicators for upload and download operations
- **Network Status**: Monitor 0G network health and connectivity
- **Block Explorer Links**: View transaction details on the 0G block explorer

### 0G Compute Integration

The 0G Compute window provides access to decentralized computing resources:

- **Service Selection**: Choose from available compute services
- **Chat Interface**: Interact with compute services through natural language
- **API Key Management**: Securely store and manage your 0G Compute API keys
- **Service Status**: Monitor the availability and status of compute services
- **Response History**: View and reference previous compute responses
- **Settings Configuration**: Customize your compute environment

### Wallet System

The integrated wallet system provides essential functionality for interacting with 0G services:

- **AI-Powered Assistant**: Get help with wallet operations through interactive chat
- **Account Management**: Create, restore, and manage Ethereum accounts
- **Network Selection**: Switch between different networks including 0G Testnet
- **Transaction Handling**: Send, receive, and monitor transactions
- **Gas Fee Management**: Understand and control transaction fees
- **Token Support**: View and manage various ERC-20 tokens
- **Security Features**: Encrypted storage and secure transaction signing
- **Integration with 0G**: Seamless interaction with 0G Storage and Compute services

## AI Agent & ZK Proof Support

The project includes an advanced AI agent system with zero-knowledge proof capabilities:

- 🤖 **AI Agent Integration**
  - Natural language processing for user interactions
  - Context-aware assistance and task automation
  - Secure communication with TEE
  - Real-time response generation

- 🔐 **Zero-Knowledge Proof System**
  - Human typing pattern verification
  - Image transformation proofs
  - Secure proof generation and verification
  - On-chain proof verification support

## Trusted Execution Environment (TEE)

The system implements TEE support for enhanced security:

- 🔒 **Hardware-Level Security**
  - Secure enclave execution
  - Protected memory regions
  - Hardware attestation
  - Secure key storage

- 🔐 **Secure Operations**
  - Protected AI model inference
  - Secure proof generation
  - Encrypted data processing
  - Secure key management

## Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/abroos.git

# Navigate to the project directory
cd abroos

# Install dependencies
yarn install

# Install 0G SDK
yarn add @0glabs/0g-ts-sdk

# Build the ZK prover
yarn build:zk-prover

# Start the development server
yarn dev

# Build for production
yarn build
```

## Architecture

The application is built using a component-based architecture with React:

- **Window Management**: Managed through the WindowsContext
- **File System**: Implemented with the FileSystemContext
- **Desktop Environment**: Handles icon display and interaction
- **Applications**: Standalone components that run within windows
- **0G Integration**: Components for interacting with 0G Storage and Compute services
- **Wallet System**: Manages blockchain wallet connections and transactions
- **AI Agent**: Manages user interactions and task automation
- **ZK Prover**: Handles zero-knowledge proof generation and verification
- **TEE Manager**: Manages secure execution environment operations

## Using 0G Services

### 0G Storage

1. Click on the "0G Storage" icon on the desktop
2. Connect your wallet when prompted (or create one)
3. Browse your existing files or upload new ones
4. View file details and download when needed
5. Check transaction details on the 0G block explorer

### 0G Compute

1. Click on the "0G Compute" icon on the desktop
2. Enter your API key in the Settings tab
3. Select a compute service from the dropdown
4. Type your query or task in the chat interface
5. View the computed response in real-time

### Ethereum Wallet

1. Click on the "Ethereum Wallet" icon on the desktop
2. Create a new wallet or import an existing one
3. Switch to the 0G Testnet network for 0G services
4. Use the chat assistant for help with operations
5. Manage transactions and balances for 0G services

## Resources & Inspirations

- [0G Network](https://0g.ai/) - Decentralized storage and compute network
- [LinuxOnTheWeb](https://linuxontheweb.org/) - A web-based Linux environment
- [Dustin Brett's daedalOS](https://github.com/DustinBrett/daedalOS) - A web-based desktop experience that inspired this project
- [Intel SGX](https://www.intel.com/content/www/us/en/developer/tools/software-guard-extensions-sdk/overview.html) - For TEE implementation
- [WebAssembly](https://webassembly.org/) - For high-performance ZK proof generation

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

Special thanks to the open-source community, the 0G network team, and all the developers who created the libraries and tools that made this project possible.
