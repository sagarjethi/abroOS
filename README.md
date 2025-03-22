# abroOs - Desktop Environment Portfolio Project 🎨

![abroOs Desktop](https://example.com/abroos-preview.png)

## Overview

abroOs is an interactive, web-based desktop operating system environment built as a portfolio project, drawing inspiration from Dustin Brett's daedalOS as well as LinuxOnTheWeb. It demonstrates a wide range of frontend and systems programming skills, focusing on a blend of user experience, scalability, and optimization. The goal is to emulate desktop-like functionality, providing a platform where users can interact with applications, files, and features within a web browser.

## Features

- 💻 Full desktop environment with window management
- 🪟 Draggable, resizable, and focusable windows
- 📁 File system with create, rename, delete operations
- 🖱️ Context menus for desktop and files
- 📱 Responsive design that works across devices
- 🔄 Persistent state with localStorage and Origin Private File System
- ⚙️ System applications including:
  - File Explorer
  - Text Editor
  - Weather App
  - Calculator
  - Calendar
  - Memory Game
  - Browser
  - Code Indexer

## Technologies Used

- **TypeScript**: Strongly typed, good for scalable and maintainable code
- **React/Next.js**: For dynamic rendering and routing
- **Shadcn UI**: Component library built on Radix UI
- **Tailwind CSS**: For styling and responsive design
- **Framer Motion**: For fluid animations and transitions
- **Lucide React**: For consistent iconography
- **LocalStorage/OPFS**: For data persistence

## Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/abroos.git

# Navigate to the project directory
cd abroos

# Install dependencies
yarn install

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

## Resources & Inspirations

- [LinuxOnTheWeb](https://linuxontheweb.org/) - A web-based Linux environment
- [Dustin Brett's daedalOS](https://github.com/DustinBrett/daedalOS) - A web-based desktop experience that inspired this project

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

Special thanks to the open-source community and all the developers who created the libraries and tools that made this project possible.
