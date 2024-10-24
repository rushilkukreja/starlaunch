import { View, Text, StyleSheet } from 'react-native'
import { useTheme } from '@react-navigation/native'
import React from 'react'

const FdText = ({ children, style }) => {
    const Theme = useTheme();
    return (
        <Text style={[styles,{...style}]}>
            {children}
        </Text>
    )
}

const styles = StyleSheet.create({
    text: {
        color: Theme.colors.text
    }
})

export default FdText