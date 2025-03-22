"use client";

import React, { useRef, useMemo, useCallback, useEffect } from "react";
import { useGrid } from "@/hooks/useGrid";
import { useSelection } from "@/hooks/useSelection";
import { DesktopIcon } from "./DesktopIcon";
import { SelectionBox } from "./SelectionBox";
import { AnimatePresence } from "framer-motion";
import type { AppIcon } from "@/types/global";

interface DesktopGridProps {
  icons: AppIcon[];
  selectedIcons: Set<string>;
  onSelectionChange: (selectedIds: string[]) => void;
  onIconsChange?: (icons: AppIcon[]) => void;
  onIconOpen?: (icon: AppIcon) => void;
  onContextMenu: (e: React.MouseEvent, type: 'desktop' | 'file' | 'folder' | 'app', targetId?: string) => void;
  editingIcon?: string | null;
  onRenameComplete?: (id: string, newName: string) => void;
  children?: React.ReactNode;
  columns?: number;
}

function DesktopGridInternal({
  icons,
  selectedIcons,
  onSelectionChange,
  onIconsChange,
  onIconOpen,
  onContextMenu,
  editingIcon,
  onRenameComplete,
  children,
  columns = 4,
}: DesktopGridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const initialItems = useMemo(
    () =>
      icons.map((icon) => ({
        id: icon.id,
        position: { x: icon.x, y: icon.y },
      })),
    [icons]
  );

  const {
    items,
    draggedItems,
    gridDimensions,
    dragImageRef,
    handleDragStart,
    handleDrag,
    handleDragEnd,
  } = useGrid({
    containerRef,
    initialItems,
    selectedItems: selectedIcons,
    onItemsChange: (newItems) => {
      if (!onIconsChange) return;
      const updatedIcons = icons.map((icon) => {
        const item = newItems.find((i) => i.id === icon.id);
        return item
          ? { ...icon, x: item.position.x, y: item.position.y }
          : icon;
      });
      onIconsChange(updatedIcons);
    },
  });

  const {
    isSelecting,
    selectionBox,
    handleSelectionStart,
    handleSelectionMove,
    handleSelectionEnd,
    updateSelection,
    clearSelection
  } = useSelection({
    containerRef,
    onSelectionChange,
  });

  const handleDesktopContextMenu = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains("desktop-grid")) {
      onContextMenu(e, 'desktop');
    }
  }, [onContextMenu]);

  const handleIconOpen = useCallback((icon: AppIcon) => {
    onIconOpen?.(icon);
  }, [onIconOpen]);

  const handleIconSelect = useCallback((id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const newSelection = new Set(selectedIcons);
    if (e.shiftKey) {
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
    } else {
      newSelection.clear();
      newSelection.add(id);
    }
    
    onSelectionChange(Array.from(newSelection));
  }, [selectedIcons, onSelectionChange]);

  const handleDesktopClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains("desktop-grid")) {
      onSelectionChange([]);
    }
  }, [onSelectionChange]);

  useEffect(() => {
    if (!isSelecting || !selectionBox || !gridDimensions) return;

    const updateSelections = () => {
      items.forEach(item => {
        const icon = icons.find(i => i.id === item.id);
        if (!icon) return;

        const rect = new DOMRect(
          item.position.x * (gridDimensions.cellWidth + gridDimensions.gap),
          item.position.y * (gridDimensions.cellHeight + gridDimensions.gap),
          gridDimensions.cellWidth,
          gridDimensions.cellHeight
        );

        updateSelection(icon.id, rect);
      });
    };

    requestAnimationFrame(updateSelections);
  }, [items, icons, isSelecting, selectionBox, gridDimensions, updateSelection]);

  return (
    <div
      ref={containerRef}
      className="desktop-grid h-full w-full relative"
      onMouseDown={handleSelectionStart}
      onMouseMove={handleSelectionMove}
      onMouseUp={handleSelectionEnd}
      onMouseLeave={handleSelectionEnd}
      onDragOver={(e) => {
        e.preventDefault();
        e.stopPropagation();
      }}
      onClick={handleDesktopClick}
      onContextMenu={handleDesktopContextMenu}
      style={{ cursor: isSelecting ? 'crosshair' : 'default' }}
    >
      {children}

      <div
        ref={dragImageRef}
        className="fixed -left-[9999px] -top-[9999px] pointer-events-none"
        style={{
          width: gridDimensions?.cellWidth,
          height: gridDimensions?.cellHeight,
        }}
      />

      <AnimatePresence>
        {selectionBox && (
          <SelectionBox
            startX={selectionBox.startX}
            startY={selectionBox.startY}
            currentX={selectionBox.currentX}
            currentY={selectionBox.currentY}
          />
        )}
      </AnimatePresence>

      {items.map((item) => {
        const icon = icons.find((i) => i.id === item.id);
        if (!icon || !gridDimensions) return null;

        return (
          <DesktopIcon
            key={item.id}
            id={icon.id}
            title={icon.title}
            icon={icon.icon}
            x={item.position.x}
            y={item.position.y}
            width={gridDimensions.cellWidth}
            height={gridDimensions.cellHeight}
            gap={gridDimensions.gap}
            color={icon.color}
            type={icon.type}
            isDragging={draggedItems.has(item.id)}
            isSelected={selectedIcons.has(item.id)}
            isEditing={editingIcon === icon.id}
            onSelect={(e) => handleIconSelect(icon.id, e)}
            onOpen={() => handleIconOpen(icon)}
            onContextMenu={onContextMenu}
            onDragStart={(e) => handleDragStart(e, icon.id)}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            onRenameComplete={onRenameComplete}
            onSelectionUpdate={(rect) => updateSelection(icon.id, rect)}
          />
        );
      })}
    </div>
  );
}

export const DesktopGrid = React.memo(DesktopGridInternal);