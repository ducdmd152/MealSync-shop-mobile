import React, { ReactNode } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

interface CustomCheckboxProps {
  label: ReactNode;
  checked: boolean;
  onToggle: () => void;
  readOnly?: boolean; // Optional readOnly field
  containerStyleClasses?: string;
}

const CustomCheckbox: React.FC<CustomCheckboxProps> = ({
  label,
  checked,
  onToggle,
  readOnly = false,
  containerStyleClasses = "",
}) => {
  return (
    <TouchableOpacity
      onPress={!readOnly ? onToggle : undefined} // Only toggle if not readOnly
      style={styles.container}
      className={containerStyleClasses}
      activeOpacity={readOnly ? 1 : 0.8} // Disable click effect if readOnly
    >
      <View
        style={[
          styles.checkbox,
          checked && styles.checked,
          // readOnly && styles.readOnly,
        ]}
      >
        {checked && <MaterialIcons name="check" size={16} color="white" />}
      </View>
      {label}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#4CAF50",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checked: {
    backgroundColor: "#4CAF50",
  },
  readOnly: {
    opacity: 0.5, // Reduce opacity for readOnly state
  },
  label: {
    fontSize: 16,
  },
  readOnlyLabel: {
    color: "gray",
  },
});

export default CustomCheckbox;
