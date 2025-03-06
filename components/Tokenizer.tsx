import React, { useState } from "react";
import { View, Text, TextInput, ScrollView, StyleSheet } from "react-native";
import llama3Tokenizer from 'llama3-tokenizer-js';
import { Colors } from "@/constants/Colors";
import { generateColors } from "@/utils/utilfunctions";

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
    style={styles.tokenContainer}
    contentContainerStyle={styles.tokenContentContainer}
  >
    {tokenStrings.map((tokenString, index) => (
      <View
        key={index}
        style={[
          styles.tokenWrapper,
          { backgroundColor: pastelColors[index % pastelColors.length] }
        ]}
      >
        <Text style={styles.tokenText}>
          {getTextualRepresentationForToken(tokenString)}
        </Text>
      </View>
    ))}
  </ScrollView>
);

const TokenIds = ({ tokenIds }: { tokenIds: number[] }) => (
  <ScrollView
    style={styles.tokenContainer}
    contentContainerStyle={styles.tokenContentContainer}
  >
    <Text style={styles.tokenText}>[</Text>
    {tokenIds.map((tokenId, index) => (
      <View
        key={index}
        style={[
          styles.tokenWrapper,
          { backgroundColor: pastelColors[index % pastelColors.length] }
        ]}
      >
        <Text style={styles.tokenText}>
          {`${tokenId}, `}
        </Text>
      </View>
    ))}
    <Text style={styles.tokenText}>]</Text>
  </ScrollView>
);

const Tokenizer = () => {
  const [inputText, setInputText] = useState(
    "Replace this text in the input field...\n<|start_header_id|>...to see how tokenization works."
  );

  const encodedTokens = llama3Tokenizer.encode(inputText, { bos: false, eos: false });

  const decodedTokens = encodedTokens.map(token => {
    return llama3Tokenizer.decode([token]);
  });

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Welcome to 🦙 Tokenizer 🦙 playground!
      </Text>
      
      <TextInput
        value={inputText}
        onChangeText={setInputText}
        style={styles.textInput}
        multiline={true}
      />

      <TokenizedText tokenStrings={decodedTokens} />
      <TokenIds tokenIds={encodedTokens} />

      <View style={styles.statistics}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{Array.from(inputText).length}</Text>
          <Text style={styles.statLabel}>Characters</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{encodedTokens.length}</Text>
          <Text style={styles.statLabel}>Tokens</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
	maxWidth: 600,
	alignSelf: 'center',
	width: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  textInput: {
    fontFamily: 'monospace',
    height: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginBottom: 16,
  },
  tokenContainer: {
    height: 200,
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#f8f8f8',
    marginBottom: 16,
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