import React from 'react';

interface ImageMessageProps {
  text: string;
  imageUrl: string;
}

export const ImageMessage: React.FC<ImageMessageProps> = ({ text, imageUrl }) => {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-gray-700">{text}</p>
      <img 
        src={imageUrl} 
        alt={text}
        className="rounded-lg max-w-[512px] w-full shadow-md"
        loading="lazy"
      />
    </div>
  );
}; 