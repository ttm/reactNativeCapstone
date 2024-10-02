import { Text, View, TextInput, Pressable, Image, StyleSheet, KeyboardAvoidingView } from "react-native";
import React, { useEffect, useState } from "react";
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Onboarding() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [validName, setValidName] = useState(false);
    const [validEmail, setValidEmail] = useState(false);

    useEffect(() => {
        AsyncStorage.getItem('onboardingComplete').then((value) => {
            value = JSON.parse(value);
            if (value) {
                router.replace('Home');
            }
        });
    }, []);

    return (
        <View style={styles.page}>
            <View style={styles.header}>
                <Image
                    style={styles.logo}
                    source={require("../assets/imgs/Logo.png")}
                />
            </View>
            <KeyboardAvoidingView style={styles.body} behavior="padding">
                <Text style={styles.welcome}>Let us get to know you!</Text>
                <Text style={styles.inputText}>First Name</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={text => {
                        if (text.length > 2) {
                            setValidName(true)
                        } else {
                            setValidName(false)
                        }
                        setName(text)
                    }}
                />
                <Text style={styles.inputText}>Email</Text>
                <TextInput
                    style={styles.input}
                    keyboardType='email-address'
                    onChangeText={text => {
                        if (validateEmail(text)) {
                            setValidEmail(true)
                        } else {
                            setValidEmail(false)
                        }
                        setEmail(text)
                    }}

                />
                <View style={styles.footer}>
                    <Pressable
                        onPress={() => saveDataAndProceed(name, email)}
                        disabled={!validName || !validEmail}
                        style={({ pressed }) => [
                            {
                                backgroundColor: pressed
                                    ? "rgb(210, 230, 255)"
                                    : "white",
                            },
                            styles.button,
                        ]}
                    >
                        <Text style={[
                            {
                                color: validName && validEmail ? "black" : "gray",
                            },
                            styles.buttonText
                        ]}>Next</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}

async function saveDataAndProceed(name, email) {
    await AsyncStorage.setItem('name', name);
    await AsyncStorage.setItem('email', email);
    await AsyncStorage.setItem('onboardingComplete', 'true');
    router.replace('Home');
}

function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    const result = re.test(email)
    return result;
}

const styles = StyleSheet.create({
    button: {
        alignItems: "center",
        padding: 10,
        margin: 10,
        width: 100,
        borderRadius: 10,
        backgroundColor: "#ddd",
    },
    footer: {
        alignItems: "flex-end",
        backgroundColor: "#eee",
    },
    page: {
        // flex: 1,
        // justifyContent: "top",
        // alignItems: "center",
        // backgroundColor: "#ffffff",
    },
    header: {
        alignItems: "center",
        backgroundColor: "#ddd",
    },
    body: {
        // alignItems: "center",
        backgroundColor: "#bbb",
    },
    logo: {
        height: 100,
        width: 300,
        resizeMode: "contain",
    },
    input: {
        height: 40,
        margin: 12,
        borderWidth: 1,
        padding: 10,
        width: 200,
        alignSelf: "center",
        borderRadius: 10,
    },
    inputText: {
        fontSize: 20,
        textAlign: "center",
        marginTop: 30,
    },
    welcome: {
        fontSize: 30,
        textAlign: "center",
    },
});