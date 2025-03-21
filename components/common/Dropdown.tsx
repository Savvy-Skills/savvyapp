import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Menu, Text } from 'react-native-paper';

interface DropdownProps {
  label?: string;
  value: string;
  options: Array<{label: string; value: string}>;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  width?: number | string;
}

const Dropdown = ({ 
  label, 
  value, 
  options, 
  onChange, 
  placeholder = "Select an option",
  disabled = false,
  width = '100%'
}: DropdownProps) => {
  const [menuVisible, setMenuVisible] = useState(false);
  
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  
  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
    closeMenu();
  };
  
  return (
    <View style={[styles.container, { width: width as number }]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Menu
        visible={menuVisible}
        onDismiss={closeMenu}
        anchor={
          <Button 
            mode="outlined" 
            onPress={openMenu} 
            style={styles.dropdownButton}
            contentStyle={styles.buttonContent}
            icon="menu-down"
            disabled={disabled}
          >
            {value || placeholder}
          </Button>
        }
      >
        {options.length > 0 ? (
          options.map((option) => (
            <Menu.Item
              key={option.value}
              onPress={() => handleSelect(option.value)}
              title={option.label}
            />
          ))
        ) : (
          <Menu.Item title="No options available" disabled />
        )}
      </Menu>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#666',
  },
  dropdownButton: {
    width: '100%',
    justifyContent: 'flex-start',
    borderRadius: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  }
});

export default Dropdown; 