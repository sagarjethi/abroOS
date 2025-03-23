"use client";

import { useWindows } from "@/contexts/WindowsContext";
import { useFileSystem } from "@/contexts/FileSystemContext";
import Window from "@/components/Window";
import {
  Terminal,
  Calculator,
  Monitor,
  Info,
  FileEdit,
  FileQuestion,
  Layout,
  Cloud,
  Calendar as CalendarIcon,
  HardDrive,
  Folder,
  Globe,
  Code,
  Wallet as WalletIcon,
  FileText,
  Gamepad2,
  CloudSun,
  Settings,
  FolderIcon,
  Trash,
  CreditCard,
  Search,
  Sparkles,
  Cpu,
  PenLine,
  Database,
  type LucideIcon
} from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { DesktopGrid } from "./desktop/DesktopGrid";
import { DesktopIcon } from "./desktop/DesktopIcon";
import { FileExplorer } from "./FileExplorer";
import { AboutMeContent } from "./AboutMeContent";
import { TextEditor } from "./TextEditor";
import { useContextMenu } from "@/hooks/useContextMenu";
import { generateRandomColor } from "@/lib/utils";
import type { AppIcon, WindowContent } from "@/types/global";
import { Calculator as CalculatorApp } from "./Calculator";
import { ReadmeContent } from "./ReadmeContent";
import { MemoryGame } from "./MemoryGame";
import { WeatherApp } from "./WeatherApp";
import { Calendar } from "./Calender";
import { FileSystemExplorer } from "./FileSystemExplorer";
import { WalletApp } from "./wallet/WalletApp";
import { ZeroGFileApp } from "./wallet/ZeroGFileApp";
import { SecureAccountApp } from "./wallet/SecureAccountApp";
import ContextMenu from './ContextMenu';
import styles from '../styles/Desktop.module.css';
import { fileSystem } from '@/lib/fileSystem';
import { AISearchWidget } from "./ai-search/AISearchWidget";
import { AISearchAgent, AI_MODES } from "./ai-search/AISearchAgent";
import { ZeroGComputeWindow } from "./desktop/ZeroGComputeWindow";
import { ZKHumanTypingEditor } from "./ZKHumanTypingEditor";
import { SecretVaultShortcut } from "./nillion/SecretVaultShortcut";
import { SecretVaultApp } from "./nillion/SecretVaultApp";

// First, let's define our default icons outside the component to keep it clean
const DEFAULT_ICONS: AppIcon[] = [
  { id: "myPC", title: "My PC", icon: Monitor, x: 0, y: 0, color: "text-indigo-400", type: "app", isSystemApp: true },
  { id: "fileSystem", title: "Files", icon: HardDrive, x: 0, y: 1, color: "text-emerald-400", type: "app" },
  { id: "textEditor", title: "Text Editor", icon: FileEdit, x: 1, y: 1, color: "text-orange-400", type: "app" },
  { id: "calculator", title: "Calculator", icon: Calculator, x: 0, y: 2, color: "text-yellow-400", type: "app" },
  { id: "browser", title: "Browser", icon: Globe, x: 1, y: 2, color: "text-blue-500", type: "app" },
  { id: "calendar", title: "Calendar", icon: CalendarIcon, x: 0, y: 3, color: "text-rose-400", type: "app" },
  { id: "weather", title: "Weather", icon: CloudSun, x: 1, y: 3, color: "text-sky-400", type: "app" },
  { id: "memory", title: "Memory Game", icon: Gamepad2, x: 0, y: 4, color: "text-purple-400", type: "app" },
  { id: "aboutMe", title: "About Me", icon: Info, x: 1, y: 4, color: "text-cyan-400", type: "file" },
  { id: "readme", title: "README", icon: FileQuestion, x: 0, y: 5, color: "text-blue-400", type: "app" },
  { id: "aiSearch", title: "AI Search", icon: Sparkles, x: 1, y: 5, color: "text-amber-500", type: "app" },
  { id: "wallet", title: "Ethereum Wallet", icon: WalletIcon, x: 0, y: 6, color: "text-purple-500", type: "app" },
  { id: "0gfiles", title: "0G Storage", icon: HardDrive, x: 1, y: 6, color: "text-blue-400", type: "app" },
  { id: "zkTypingProof", title: "ZK Human Blog", icon: PenLine, x: 1, y: 7, color: "text-purple-400", type: "app" },
  { id: "0gCompute", title: "0G Compute", icon: Cpu, x: 0, y: 7, color: "text-teal-500", type: "app", isDesktopApp: true },
  { id: "secretVault", title: "Nillion SecretVault", icon: Database, x: 1, y: 8, color: "text-indigo-500", type: "app", isDesktopApp: true },
  { id: "secureAccount", title: "Secure Accounts", icon: CreditCard, x: 0, y: 8, color: "text-green-500", type: "app" },
];

