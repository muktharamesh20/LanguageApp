import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Home = () => {
    const insets = useSafeAreaInsets();
    return (
        <ScrollView contentContainerStyle={{...styles.container, paddingTop: insets.top + 15, paddingBottom: insets.bottom + 20}}>
            <Text style={styles.title}>Welcome to Your Language Learning App! 👋</Text>
            
            <View style={styles.section}>
                <Text style={styles.heading}>📚 Daily Practice</Text>
                <Text style={styles.text}>Start your day with quick grammar and vocabulary exercises.</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.heading}>🗣️ Conversation Practice</Text>
                <Text style={styles.text}>Chat with our AI to improve your fluency.</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.heading}>📈 Progress</Text>
                <Text style={styles.text}>Track your learning journey and milestones.</Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.heading}>🎯 Your Goals</Text>
                <Text style={styles.text}>Stay motivated with weekly learning targets.</Text>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 20,
        //paddingTop: 60,
        //backgroundColor: '#fff',
        minHeight: '100%',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    },
    section: {
        marginBottom: 30,
    },
    heading: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 6,
    },
    text: {
        fontSize: 16,
        color: '#444',
    },
});

export default Home;
