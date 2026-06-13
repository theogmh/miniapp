import React, { useRef, useState, useEffect } from "react"
import { EllipsisVertical, X} from 'lucide-react'
import {Link} from 'react-router'

type FloatingMenuProps = {
  onShow: () => void
  reload: () => void
  title?: string
  onSettings: () => void
  backText: string
  onBack: () => void,
  changeTheme: () => void
  hasSettings?: boolean | undefined
  appTheme: 'light' | 'dark' | 'system'
}

export const FloatingMenu: React.FC<FloatingMenuProps> = ({ onShow, reload, title, onSettings, backText, onBack, hasSettings, changeTheme, appTheme }) => {

  const floatingRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem("floatingMenuPosition");
    return saved ? JSON.parse(saved) : { x: 100, y: 100 };
  });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [showList, setShowList] = useState(false);
  const [buttonSize, setButtonSize] = useState({ width: 0, height: 0 });
  const menuSize = { width: 160, height: 120 };  

  useEffect(() => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setButtonSize({ width: rect.width, height: rect.height });
    }
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setDragging(true);
    setOffset({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!dragging) return;
    const touch = e.touches[0];
    const newX = touch.clientX - offset.x;
    const newY = touch.clientY - offset.y;
    const maxX = window.innerWidth - (floatingRef.current?.offsetWidth || 0);
    const maxY = window.innerHeight - (floatingRef.current?.offsetHeight || 0);
    setPosition({ x: Math.min(Math.max(0, newX), maxX), y: Math.min(Math.max(0, newY), maxY) });
  };

  const handleTouchEnd = () => {
    setDragging(false);
    localStorage.setItem("floatingMenuPosition", JSON.stringify(position));
  };

  const handleClick = () => {
    if (!dragging) setShowList((prev) => !prev);
  };

  const getMenuStyle = () => {
    let left = buttonSize.width + 8;
    let top = 0;

    const rightSpace = window.innerWidth - (position.x + buttonSize.width + 8 + menuSize.width);
    const leftSpace = position.x - menuSize.width - 8;
    const bottomSpace = window.innerHeight - (position.y + menuSize.height);
    const topSpace = position.y - menuSize.height;

    if (rightSpace < 0 && leftSpace >= 0) left = -menuSize.width - 8;

    if (bottomSpace < 0 && topSpace >= 0) top = -menuSize.height + buttonSize.height;

    return { left, top, position: "absolute" as const };
  };

  return (
    <div
      ref={floatingRef}
      className="absolute bg-transparent rounded-lg shadow-lg"
      style={{ left: position.x, top: position.y, touchAction: "none" }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        ref={buttonRef}
        className="bg-popover border-1 border-border text-popover-foreground rounded-full p-2 flex items-center justify-center shadow-lg"
        onClick={handleClick}
      >
        {showList ? <X className='w-5 h-5' /> : <EllipsisVertical className='w-5 h-5' />}
      </div>
      {showList && (
        <div style={getMenuStyle()} className="bg-popover border-1 border-border shadow-md rounded-md py-2 px-1 min-w-40 w-fit flex flex-col text-sm popover-foreground">
          <p className='px-2 text-xs text-muted'>{title || 'Mini App'}</p>
          <button className="px-2 py-1 active:bg-accent rounded-sm text-left transition-colors duration-200" onClick={() => {reload(); setShowList(false);}}>Reload</button>
          {hasSettings && <button className="px-2 py-1 active:bg-accent rounded-sm text-left transition-colors duration-200" onClick={() => {onSettings(); setShowList(false)}}>Settings</button>}
          <Link className="px-2 py-1 active:bg-accent rounded-sm text-left transition-colors duration-200" to='/settings'>Users & Bot</Link>
          <Link className="px-2 py-1 active:bg-accent rounded-sm text-left transition-colors duration-200" to='/webs'>Mini Apps</Link>
          <button className="px-2 py-1 active:bg-accent rounded-sm text-left transition-colors duration-200" onClick={() => window.location.href = 'https://t.me/mhminiapp'}>Channel</button>
          <button className="px-2 py-1 active:bg-accent rounded-sm text-left transition-colors duration-200" onClick={() => { changeTheme(); setShowList(false) }}>{appTheme === 'light' ? 'Dark Mode' : appTheme === 'dark' ? 'System Theme' : 'Light Mode'}</button>
          <button className="px-2 py-1 active:bg-accent rounded-sm text-left transition-colors duration-200" onClick={onShow}>Show Header</button>
          <button className="px-2 py-1 active:bg-accent rounded-sm text-left transition-colors duration-200" onClick={() => { onBack(); setShowList(false) }}>{backText || 'Close'}</button>
        </div>
      )}
    </div>
  );
};
