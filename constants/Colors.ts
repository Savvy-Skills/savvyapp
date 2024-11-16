/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';
const primaryColor = '#664acc';
const primaryLighter= '#a197f9'
const blueColor = '#1d9dc9';
const orangeColor = "#ff7b09";
const lightOrangeColor = "#ffb850";


const navigationOrange = "#f4bb62";
const navigationWhite = "#d9f0fb";

const assessmentLight = "#F4F1FE"
const assessmentDark = "#6c6878"


export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
	primary: primaryColor,
	blue: blueColor,
	orange: orangeColor,
	lightOrange: lightOrangeColor,
	navigationOrange: navigationOrange,
	navigationWhite: navigationWhite,
	assessment: assessmentLight,
	primaryLighter: primaryLighter
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
	primary: primaryColor,
	blue: blueColor,
	orange: orangeColor,
	lightOrange: lightOrangeColor,
	navigationOrange: navigationOrange,
	navigationWhite: navigationWhite,
	assessment: assessmentDark,
	primaryLighter: primaryLighter

  },
};
