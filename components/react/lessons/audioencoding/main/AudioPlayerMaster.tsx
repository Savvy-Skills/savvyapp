'use dom'

import AudioFileUploader from "./AudioFileUploader";
// import "./AudioPlayerMaster.css";

// Define available sounds with their URLs and names
const availableSounds = [
  { id: 1, name: "Dog Bark", url: "/sounds/dog-bark.mp3", icon: "🐶" },
  { id: 2, name: "Dog Barks", url: "/sounds/dog-barks.mp3", icon: "🐶🐶" },
  { id: 3, name: "Cat Meow", url: "/sounds/cat-meow.mp3", icon: "🐱" },
  { id: 4, name: "Cat Meows", url: "/sounds/cat-meows.mp3", icon: "🐱🐱" },
];

interface AudioPlayerMasterProps {
  onAudioFileSelect: (file: File | null) => void;
  onAudioUrlSelect: (url: string | null) => void;
  selectedFile: File | null;
  selectedUrl: string | null;
}

export default function AudioPlayerMaster({
  onAudioFileSelect,
  onAudioUrlSelect,
  selectedFile,
  selectedUrl
}: AudioPlayerMasterProps) {
  const handleFileSelect = (file: File) => {
    onAudioFileSelect(file);
  };

  const handleSoundSelect = (url: string) => {
    onAudioUrlSelect(url);
  };

  return (
    <div className="audio-selector">
      <div className="audio-source-selector">
        <div className="predefined-sounds">
          <h4>Choose a sample sound:</h4>
          <div className="sound-buttons">
            {availableSounds.map((sound) => (
              <button 
                key={sound.id}
                className={`sound-button ${selectedUrl === sound.url ? 'active' : ''}`}
                onClick={() => handleSoundSelect(sound.url)}
                title={sound.name}
              >
                <span className="sound-icon">{sound.icon}</span>
                <span className="sound-name">{sound.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="separator">
          <span>OR</span>
        </div>
        
        <div className="file-upload-section">
          <h4>Upload your own audio:</h4>
          <AudioFileUploader 
            onFileSelect={handleFileSelect} 
            selectedFile={selectedFile}
          />
        </div>
      </div>
    </div>
  );
} 