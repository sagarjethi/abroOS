"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useWindows } from "@/contexts/WindowsContext";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import type { AppIcon } from "@/types/global";
import { Calculator } from "@/components/Calculator";
import { TextEditor } from "@/components/TextEditor";
import { AboutMeContent } from "@/components/AboutMeContent";
import { useFileSystem } from "@/contexts/FileSystemContext";
import { 
  Cpu, 
  Folder, 
  FileEdit, 
  FileText, 
  PenLine, 
  Plus, 
  FilePen, 
  Clock, 
  Search,
  SortAsc,
  SortDesc,
  Filter,
  Shield,
  Calendar,
  MoreHorizontal
} from "lucide-react";
import { ZeroGComputeWindow } from "@/components/desktop/ZeroGComputeWindow";
import { ZKHumanTypingEditor } from "@/components/ZKHumanTypingEditor";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FileExplorerProps {
  folderId?: string;
  title?: string;
}

type SortOption = "newest" | "oldest" | "a-z" | "z-a";
type FilterOption = "all" | "verified" | "unverified";

export const FileExplorer: React.FC<FileExplorerProps> = ({ folderId, title }) => {
  const { getItemsInFolder, createFile, deleteItem, renameItem } = useFileSystem();
  const { openWindow, isWindowOpen, focusWindow, closeWindow } = useWindows();
  const [activeTab, setActiveTab] = useState<"all" | "zkblogs">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOption, setSortOption] = useState<SortOption>("newest");
  const [filterOption, setFilterOption] = useState<FilterOption>("all");
  
  // Show either root items or folder items based on folderId
  const items = getItemsInFolder(folderId || null);
  
  // Filter for ZK blog files
  const zkBlogFiles = items.filter(item => item.type === 'file' && item.name.endsWith('.zkblog'));
  const otherItems = items.filter(item => !(item.type === 'file' && item.name.endsWith('.zkblog')));
  
  // Filtered and sorted blog files
  const processedBlogFiles = useMemo(() => {
    let filtered = [...zkBlogFiles];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(file => 
        file.name.toLowerCase().includes(query) || 
        (file.content && file.content.toLowerCase().includes(query))
      );
    }
    
    // Apply verification filter
    if (filterOption === "verified") {
      filtered = filtered.filter(file => file.content && isVerified(file.content));
    } else if (filterOption === "unverified") {
      filtered = filtered.filter(file => !file.content || !isVerified(file.content));
    }
    
    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortOption) {
        case "newest":
          return (new Date(b.modified || 0)).getTime() - (new Date(a.modified || 0)).getTime();
        case "oldest":
          return (new Date(a.modified || 0)).getTime() - (new Date(b.modified || 0)).getTime();
        case "a-z":
          return a.name.localeCompare(b.name);
        case "z-a":
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });
  }, [zkBlogFiles, searchQuery, sortOption, filterOption]);
  
  const open0GCompute = () => {
    if (isWindowOpen("0gCompute")) {
      focusWindow("0gCompute");
      return;
    }
    
    openWindow({
      id: "0gCompute",
      title: "0G Compute",
      content: {
        type: "default",
        content: <div className="flex items-center justify-center h-full">
          <p className="text-center text-muted-foreground">
            Opening 0G Compute...
          </p>
        </div>
      },
      x: 150,
      y: 150,
      width: 900,
      height: 600,
      focused: true,
    });
    
    // Use setTimeout to ensure the window is shown before opening the shortcut
    setTimeout(() => {
      // Find and programmatically click the 0G Compute shortcut
      const shortcutElement = document.querySelector('[data-shortcut="0gCompute"]');
      if (shortcutElement) {
        (shortcutElement as HTMLElement).click();
      }
      
      // Close this temporary window
      closeWindow("0gCompute");
    }, 100);
  };

  const createZKBlogFile = async () => {
    try {
      const fileName = prompt("Enter a name for your ZK-verified blog post:", "New ZK Blog Post");
      if (!fileName) return;
      
      const newFile = await createFile(`${fileName}.zkblog`, folderId);
      
      // If we're not in the ZK blogs tab, switch to it
      setActiveTab("zkblogs");
      
      openWindow({
        id: newFile.id,
        title: newFile.name,
        content: {
          type: 'default',
          content: <ZKHumanTypingEditor fileId={newFile.id} />
        },
        x: 100 + Math.random() * 50,
        y: 100 + Math.random() * 50,
        width: 900,
        height: 600,
        focused: true,
      });
    } catch (error) {
      console.error("Error creating ZK blog file:", error);
    }
  };

  const handleOpenItem = (item: any) => {
    if (isWindowOpen(item.id)) {
      focusWindow(item.id);
      return;
    }
    
    const windowConfig = {
      id: item.id,
      title: item.name,
      x: 100 + Math.random() * 50,
      y: 100 + Math.random() * 50,
      width: 700,
      height: 500,
      focused: true,
    };

    if (item.type === 'folder') {
      openWindow({
        ...windowConfig,
        content: {
          type: 'default',
          content: <FileExplorer folderId={item.id} title={item.name} />
        }
      });
    } else if (item.type === 'file') {
      // Check if this is a ZK blog file
      if (item.name.endsWith('.zkblog')) {
        openWindow({
          ...windowConfig,
          width: 900,
          height: 600,
          content: {
            type: 'default',
            content: <ZKHumanTypingEditor fileId={item.id} />
          }
        });
      } else {
        openWindow({
          ...windowConfig,
          content: {
            type: 'text-editor',
            id: item.id
          }
        });
      }
    }
  };
  
  // Function to extract a preview excerpt from a blog post
  const extractPreview = (content: string): string => {
    // Remove HTML tags and get first 100 characters
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.substring(0, 100) + (plainText.length > 100 ? '...' : '');
  };
  
  // Check if a blog file has ZK verification
  const isVerified = (content: string): boolean => {
    return content.includes('<!-- ZK-VERIFIED:');
  };

  // Extract verification timestamp if available
  const getVerificationTime = (content: string): Date | null => {
    if (!isVerified(content)) return null;
    
    const match = content.match(/<!-- ZK-VERIFIED: (\d+) -->/);
    if (match && match[1]) {
      return new Date(parseInt(match[1]));
    }
    return null;
  };
  
  // Get word count of a document
  const getWordCount = (content: string): number => {
    const plainText = content.replace(/<[^>]*>/g, '').trim();
    return plainText ? plainText.split(/\s+/).length : 0;
  };
  
  // Handle renaming a file
  const handleRenameFile = (file: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const currentName = file.name.replace('.zkblog', '');
    const newName = prompt('Enter new name for this blog post:', currentName);
    
    if (newName && newName.trim() && newName !== currentName) {
      renameItem(file.id, `${newName}.zkblog`)
        .catch(error => {
          console.error('Error renaming file:', error);
        });
    }
  };
  
  // Handle deleting a file
  const handleDeleteFile = (file: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const confirmDelete = confirm(`Are you sure you want to delete "${file.name}"? This action cannot be undone.`);
    
    if (confirmDelete) {
      deleteItem(file.id)
        .catch(error => {
          console.error('Error deleting file:', error);
        });
    }
  };
  
  // Handle exporting a ZK proof
  const handleExportProof = (file: any, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!file.content || !isVerified(file.content)) {
      alert('This document does not have a valid ZK verification proof.');
      return;
    }
    
    try {
      // Extract verification data
      const verificationMatch = file.content.match(/<!-- ZK-VERIFIED: (\d+) -->/);
      const timestamp = verificationMatch ? parseInt(verificationMatch[1]) : Date.now();
      
      // Create a proof object
      const proof = {
        documentId: file.id,
        documentName: file.name,
        verificationTimestamp: timestamp,
        verificationDate: new Date(timestamp).toISOString(),
        wordCount: getWordCount(file.content),
        contentHash: btoa(file.content).substring(0, 32), // Simple hash simulation
        proofType: 'SP1-ZKP-HumanTyping-1.0'
      };
      
      // Create a downloadable file
      const proofBlob = new Blob([JSON.stringify(proof, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(proofBlob);
      
      // Create download link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${file.name.replace('.zkblog', '')}-proof.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting proof:', error);
      alert('Failed to export proof. See console for details.');
    }
  };

  return (
    <div className="p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl">{title || 'File Explorer'}</h2>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={createZKBlogFile}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            <PenLine className="h-4 w-4" />
            New ZK Blog
          </Button>
        </div>
      </div>
      
      <Tabs 
        defaultValue="all" 
        value={activeTab} 
        onValueChange={(v) => setActiveTab(v as "all" | "zkblogs")}
        className="flex-grow flex flex-col"
      >
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Files</TabsTrigger>
          <TabsTrigger value="zkblogs" className="relative">
            ZK Blog Files
            {zkBlogFiles.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {zkBlogFiles.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="flex-grow">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center p-4 h-auto gap-2"
              onClick={open0GCompute}
            >
              <Cpu className="h-8 w-8 text-primary" />
              <span>0G Compute</span>
            </Button>
            
            <Button
              variant="outline"
              className="flex flex-col items-center justify-center p-4 h-auto gap-2"
              onClick={createZKBlogFile}
            >
              <PenLine className="h-8 w-8 text-purple-400" />
              <span>Create ZK Blog</span>
            </Button>
          </div>
          
          <ScrollArea className="flex-grow">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {items.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className="flex flex-col items-center justify-center p-4 h-auto gap-2 hover:bg-accent"
                  onClick={() => handleOpenItem(item)}
                  onDoubleClick={() => handleOpenItem(item)}
                >
                  {item.type === 'folder' ? (
                    <Folder className="h-8 w-8 text-blue-400" />
                  ) : item.name.endsWith('.zkblog') ? (
                    <PenLine className="h-8 w-8 text-purple-400" />
                  ) : (
                    <FileText className="h-8 w-8 text-green-400" />
                  )}
                  <span className="text-center text-sm truncate max-w-full">{item.name}</span>
                </Button>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="zkblogs" className="flex-grow flex flex-col">
          {zkBlogFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
              <FilePen className="h-16 w-16 opacity-20" />
              <p>No ZK Blog files yet</p>
              <Button onClick={createZKBlogFile}>Create your first ZK Blog post</Button>
            </div>
          ) : (
            <div className="flex flex-col h-full gap-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-grow">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search blog posts..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Select
                    value={filterOption}
                    onValueChange={(v) => setFilterOption(v as FilterOption)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Blog Posts</SelectItem>
                      <SelectItem value="verified">ZK Verified</SelectItem>
                      <SelectItem value="unverified">Unverified</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select
                    value={sortOption}
                    onValueChange={(v) => setSortOption(v as SortOption)}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SortAsc className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="a-z">A-Z</SelectItem>
                      <SelectItem value="z-a">Z-A</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {processedBlogFiles.length === 0 ? (
                <div className="flex-grow flex items-center justify-center text-muted-foreground">
                  No blog posts match your filters
                </div>
              ) : (
                <ScrollArea className="flex-grow">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {processedBlogFiles.map((file) => {
                      const verificationTime = file.content ? getVerificationTime(file.content) : null;
                      const wordCount = file.content ? getWordCount(file.content) : 0;
                      
                      return (
                        <Card 
                          key={file.id} 
                          className="cursor-pointer hover:bg-accent/10 transition-colors"
                          onClick={() => handleOpenItem(file)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-base truncate">
                                {file.name.replace('.zkblog', '')}
                              </CardTitle>
                              <div className="flex items-center gap-2">
                                {file.content && isVerified(file.content) && (
                                  <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
                                    <Shield className="h-3 w-3 mr-1" />
                                    ZK Verified
                                  </Badge>
                                )}
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenItem(file);
                                    }}>
                                      Open
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={(e) => handleRenameFile(file, e)}>
                                      Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={(e) => handleDeleteFile(file, e)}
                                      className="text-red-500"
                                    >
                                      Delete
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      onClick={(e) => handleExportProof(file, e)}
                                      disabled={!file.content || !isVerified(file.content)}
                                    >
                                      Export Proof
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <CardDescription className="flex items-center">
                                <Calendar className="h-3 w-3 mr-1" />
                                {new Date(file.modified || Date.now()).toLocaleDateString()}
                                
                                {verificationTime && (
                                  <span className="ml-2 text-green-500 flex items-center">
                                    <Shield className="h-3 w-3 mr-1" />
                                    Verified: {verificationTime.toLocaleDateString()}
                                  </span>
                                )}
                              </CardDescription>
                              <span className="text-muted-foreground">
                                {wordCount} words
                              </span>
                            </div>
                          </CardHeader>
                          <CardContent className="text-sm text-muted-foreground">
                            {file.content ? extractPreview(file.content) : 'Empty document'}
                          </CardContent>
                          <CardFooter className="pt-2 text-xs justify-between">
                            <div className="flex items-center">
                              <PenLine className="h-3 w-3 mr-1 text-purple-400" />
                              Human-written
                            </div>
                            <div className="flex items-center">
                              {file.content && isVerified(file.content) ? (
                                <span className="text-green-500 flex items-center">
                                  <Shield className="h-3 w-3 mr-1" />
                                  Verified content
                                </span>
                              ) : (
                                <span className="text-amber-500 flex items-center">
                                  Pending verification
                                </span>
                              )}
                            </div>
                          </CardFooter>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};