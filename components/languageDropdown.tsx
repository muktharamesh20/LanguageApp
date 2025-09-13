import React, { useState } from 'react';
import {
    FlatList,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface LanguagePickerProps {
  value: string;
  onChange: (lang: string) => void;
  languages?: string[];
}

const defaultLanguages = [
  'Spanish', 'French', 'Japanese', 'Mandarin',
  'German', 'Italian', 'Korean', 'Hindi', 'Arabic', 'Portuguese',
];

export default function LanguagePicker({
  value,
  onChange,
  languages = defaultLanguages,
}: LanguagePickerProps) {
  const [filtered, setFiltered] = useState<string[]>([]);

  const handleChange = (text: string) => {
    onChange(text);

    if (text.length === 0) {
      setFiltered([]);
      return;
    }

    const matches = languages.filter((lang) =>
      lang.toLowerCase().includes(text.toLowerCase())
    );
    setFiltered(matches);
  };

  const handleSelect = (lang: string) => {
    onChange(lang);
    setFiltered([]);
  };

  return (
    <View>
      <TextInput
        style={styles.input}
        placeholder="Type a language..."
        value={value}
        onChangeText={handleChange}
      />

      {filtered.length > 0 && (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item}
          style={styles.dropdown}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.dropdownItem}
              onPress={() => handleSelect(item)}
            >
              <Text>{item}</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  dropdown: {
    marginTop: 8,
    maxHeight: 150,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    backgroundColor: '#FFF',
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
