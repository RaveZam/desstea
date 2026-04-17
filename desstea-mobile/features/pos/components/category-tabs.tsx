import React from "react";
import { Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { LocalCategory } from "../types";

const ORANGE = "#E8692A";
const DARK_TEXT = "#1C1C1E";
const WHITE = "#FFFFFF";

type Props = {
  categories: LocalCategory[];
  selectedCategory: string;
  onSelect: (categoryId: string) => void;
};

export function CategoryTabs({ categories, selectedCategory, onSelect }: Props) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.categoriesScroll}
      contentContainerStyle={styles.categoriesContent}
    >
      {categories.map((cat) => (
        <TouchableOpacity
          key={cat.id}
          style={[
            styles.categoryTab,
            selectedCategory === cat.id && styles.categoryTabActive,
          ]}
          onPress={() => onSelect(cat.id)}
        >
          <Text
            style={[
              styles.categoryLabel,
              selectedCategory === cat.id && styles.categoryLabelActive,
            ]}
          >
            {cat.name}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  categoriesScroll: {
    maxHeight: 64,
  },
  categoriesContent: {
    gap: 10,
    paddingRight: 10,
  },
  categoryTab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 10,
    height: 48,
    borderRadius: 24,
    backgroundColor: WHITE,
    gap: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  categoryTabActive: {
    backgroundColor: ORANGE,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: DARK_TEXT,
  },
  categoryLabelActive: {
    color: WHITE,
  },
});
