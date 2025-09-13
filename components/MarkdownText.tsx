import React from "react";
import { StyleSheet } from "react-native";
import Markdown from "react-native-markdown-display";

interface MarkdownTextProps {
  children: string;
  isUser?: boolean;
}

export default function MarkdownText({
  children,
  isUser = false,
}: MarkdownTextProps) {
  const markdownStyles = StyleSheet.create({
    body: {
      color: isUser ? "#FFF" : "#111",
      fontSize: 16,
      lineHeight: 22,
    },
    strong: {
      fontWeight: "bold",
      color: isUser ? "#FFF" : "#111",
    },
    em: {
      fontStyle: "italic",
      color: isUser ? "#FFF" : "#111",
    },
    code_inline: {
      backgroundColor: isUser ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
      color: isUser ? "#FFF" : "#111",
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
      fontSize: 14,
    },
    code_block: {
      backgroundColor: isUser ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)",
      color: isUser ? "#FFF" : "#111",
      padding: 12,
      borderRadius: 8,
      fontSize: 14,
      marginVertical: 8,
    },
    blockquote: {
      backgroundColor: isUser ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)",
      borderLeftWidth: 4,
      borderLeftColor: isUser ? "#FFF" : "#0D3B66",
      paddingLeft: 12,
      paddingVertical: 8,
      marginVertical: 8,
    },
    h1: {
      fontSize: 20,
      fontWeight: "bold",
      color: isUser ? "#FFF" : "#111",
      marginVertical: 8,
    },
    h2: {
      fontSize: 18,
      fontWeight: "bold",
      color: isUser ? "#FFF" : "#111",
      marginVertical: 6,
    },
    h3: {
      fontSize: 16,
      fontWeight: "bold",
      color: isUser ? "#FFF" : "#111",
      marginVertical: 4,
    },
    ul: {
      marginVertical: 4,
    },
    ol: {
      marginVertical: 4,
    },
    li: {
      marginVertical: 2,
    },
    link: {
      color: isUser ? "#87CEEB" : "#0D3B66",
      textDecorationLine: "underline",
    },
  });

  return <Markdown style={markdownStyles}>{children}</Markdown>;
}
