# Contributing to abroOs

Thank you for your interest in contributing to abroOs! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with the following information:
- A clear, descriptive title
- Steps to reproduce the issue
- Expected behavior and what actually happened
- Screenshots if applicable
- Any additional context that might be helpful

### Suggesting Features

Feature suggestions are welcome! Please provide:
- A clear description of the feature
- Why this feature would be beneficial
- Any implementation ideas you have

### Pull Requests

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Run the tests (if available)
5. Commit your changes (`git commit -m 'Add some feature'`)
6. Push to your branch (`git push origin feature/your-feature`)
7. Open a Pull Request

## Development Setup

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/abroos.git
   cd abroos
   ```

2. Install dependencies
   ```bash
   yarn install
   ```

3. Start the development server
   ```bash
   yarn dev
   ```

## Coding Standards

- Use TypeScript for all new code
- Follow the existing code style
- Use functional components with hooks
- Write descriptive commit messages
- Document your code with comments where necessary

## Project Structure

- `app/` - Next.js app directory
- `components/` - React components
- `contexts/` - React contexts for state management
- `hooks/` - Custom React hooks
- `lib/` - Utility functions and services
- `public/` - Static assets
- `styles/` - CSS and Tailwind configuration
- `types/` - TypeScript type definitions

## Testing

- Test your changes thoroughly before submitting a pull request
- Write tests for new features if applicable

## Thank You

Your contributions help make this project better for everyone. We appreciate your time and effort! 