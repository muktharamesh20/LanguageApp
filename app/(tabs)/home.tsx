import { supabase } from '@/constants/supabaseClient';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Home = () => {
    const insets = useSafeAreaInsets();
        const [name, setName] = useState<string | null>(null);

    useEffect(() => {
        const loadUserName = async () => {
            try {
                const {
                    data: { user },
                    error: authError,
                } = await supabase.auth.getUser();

                if (authError || !user) {
                    throw new Error("User not authenticated");
                }

                const { data, error } = await supabase
                    .from('usersettings')
                    .select('name')
                    .eq('id', user.id)
                    .single();

                if (error || !data?.name) {
                    throw new Error("Could not fetch user name.");
                }

                setName(data.name);
            } catch (err: any) {
                console.error(err);
                Alert.alert("Error", err.message || "Something went wrong.");
            }
        };

        loadUserName();
    }, []);
    return (
        <ScrollView contentContainerStyle={{...styles.container, paddingTop: insets.top + 15, paddingBottom: insets.bottom + 20}}>
            <Text style={styles.title}> {name ? `Welcome back, ${name}! 👋` : "Welcome to Your Language Learning App! 👋"}</Text>
            
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
