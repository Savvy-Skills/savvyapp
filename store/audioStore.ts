import { create } from "zustand";
import { Audio } from "expo-av";

interface AudioStore {
  soundsLoaded: boolean;
  success: Audio.Sound | null;
  fail: Audio.Sound | null;
  failVariant: Audio.Sound | null;
  loadSounds: () => Promise<void>;
  playSound: (
    sound: "success" | "fail" | "failVariant",
    volume: number | undefined
  ) => Promise<void>;
}

export const useAudioStore = create<AudioStore>((set, get) => ({
  soundsLoaded: false,
  success: null,
  fail: null,
  failVariant: null,
  loadSounds: async () => {
    const { sound: success } = await Audio.Sound.createAsync(
      require("@/assets/sounds/success.wav")
    );
    const { sound: fail } = await Audio.Sound.createAsync(
      require("@/assets/sounds/fail.wav")
    );
    const { sound: failVariant } = await Audio.Sound.createAsync(
      require("@/assets/sounds/fail-two.wav")
    );
    set({ success, fail, failVariant, soundsLoaded: true });
  },
  playSound: async (sound, volume = 0.6) => {
    const audio = get()[sound];
    if (audio) {
      audio.setVolumeAsync(volume);
      await audio.replayAsync();
    }
  },
}));
