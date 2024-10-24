import React from 'react';
import { View, Button } from 'react-native';
import { useDispatch } from 'react-redux';
import { setTheme } from '../../features/theme/themeSlice';

export default function ThemeToggle() {
  const dispatch = useDispatch();

  return (
    <View>
      <Button
        title="Light Theme"
        onPress={() => dispatch(setTheme('light'))}
       />
      <Button 
      title="Dark Theme" 
      onPress={() => dispatch(setTheme('dark'))} 
      />
      <Button 
      title="Blue Theme" 
      onPress={() => dispatch(setTheme('blue'))} 
      />
    </View>
  );
}
