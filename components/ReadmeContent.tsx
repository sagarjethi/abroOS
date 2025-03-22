"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkEmoji from 'remark-emoji';

const readmeContent = `# abroOs - Desktop Environment Portfolio Project 🎨

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

## Architecture

The application is built using a component-based architecture with React:

- **Window Management**: Managed through the WindowsContext
- **File System**: Implemented with the FileSystemContext
- **Desktop Environment**: Handles icon display and interaction
- **Applications**: Standalone components that run within windows

## Technical Highlights

- **React Context API**: Used for global state management (windows, file system)
- **Custom Hooks**: For functionality like drag and drop, context menus, and window focus
- **LocalStorage/OPFS Integration**: For persistent file storage
- **Dynamic Component Loading**: For efficient application rendering
- **Responsive Design**: Works across different screen sizes
- **Tailwind CSS**: For consistent and maintainable styling

## Getting Started

\`\`\`bash
# Clone the repository
git clone https://github.com/sagarjethi/abroOS.git

# Navigate to the project directory
cd abroOS

# Install dependencies
yarn install

# Start the development server
yarn dev

# Build for production
yarn build
\`\`\`

## Resources & Inspirations

- [LinuxOnTheWeb](https://linuxontheweb.org/) - A web-based Linux environment
- [Dustin Brett's daedalOS](https://github.com/DustinBrett/daedalOS) - A web-based desktop experience that inspired this project

## Contributing

Contributions are welcome! Please see the CONTRIBUTING.md file for guidelines on how to contribute to this project.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

Special thanks to the open-source community and all the developers who created the libraries and tools that made this project possible.`;

export function ReadmeContent() {
  return (
    <ScrollArea className="h-full">
      <div className="prose dark:prose-invert max-w-none p-8">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkEmoji]}
          components={{
            img: ({ src, alt, ...props }) => (
              <img
                src={src}
                alt={alt}
                className="inline-block"
                style={{ margin: '0 auto' }}
                {...props}
              />
            ),
          }}
        >
          {readmeContent}
        </ReactMarkdown>
      </div>
    </ScrollArea>
  );
}