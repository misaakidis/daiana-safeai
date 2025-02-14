import { ImageMessage } from './ImageMessage';

// ... existing imports ...

export const Message: React.FC<MessageProps> = ({ message, isUser }) => {
  const renderContent = () => {
    if (message.imageUrl) {
      return <ImageMessage text={message.content.text} imageUrl={message.imageUrl} />;
    }
    
    // ... existing message rendering logic ...
  };

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[80%] ${isUser ? 'bg-blue-100' : 'bg-gray-100'} rounded-lg p-3`}>
        {renderContent()}
      </div>
    </div>
  );
}; 