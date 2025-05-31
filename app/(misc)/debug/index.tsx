import ScreenWrapper from "@/components/screens/ScreenWrapper";
import React, { useState } from "react";
import { SegmentedButtons } from "react-native-paper";
import { ScrollView, View } from "react-native";
import SavvyAgentGame from "@/components/react/game/SavvyAgent";

const levels = [
	1,
	2,
	3,
	4,
	5,
]

const urls: Record<number, { loaderUrl: string; dataUrl: string; frameworkUrl: string; codeUrl: string }> = {
	1: {
		loaderUrl: (`https://api.savvyskills.io/vault/JS-TssR_/EM89eyQjlXXhNr6W5Z4UdJP6gBI/_TyOdA../Level1.loader.js`),
		dataUrl: (`https://api.savvyskills.io/vault/JS-TssR_/lNUWeE8Z2Bjogg-ARYJNfdIEn4Q/5HZkWw../Level1.data`),
		frameworkUrl: (`https://api.savvyskills.io/vault/JS-TssR_/-pV6epui71J63P1Bzk9xMpD_VUM/6kSALg../Level1.framework.js`),
		codeUrl: (`https://api.savvyskills.io/vault/JS-TssR_/jxmiBNncUKiVs412BMzA5fhMdRY/7MtYCg../Level1.wasm`),
	},
	2:{
		loaderUrl: (`https://api.savvyskills.io/vault/JS-TssR_/7WAk7fKWi20ql9qqWwb9IYwswbE/0eY36w../Level2.loader.js`),
		dataUrl: (`https://api.savvyskills.io/vault/JS-TssR_/ZLOt3YNR0gnZ34QpfBLfIWK0wW4/ZGOvmw../Level2.data`),
		frameworkUrl: (`https://api.savvyskills.io/vault/JS-TssR_/WX4GMccqkh4BMwsVG-AMJN-Geuk/NHoepw../Level2.framework.js`),
		codeUrl: (`https://api.savvyskills.io/vault/JS-TssR_/PcJtDUtRfg3ujq8Bd4tWVv_Sdvw/yNolHg../Level2.wasm`),
	},
	3:{
		loaderUrl: (`https://api.savvyskills.io/vault/JS-TssR_/lISorSnvyTLlpFvzT4VIzRGmQpQ/8QH5Qw../Level3.loader.js`),
		dataUrl: (`https://api.savvyskills.io/vault/JS-TssR_/kKgexGV8dQlTkl1HeAT5B_0nLwE/hzinbw../Level3.data`),
		frameworkUrl: (`https://api.savvyskills.io/vault/JS-TssR_/wew21FTm1IiXeKjyGUKa6oacGBk/nghrzw../Level3.framework.js`),
		codeUrl: (`https://api.savvyskills.io/vault/JS-TssR_/jyn6J3-kbOsvOXW41bTC-_ifAeg/oU3zqA../Level3.wasm`),
	},
	4:{
		loaderUrl: (`https://api.savvyskills.io/vault/JS-TssR_/IE9UGqpuqPvd1SNlxgu76Aa_RgA/yOdoWg../Level4.loader.js`),
		dataUrl: (`https://api.savvyskills.io/vault/JS-TssR_/Q6KwFgaS2JR0gScJTr_bYnUNFd4/aiMALw../Level4.data`),
		frameworkUrl: (`https://api.savvyskills.io/vault/JS-TssR_/63JRSOyNMkF33vcSke9queEQ-pw/WNf2AA../Level4.framework.js`),
		codeUrl: (`https://api.savvyskills.io/vault/JS-TssR_/UnBZG3ebL0YhzFSSjS9hO0JJoEs/7ypcHA../Level4.wasm`),
	},
	5:{
		loaderUrl: (`https://api.savvyskills.io/vault/JS-TssR_/qbSSFxW3Ld935h8_W6VuAlVQrnQ/jkqMIw../Level5.loader.js`),
		dataUrl: (`https://api.savvyskills.io/vault/JS-TssR_/kllQWL6HfqcQ_ONDQogB1n4Wqdo/KNRclQ../Level5.data`),
		frameworkUrl: (`https://api.savvyskills.io/vault/JS-TssR_/rWomSkGKdl8uT6MUrHYvFZEpDgI/eeW_Xw../Level5.framework.js`),
		codeUrl: (`https://api.savvyskills.io/vault/JS-TssR_/gFpZi7ZLTxhCDdSceSOPQExhJNk/AkdGxA../Level5.wasm`),
	},
}

export default function DebugScreen() {
	const [selectedIndex, setSelectedIndex] = useState<string>("1");

	const handleValueChange = (value: string) => {
		setSelectedIndex(value);
	};

	return (
		<ScreenWrapper style={{ overflow: "hidden" }}>
			<SegmentedButtons
				style={{ borderRadius: 4 }}
				value={selectedIndex}
				onValueChange={(value) => handleValueChange(value)}
				buttons={[
					...levels.map((level) => ({
						label: `Savvy Level ${level}`,
						value: level.toString(),
						icon: "vector-line",
						style: { borderRadius: 4 },
					})),
				]}
				theme={{ roundness: 0 }}
			/>
			<ScrollView contentContainerStyle={{ flexGrow: 1, maxWidth: 600, alignSelf: "center", width: "100%" }}>
					<SavvyAgentGame 
						key={`level${selectedIndex}`}
						gameKey={`level${selectedIndex}`}
						urls={urls[parseInt(selectedIndex)]}
					/>
			</ScrollView>
		</ScreenWrapper>
	);
}

