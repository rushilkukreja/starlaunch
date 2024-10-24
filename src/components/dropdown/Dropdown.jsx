import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, FlatList } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Animated, Easing } from 'react-native';

const Dropdown = ({
  icon,
  label,
  placeholder,
  unitWithDropdown,
  unitWithoutDropdown,
  options = [],
  withDropdownIcon,
  withoutDropdownIcon,
  onPressInput,
  value,
  onChangeText,
  onChangeUnit,
  keyboardType
}) => {
  const [selectedValue, setSelectedValue] = useState(
    unitWithDropdown || (options.length > 0 ? options[0] : unitWithoutDropdown)
  );
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const { colors } = useTheme();

  useEffect(() => {
    if (unitWithDropdown) {
      setSelectedValue(unitWithDropdown);
    }
  }, [unitWithDropdown]);
  console.log(keyboardType,"keyboardType");
  

  const handleValueChange = (value) => {
    setSelectedValue(value);
    setDropdownVisible(false);
    if (onChangeUnit) { // Call onChangeUnit if it's provided
      onChangeUnit(value);
    }
  };
console.log(onPressInput,"onPressInput");

  return (
    <View style={styles.container}>
      <View style={styles.iconLabelContainer}>
        <Image source={icon} style={[styles.icon, { tintColor: colors.icon }]} />
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      </View>

      <View style={styles.inputUnitWrapper}>
        <TouchableOpacity style={styles.inputWrapper} onPress={onPressInput}>
          <TextInput
            placeholder={placeholder}
            placeholderTextColor={colors.inputText}
            style={[styles.input]}
            // keyboardType={keyboardType}
            keyboardType="number-pad"
            editable={!onPressInput} // Disable the keyboard when onPressInput is provided
            value={value} // Bind value prop to the input
            onChangeText={onChangeText}
          />
        </TouchableOpacity>

        <View style={[styles.dropdownContainer, { backgroundColor: colors.unitbackground }]}>
          <TouchableOpacity
            onPress={() => setDropdownVisible(!isDropdownVisible)}
            style={styles.dropdownButton}
          >
            <Text style={styles.selectedOptionText}>{selectedValue}</Text>
            {isDropdownVisible || options.length > 0 ? (
              <Image source={withDropdownIcon} style={styles.dropdownIcon} />
            ) : (
              <Image source={withoutDropdownIcon} style={styles.dropdownIcon} />
            )}
          </TouchableOpacity>

          {isDropdownVisible && options.length > 0 && (
            <View style={styles.dropdown}>
              {options.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleValueChange(item)}
                  style={styles.option}
                >
                  <Text style={styles.optionText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    zIndex: 10,
  },
  iconLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 0.4,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  label: {
    fontFamily: 'DMSans-Regular',
    fontSize: 16,
    fontWeight: '600',
  },
  inputUnitWrapper: {
    flexDirection: 'row',
    flex: 0.6,
    backgroundColor: '#E9E9E9',
    borderRadius: 10,
    marginLeft: 80,
    overflow: 'visible',
    justifyContent: 'space-between',
    height: 50,
    alignItems: 'center',
    zIndex: 2,
    position: 'relative',
  },
  input: {
    flex: 1,
    paddingHorizontal: 15,
    fontSize: 16,
    fontFamily: 'DMSans-Regular',
    color: '#000',
    width: 100
  },
  dropdownContainer: {
    width: 60,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    height: 50,
    position: 'absolute',
    right: 0,
    zIndex: 3,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    height: '100%',
    paddingHorizontal: 10,
  },
  selectedOptionText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold'
  },
  dropdownIcon: {
    width: 12,
    height: 12,
    tintColor: '#FFFFFF',
  },
  dropdown: {
    position: 'absolute',
    top: -50,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 5,
    elevation: 5,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    overflow: 'hidden',
    position: 'absolute',

  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1,
  },
  optionText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'DMSans-Regular',
  },
});

export default Dropdown;