'use client';
import { FC } from 'react';
import Image from 'next/image';

export const UserProfile: FC = () => {
  return (
    <div className="flex items-center gap-3 p-4 border-b border-white/10">
      <div className="relative w-12 h-12 rounded-full overflow-hidden">
        <Image
          src="/avatars/default.png"
          alt="User avatar"
          fill
          className="object-cover"
          sizes="48px"
        />
      </div>
      <div className="flex flex-col">
        <span className="text-white font-medium">User Name</span>
        <span className="text-white/70 text-sm">user@example.com</span>
      </div>
    </div>
  );
}; 