const LOCAL_STORAGE_KEY = 'desktop-icons-v2';

interface DesktopProps {
  currentUser?: string;
}

export default function Desktop({ currentUser = 'User' }: DesktopProps) {
  const { windows, openWindow, isWindowOpen, focusWindow, closeWindow } = useWindows();
  
  const { 
    files, 
    desktopItems, 
    createFile, 
    createFolder, 
    deleteItem, 
    renameItem, 
    updateItemContent, 
    getItemContent,
    sortItems,
    isInitialized,
    systemApps,
    updateIconPosition,
    updateIconTitle,
    deleteIcon
  } = useFileSystem();
  
  const desktopRef = useRef<HTMLDivElement>(null);
  const { menuProps, handleContextMenu: handleGridContextMenu, closeMenu } = useContextMenu({ containerRef: desktopRef });
  
  // Replace your existing icon state management with this
  const [icons, setIcons] = useState<AppIcon[]>(() => {
    // Try to load from localStorage on initial render
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedData) {
          const parsedData = JSON.parse(savedData);
          if (Array.isArray(parsedData) && parsedData.length > 0) {
            // Create a map of default icons for reference
            const defaultIconMap = DEFAULT_ICONS.reduce((map, icon) => {
              map[icon.id] = icon;
              return map;
            }, {} as Record<string, AppIcon>);
            
            // Process saved icons and merge with defaults
            const mergedIcons = parsedData.map((savedIcon: any) => {
              const defaultIcon = defaultIconMap[savedIcon.id];
              if (defaultIcon) {
                return {
                  ...defaultIcon,
                  x: savedIcon.x,
                  y: savedIcon.y,
                  title: savedIcon.title || defaultIcon.title,
                  color: savedIcon.color || defaultIcon.color,
                  icon: defaultIcon.icon // Ensure we use the icon from default icons
                };
              }
              // For custom icons, ensure they have a valid icon component
              return {
                ...savedIcon,
                icon: savedIcon.type === 'file' ? FileText :
                      savedIcon.type === 'folder' ? Folder :
                      FileQuestion // Default icon
              };
            });
            
            console.log('Loaded icons from localStorage:', mergedIcons);
            return mergedIcons;
          }
        }
      }
    } catch (error) {
      console.error('Error loading icons from localStorage:', error);
    }
    
    // Fall back to defaults if loading fails
    return DEFAULT_ICONS;
  });

  // Replace your handleIconsChange function with this simpler version
  const handleIconsChange = useCallback((newIcons: AppIcon[]) => {
    setIcons(newIcons);
    
    // Save directly to localStorage without any debouncing
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const iconData = newIcons.map(icon => ({
          id: icon.id,
          x: icon.x,
          y: icon.y,
          title: icon.title,
          type: icon.type,
          isSystemApp: icon.isSystemApp,
          color: icon.color
        }));
        
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(iconData));
        console.log('Saved icons to localStorage:', iconData);
      }
    } catch (error) {
      console.error('Error saving icons to localStorage:', error);
    }
  }, []);

  const [editingIcon, setEditingIcon] = useState<string | null>(null);
  const [selectedIcons, setSelectedIcons] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number; targetId?: string }>({
    visible: false,
    x: 0,
    y: 0
  });

  const closeContextMenu = useCallback(() => {
    setContextMenu(prev => ({ ...prev, visible: false }));
  }, []);

  const getRandomWindowPosition = useCallback((width: number, height: number) => {
    const centerX = (window.innerWidth - width) / 2;
    const centerY = (window.innerHeight - height - 48) / 2;
    const maxOffset = Math.min(200, Math.min(centerX, centerY) / 2);
    
    const offsetX = (Math.random() - 0.5) * maxOffset * 2;
    const offsetY = (Math.random() - 0.5) * maxOffset * 2;

    return {
      x: Math.max(0, Math.min(window.innerWidth - width, centerX + offsetX)),
      y: Math.max(0, Math.min(window.innerHeight - height - 48, centerY + offsetY))
    };
  }, []);

  const [showSearchWidget, setShowSearchWidget] = useState(true);

  const handleIconOpen = useCallback((icon: AppIcon) => {
    if (isWindowOpen(icon.id)) {
      focusWindow(icon.id);
      return;
    }

    // If this is a desktop app, skip window creation and find the shortcut to click
    if (icon.isDesktopApp) {
      // Find and programmatically click the corresponding desktop app shortcut
      const shortcutElement = document.querySelector(`[data-shortcut="${icon.id}"]`);
      if (shortcutElement) {
        (shortcutElement as HTMLElement).click();
      }
      return;
    }

    let width = 600;
    let height = 400;
    let content: WindowContent = { type: 'default', content: <div>Loading...</div> }; // Default initialization

    switch (icon.id) {
      case 'textEditor':
        width = 800;
        height = 600;
        break;
      case 'calculator':
        width = 300;
        height = 450;
        break;
      case 'memory':
        width = 450;
        height = 600;
        break;
      case 'weather':
        width = 400;
        height = 500;
        break;
      case 'calendar':
        width = 400;
        height = 500;
        break;
      case 'readme':
        width = 900;
        height = 700;
        break;
      case 'fileSystem':
        width = 800;
        height = 600;
        break;
      case 'browser':
        width = 1200;
        height = 800;
        break;
      case 'codeIndexer':
        width = 1000;
        height = 700;
        break;
      case 'wallet':
        width = 500;
        height = 650;
        break;
      case '0gfiles':
        width = 800;
        height = 600;
        break;
      case 'aiSearch':
        width = 800;
        height = 600;
        break;
      case '0gCompute':
        width = 900;
        height = 600;
        break;
      case 'zkTypingProof':
        width = 900;
        height = 600;
        break;
      case 'secureAccount':
        width = 900;
        height = 700;
        break;
    }

    switch (icon.id) {
      case 'myPC':
        content = {
          type: 'file-explorer',
          icons: icons.filter(i => i.id !== 'myPC'),
        };
        break;
      case 'aboutMe':
        content = {
          type: 'about',
          content: <AboutMeContent />
        };
        break;
      case 'calculator':
        content = {
          type: 'default',
          content: <CalculatorApp />
        };
        break;
      case 'memory':
        content = {
          type: 'default',
          content: <MemoryGame />
        };
        break;
      case 'weather':
        content = {
          type: 'default',
          content: <WeatherApp />
        };
        break;
      case 'readme':
        content = {
          type: 'default',
          content: <ReadmeContent />
        };
        break;
      case 'calendar':
        content = {
          type: 'default',
          content: <Calendar />
        };
        break;
      case 'browser':
        content = {
          type: 'browser'
        };
        break;
      case 'codeIndexer':
        content = {
          type: 'code-indexer'
        };
        break;
      case 'wallet':
        content = {
          type: 'default',
          content: <WalletApp onClose={() => closeWindow('wallet')} />
        };
        break;
      case '0gfiles':
        content = {
          type: 'default',
          content: <ZeroGFileApp username={currentUser} />
        };
        break;
      case 'textEditor':
        content = {
          type: 'text-editor',
          id: 'new-document'
        };
        break;
      case 'aiSearch':
        content = {
          type: 'ai-search',
          initialQuery: '',
          initialMode: AI_MODES.ASSISTANT,
        };
        break;
      case 'zkTypingProof':
        content = {
          type: 'default',
          content: <ZKHumanTypingEditor />
        };
        break;
      case 'secureAccount':
        content = {
          type: 'default',
          content: <SecureAccountApp />
        };
        break;
      case '0gCompute':
        content = {
          type: 'custom',
          render: ({ onClose }: { onClose: () => void }) => (
            <ZeroGComputeWindow isOpen={true} onClose={() => closeWindow('0gCompute')} />
          )
        };
        break;
      case 'fileSystem':
        content = {
          type: 'file-explorer'
        };
        break;
      default:
        if (icon.type === 'file') {
          content = {
            type: 'text-editor',
            id: icon.id
          };
        } else if (icon.type === 'folder') {
          content = {
            type: 'file-explorer',
            folderId: icon.id
          };
        } else {
          content = {
            type: 'default',
            content: <div className="p-4">Content for {icon.title}</div>
          };
        }
    }

    const position = getRandomWindowPosition(width, height);

    openWindow({
      id: icon.id,
      title: icon.title,
      content,
      ...position,
      width,
      height,
    });
  }, [openWindow, isWindowOpen, focusWindow, icons, getRandomWindowPosition, closeWindow, currentUser]);

  const findNextAvailablePosition = useCallback(() => {
    const maxY = Math.max(...icons.map(icon => icon.y || 0), 0) + 1;
    return { x: 0, y: maxY };
  }, [icons]);

  const handleNewFile = useCallback(async () => {
    const newFileName = prompt('Enter file name:', 'New File.txt');
    if (newFileName && newFileName.trim()) {
      try {
        const newFile = await createFile(newFileName, null);
        
        const position = findNextAvailablePosition();
        
        const newIcon: AppIcon = {
          id: newFile.id,
          title: newFile.name,
          icon: FileEdit,
          x: position.x,
          y: position.y,
          color: generateRandomColor(),
          type: 'file'
        };
        
        setIcons(prev => [...prev, newIcon]);
        
        closeContextMenu();
      } catch (error) {
        console.error('Error creating file:', error);
        alert('Failed to create file');
      }
    }
  }, [createFile, findNextAvailablePosition, closeContextMenu]);

  const handleNewFolder = useCallback(async () => {
    const newFolderName = prompt('Enter folder name:', 'New Folder');
    if (newFolderName && newFolderName.trim()) {
      try {
        const newFolder = await createFolder(newFolderName, null);
        
        const position = findNextAvailablePosition();
        
        const newIcon: AppIcon = {
          id: newFolder.id,
          title: newFolder.name,
          icon: Folder,
          x: position.x,
          y: position.y,
          color: generateRandomColor(),
          type: 'folder'
        };
        
        setIcons(prev => [...prev, newIcon]);
        
        closeMenu();
        closeContextMenu();
      } catch (error) {
        console.error('Error creating folder:', error);
        alert('Failed to create folder');
      }
    }
  }, [createFolder, findNextAvailablePosition, closeMenu, closeContextMenu]);

  const handleRenameIcon = useCallback((iconId: string) => {
    setEditingIcon(iconId);
    closeMenu();
  }, [closeMenu]);

  const handleRenameComplete = useCallback((iconId: string, newName: string) => {
    if (newName.trim()) {
      renameItem(iconId, newName)
        .then(() => {
          setIcons(prev => prev.map(icon => 
            icon.id === iconId ? { ...icon, title: newName } : icon
          ));
        })
        .catch(error => {
          console.error('Error renaming item:', error);
        });
    }
    setEditingIcon(null);
  }, [renameItem]);

  const handleDeleteIcon = useCallback((iconId: string) => {
    const icon = icons.find(i => i.id === iconId);
    if (!icon) return;
    
    const isSystemApp = icon.type === 'app';
    if (isSystemApp) {
      alert('System applications cannot be deleted.');
      return;
    }
    
    if (confirm(`Are you sure you want to delete "${icon.title}"?`)) {
      deleteItem(iconId)
        .then(() => {
          setIcons(prev => prev.filter(i => i.id !== iconId));
        })
        .catch(error => {
          console.error('Error deleting item:', error);
        });
    }
    
    closeMenu();
  }, [icons, deleteItem, closeMenu]);

  const handleDuplicateIcon = useCallback((iconId: string) => {
    const iconToDuplicate = icons.find(icon => icon.id === iconId);
    if (!iconToDuplicate) return;
    
    if (iconToDuplicate.type === 'app') {
      alert('System applications cannot be duplicated.');
      return;
    }

    if (iconToDuplicate.type === 'file') {
      getItemContent(iconId)
        .then(content => {
          if (content !== undefined) {
            return createFile(`${iconToDuplicate.title} Copy`, null)
              .then(newFile => {
                return updateItemContent(newFile.id, content)
                  .then(() => newFile);
              });
          }
        })
        .then(newFile => {
          if (newFile) {
            const position = findNextAvailablePosition();
            const newIcon: AppIcon = {
              id: newFile.id,
              title: newFile.name,
              icon: iconToDuplicate.icon,
              x: position.x,
              y: position.y,
              color: generateRandomColor(),
              type: 'file'
            };
            setIcons(prev => [...prev, newIcon]);
          }
        })
        .catch(error => {
          console.error('Error duplicating file:', error);
        });
    } else if (iconToDuplicate.type === 'folder') {
      createFolder(`${iconToDuplicate.title} Copy`, null)
        .then(newFolder => {
          const position = findNextAvailablePosition();
          const newIcon: AppIcon = {
            id: newFolder.id,
            title: newFolder.name,
            icon: Folder,
            x: position.x,
            y: position.y,
            color: generateRandomColor(),
            type: 'folder'
          };
          setIcons(prev => [...prev, newIcon]);
        })
        .catch(error => {
          console.error('Error duplicating folder:', error);
        });
    }
    
    closeMenu();
  }, [icons, getItemContent, createFile, updateItemContent, createFolder, findNextAvailablePosition, closeMenu]);

  const handleOpenIcon = useCallback((iconId: string) => {
    const icon = icons.find(i => i.id === iconId);
    if (icon) {
      handleIconOpen(icon);
    }
    closeMenu();
  }, [icons, handleIconOpen, closeMenu]);

  const handleSelectionChange = useCallback((selectedIds: string[]) => {
    setSelectedIcons(new Set(selectedIds));
  }, []);

  const desktopContextMenu = (e: React.MouseEvent) => {
    // Prevent default browser context menu
    e.preventDefault();
    
    // Close existing context menu if open
    closeContextMenu();
    
    // Only show desktop context menu if not right-clicking on an icon
    if (!(e.target as HTMLElement).closest('.desktop-icon')) {
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY
      });
    }
  };

  const handleSort = useCallback((sortType: string) => {
    const userIcons = icons.filter(icon => icon.type !== 'app');
    const systemIcons = icons.filter(icon => icon.type === 'app');
    
    const fileSystemItems = userIcons.map(icon => ({
      id: icon.id,
      name: icon.title,
      type: icon.type === 'file' ? 'file' as const : 'folder' as const,
      icon: icon.icon,
      created: new Date(),
      modified: new Date(),
    }));
    
    const sortedItems = sortItems(fileSystemItems, sortType);
    
    const sortedIcons = sortedItems.map((item, index) => {
      const originalIcon = userIcons.find(i => i.id === item.id)!;
      const row = Math.floor(index / 2);
      const col = index % 2;
      
      return {
        ...originalIcon,
        title: item.name,
        x: col,
        y: systemIcons.length / 2 + row
      };
    });
    
    setIcons([...systemIcons, ...sortedIcons]);
    closeContextMenu();
  }, [icons, sortItems, closeContextMenu]);

  const handleRefresh = useCallback(() => {
    setIcons([...icons]);
    closeContextMenu();
  }, [icons, closeContextMenu]);

  const handleChangeBackground = useCallback(() => {
    alert('Change Background functionality would go here');
    closeContextMenu();
  }, [closeContextMenu]);

  const handleDisplaySettings = useCallback(() => {
    alert('Display Settings functionality would go here');
    closeContextMenu();
  }, [closeContextMenu]);

  const getContextMenuType = useCallback((targetId?: string) => {
    if (!targetId) return 'desktop';
    
    const icon = icons.find(i => i.id === targetId);
    if (!icon) return 'desktop';
    
    return icon.type;
  }, [icons]);

  // Handle AI search from the widget
  const handleSearch = (query: string, mode: string) => {
    // If AI search window is already open, focus it and update search
    if (isWindowOpen('aiSearch')) {
      focusWindow('aiSearch');
      // Here you would update the search query in the window
      // This would require additional state management
      return;
    }

    // Otherwise open a new AI search window with the query
    const width = 800;
    const height = 600;
    const position = getRandomWindowPosition(width, height);

    openWindow({
      id: 'aiSearch',
      title: 'AI Search',
      width,
      height,
      x: position.x,
      y: position.y,
      content: {
        type: 'ai-search',
        initialQuery: query,
        initialMode: mode,
      },
    });
  };

  // Open the full AI search window
  const openFullSearch = () => {
    if (isWindowOpen('aiSearch')) {
      focusWindow('aiSearch');
    } else {
      // Find the AI search icon
      const aiSearchIcon = icons.find(icon => icon.id === 'aiSearch');
      if (aiSearchIcon) {
        const width = 800;
        const height = 600;
        const position = getRandomWindowPosition(width, height);
        
        openWindow({
          id: 'aiSearch',
          title: 'AI Search',
          width,
          height,
          x: position.x,
          y: position.y,
          content: {
            type: 'ai-search',
            initialQuery: '',
            initialMode: AI_MODES.ASSISTANT,
          },
        });
      }
    }
  };

  const getWindowContent = (windowId: string): WindowContent => {
    // Handle window content based on id
    switch (windowId) {
      case '0gCompute':
        return {
          type: 'custom',
          render: ({ onClose }) => (
            <ZeroGComputeWindow isOpen={true} onClose={onClose} />
          )
        };

      case 'secretVault':
        return {
          type: 'custom',
          render: ({ onClose }) => (
            <SecretVaultApp isOpen={true} onClose={onClose} />
          )
        };

      default:
        // Handle other window types
        return { type: 'default', content: <div>Unknown window content</div> };
    }
  };

  return (
    <div
      ref={desktopRef}
      className={cn(
        "flex-1 relative overflow-hidden",
        "contain-layout"
      )}
      onContextMenu={desktopContextMenu}
    >
      {/* AI Search Widget */}
      {showSearchWidget && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10">
          <AISearchWidget 
            onSearch={handleSearch}
            onOpenFullSearch={openFullSearch}
          />
        </div>
      )}

      <DesktopGrid
        icons={icons}
        onIconsChange={handleIconsChange}
        onIconOpen={handleIconOpen}
        onContextMenu={handleGridContextMenu}
        editingIcon={editingIcon}
        onRenameComplete={handleRenameComplete}
        selectedIcons={selectedIcons}
        onSelectionChange={handleSelectionChange}
        columns={2}
      >
        {menuProps.isOpen && (
          <ContextMenu
            x={menuProps.position.x}
            y={menuProps.position.y}
            type={getContextMenuType(menuProps.targetId)}
            targetId={menuProps.targetId}
            onClose={closeMenu}
            onOpen={menuProps.targetId ? () => handleOpenIcon(menuProps.targetId!) : undefined}
            onNewFile={handleNewFile}
            onNewFolder={handleNewFolder}
            onRename={menuProps.targetId ? () => handleRenameIcon(menuProps.targetId!) : undefined}
            onDelete={menuProps.targetId ? () => handleDeleteIcon(menuProps.targetId!) : undefined}
            onDuplicate={menuProps.targetId ? () => handleDuplicateIcon(menuProps.targetId!) : undefined}
            onSort={handleSort}
            onRefresh={handleRefresh}
            onChangeBackground={handleChangeBackground}
            onDisplaySettings={handleDisplaySettings}
          />
        )}

        {windows.map((window) => (
          <Window key={window.id} {...window} />
        ))}
      </DesktopGrid>

      {contextMenu.visible && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          type={getContextMenuType(contextMenu.targetId)}
          targetId={contextMenu.targetId}
          onClose={closeContextMenu}
          onOpen={contextMenu.targetId ? () => handleOpenIcon(contextMenu.targetId!) : undefined}
          onNewFile={handleNewFile}
          onNewFolder={handleNewFolder}
          onRename={contextMenu.targetId ? () => handleRenameIcon(contextMenu.targetId!) : undefined}
          onDelete={contextMenu.targetId ? () => handleDeleteIcon(contextMenu.targetId!) : undefined}
          onDuplicate={contextMenu.targetId ? () => handleDuplicateIcon(contextMenu.targetId!) : undefined}
          onSort={handleSort}
          onRefresh={handleRefresh}
          onChangeBackground={handleChangeBackground}
          onDisplaySettings={handleDisplaySettings}
        />
      )}
    </div>
  );
}