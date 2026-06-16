import React from "react";

interface MobileFrameProps {
  children: React.ReactNode;
}

const MobileFrame: React.FC<MobileFrameProps> = ({ children }) => (
  <div className="flex items-center justify-center py-4 h-full">
    <div className="relative h-full max-h-[750px] aspect-[375/750] bg-[#1a1a1a] rounded-[3rem] p-3 shadow-2xl">
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-6 bg-[#1a1a1a] rounded-b-2xl z-10" />
      {/* Screen */}
      <div className="w-full h-full bg-white rounded-[2.25rem] overflow-hidden flex flex-col">
        {children}
      </div>
      {/* Home indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-400 rounded-full" />
    </div>
  </div>
);

export default MobileFrame;
