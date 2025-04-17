import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { Text, TextInput } from "react-native-paper";
import llama3Tokenizer from 'llama3-tokenizer-js';
import { Colors } from "@/constants/Colors";
import { generateColors } from "@/utils/utilfunctions";
import styles from "@/styles/styles";
import { ContentInfo } from "@/types";

// Stylizing tokens is mostly copied from gpt-tokenizer demo.
// const pastelColors = [
//   "rgba(107,64,216,0.3)",
//   "rgba(104,222,122,0.4)",
//   "rgba(244,172,54,0.4)",
//   "rgba(239,65,70,0.4)",
//   "rgba(39,181,234,0.4)",
// ];

const pastelColors = [
	generateColors(Colors.primary, 0.3).muted,
	generateColors(Colors.orange, 0.3).muted,
	generateColors(Colors.success, 0.3).muted,
	generateColors(Colors.error, 0.3).muted,
	generateColors(Colors.blue, 0.3).muted,
]


// React Native doesn't have canvas for text measurement
// Use a simpler approach to check for empty tokens
const getTextualRepresentationForToken = (tokenString: string) => {
  const processedToken = tokenString.replace(/ /g, "\u00A0").replace(/\n/g, "\\n");
  
  // If token is empty or just whitespace, show a special character
  if (processedToken.length === 0 || processedToken.trim().length === 0) {
    return "";
  }
  
  return processedToken;
};

const TokenizedText = ({ tokenStrings }: { tokenStrings: string[] }) => (
  <ScrollView 
    style={localStyles.tokenContainer}
    contentContainerStyle={localStyles.tokenContentContainer}
  >
    {tokenStrings.map((tokenString, index) => (
      <View
        key={index}
        style={[
          localStyles.tokenWrapper,
          { backgroundColor: pastelColors[index % pastelColors.length] }
        ]}
      >
        <Text style={localStyles.tokenText}>
          {getTextualRepresentationForToken(tokenString)}
        </Text>
      </View>
    ))}
  </ScrollView>
);

const TokenIds = ({ tokenIds }: { tokenIds: number[] }) => (
  <ScrollView
    style={localStyles.tokenContainer}
    contentContainerStyle={localStyles.tokenContentContainer}
  >
    <Text style={localStyles.tokenText}>[</Text>
    {tokenIds.map((tokenId, index) => (
      <View
        key={index}
        style={[
          localStyles.tokenWrapper,
          { backgroundColor: pastelColors[index % pastelColors.length] }
        ]}
      >
        <Text style={localStyles.tokenText}>
          {`${tokenId}, `}
        </Text>
      </View>
    ))}
    <Text style={localStyles.tokenText}>]</Text>
  </ScrollView>
);

const Tokenizer = ({ content }: { content?: ContentInfo }) => {
  const [inputText, setInputText] = useState(
    content?.state.value ?? ""
  );

  const encodedTokens = llama3Tokenizer.encode(inputText, { bos: false, eos: false });

  const decodedTokens = encodedTokens.map(token => {
    return llama3Tokenizer.decode([token]);
  });

  return (
    <View style={localStyles.container}>
      <Text style={localStyles.title}>
        Tokenizer Playground
      </Text>
      
      <TextInput
        value={inputText}
        onChangeText={setInputText}
        style={localStyles.textInput}
        multiline={true}
		mode="outlined"
		contentStyle={{
			padding: 8,
		}}
		activeOutlineColor={Colors.primary}
		outlineColor={Colors.revealed}
		outlineStyle={{
			borderWidth: 1,
		}}
      />

      <TokenizedText tokenStrings={decodedTokens} />
      <TokenIds tokenIds={encodedTokens} />

      <View style={localStyles.statistics}>
        <View style={localStyles.stat}>
          <Text style={localStyles.statValue}>{Array.from(inputText).length}</Text>
          <Text style={localStyles.statLabel}>Characters</Text>
        </View>
        <View style={localStyles.stat}>
          <Text style={localStyles.statValue}>{encodedTokens.length}</Text>
          <Text style={localStyles.statLabel}>Tokens</Text>
        </View>
      </View>
    </View>
  );
};

const localStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: Colors.background,
	maxWidth: 600,
	alignSelf: 'center',
	width: '100%',
	gap: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  textInput: {
	flex: 1,
    fontFamily: 'monospace',
	maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.revealed,
	backgroundColor: Colors.background,
	borderRadius: 4,
  },
  tokenContainer: {
	flex: 1,
	maxHeight: 100,
    borderWidth: 1,
    borderColor: Colors.revealed,
    backgroundColor: Colors.revealedBackground,
	borderRadius: 4,
  },
  tokenContentContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 8,
  },
  tokenWrapper: {
    borderRadius: 3,
    marginBottom: 4,
  },
  tokenText: {
    fontFamily: 'monospace',
  },
  statistics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
  },
});

export default Tokenizer;