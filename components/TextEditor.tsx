"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useWindowSize } from "@/hooks/useWindowSize";
import { Save, FileSymlink } from "lucide-react";
import { toast } from "sonner";
import { useFileSystem } from "@/contexts/FileSystemContext";

interface TextEditorProps {
  fileId?: string;
  initialContent?: string;
  path?: string[];
  fileName?: string;
}

export const TextEditor: React.FC<TextEditorProps> = ({ 
  fileId, 
  initialContent = "", 
  path = [],
  fileName = "New File.txt"
}) => {
  const { getItemContent, updateItemContent } = useFileSystem();
  const [content, setContent] = useState(initialContent);
  const [isLoading, setIsLoading] = useState(!!fileId);
  const [isDirty, setIsDirty] = useState(false);
  const [filePath, setFilePath] = useState<string[]>(path);
  const [currentFileName, setCurrentFileName] = useState(fileName);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { height } = useWindowSize();
  
  // Load file content if fileId is provided
  useEffect(() => {
    const loadFile = async () => {
      if (!fileId) {
        setIsLoading(false);
        return;
      }
      
      try {
        const fileContent = await getItemContent(fileId);
        if (fileContent) {
          setContent(fileContent as string);
          setIsDirty(false);
        }
      } catch (error) {
        console.error("Error loading file:", error);
        toast.error("Failed to load file");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFile();
  }, [fileId, getItemContent]);
  
  // Handle content change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setIsDirty(true);
  };
  
  // Save file
  const saveFile = async () => {
    if (!fileId && !currentFileName) {
      toast.error("Cannot save file without name");
      return;
    }
    
    setIsLoading(true);
    
    try {
      if (fileId) {
        await updateItemContent(fileId, content);
        toast.success("File saved successfully");
        setIsDirty(false);
      } else {
        // Handle creating new file
        toast.info("Creating new file is not implemented in this demo");
      }
    } catch (error) {
      console.error("Error saving file:", error);
      toast.error("Failed to save file");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b">
        <div className="flex items-center space-x-2">
          <FileSymlink className="h-4 w-4" />
          <span className="text-sm font-medium">
            {fileId ? currentFileName : "New File"}
            {isDirty && "*"}
          </span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={saveFile}
          disabled={isLoading || !isDirty}
        >
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>
      </div>
      
      <ScrollArea className="flex-1">
        <textarea
          ref={textareaRef}
          className="w-full h-full min-h-[300px] p-4 resize-none focus:outline-none font-mono text-sm bg-transparent"
          style={{ height: height ? `${height - 100}px` : '100%' }}
          value={content}
          onChange={handleChange}
          placeholder="Start typing..."
          disabled={isLoading}
        />
      </ScrollArea>
    </div>
  );
};