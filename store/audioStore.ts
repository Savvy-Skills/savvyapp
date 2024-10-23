import { create } from "zustand";
import { Audio } from "expo-av";

interface AudioStore {
  soundsLoaded: boolean;
  success: Audio.Sound | null;
  failure: Audio.Sound | null;
  loadSounds: () => Promise<void>;
  playSound: (sound: "success" | "failure") => Promise<void>;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  soundsLoaded: false,
  success: null,
  failure: null,
  loadSounds: async () => {
    const { sound: success } = await Audio.Sound.createAsync(
      require("@/assets/sounds/success.wav")
    );
    const { sound: failure } = await Audio.Sound.createAsync(
      require("@/assets/sounds/failure.wav")
    );
    set({ success, failure, soundsLoaded: true });
  },
  playSound: async (sound) => {
    const audio = get()[sound];
    if (audio) {
      await audio.replayAsync();
    }
  },
}));
