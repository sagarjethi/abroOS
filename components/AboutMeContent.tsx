"use client";

export function AboutMeContent() {
  return (
    <div className="prose dark:prose-invert max-w-none">
      <h1>About abroOs</h1>
      <p>
        Welcome to abroOs! This is an interactive desktop environment built as a portfolio project. 
        It showcases modern web development techniques and UI/UX principles to create a responsive, 
        intuitive desktop experience right in your browser. Inspired by projects like Dustin Brett's daedalOS 
        and LinuxOnTheWeb, abroOs demonstrates how web technologies can create immersive, application-like experiences.
      </p>
      <h2>Key Technologies</h2>
      <ul>
        <li>TypeScript & React/Next.js</li>
        <li>Shadcn UI & Radix UI Components</li>
        <li>Tailwind CSS for Styling</li>
        <li>Custom Window Management System</li>
        <li>Origin Private File System API</li>
      </ul>
      <h2>Features</h2>
      <ul>
        <li>Draggable & Resizable Windows</li>
        <li>Multiple Applications</li>
        <li>File System with Persistence</li>
        <li>Context Menus & Taskbar</li>
        <li>Responsive Design</li>
      </ul>
      <br></br>
      <h2>
        Feel free to explore the desktop environment and all its features!
      </h2>
    </div>
  );
}
