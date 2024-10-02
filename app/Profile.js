import { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Button, Image, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaskedTextInput } from "react-native-mask-text";
import CheckBox from 'expo-checkbox';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';

export default function Profile() {
    const [name, setName] = useState("");
    const [validName, setValidName] = useState(true);

    const [email, setEmail] = useState("");
    const [validEmail, setValidEmail] = useState(true);

    const [lastName, setLastName] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    const [image, setImage] = useState(null);

    const [notifyOrderStatuses, setNotifyOrderStatuses] = useState(true);
    const [notifyPasswordChanges, setNotifyPasswordChanges] = useState(true);
    const [notifySpecialOffers, setNotifySpecialOffers] = useState(true);
    const [notifyNewsletter, setNotifyNewsletter] = useState(true);

    const pickImage = async () => {
        // No permissions request is necessary for launching the image library
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.All,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            setImage(result.assets[0].uri);
        }
    };

    useEffect(() => {
        AsyncStorage.getItem('name').then((value) => {
            setName(value);
        });
        AsyncStorage.getItem('email').then((value) => {
            setEmail(value);
        });
        AsyncStorage.getItem('lastName').then((value) => {
            setLastName(value);
        });
        AsyncStorage.getItem('phoneNumber').then((value) => {
            setPhoneNumber(value);
        });
        AsyncStorage.getItem('image').then((value) => {
            setImage(value || null);
        });
        AsyncStorage.getItem('notifyOrderStatuses').then((value) => {
            setNotifyOrderStatuses(!value || value === 'true');
        });
        AsyncStorage.getItem('notifyPasswordChanges').then((value) => {
            setNotifyPasswordChanges(!value || value === 'true');
        });
        AsyncStorage.getItem('notifySpecialOffers').then((value) => {
            setNotifySpecialOffers(!value || value === 'true');
        });
        AsyncStorage.getItem('notifyNewsletter').then((value) => {
            setNotifyNewsletter(!value || value === 'true');
        });
        // AsyncStorage.setItem('onboardingComplete', 'false');
    }, []);

    return (
        <KeyboardAvoidingView style={styles.page} behavior='position'><ScrollView>
            <Text style={styles.titleText}>Personal information</Text>
            <View style={styles.avatarView}>
                <Text style={styles.nameText}>Avatar</Text>
                <View style={styles.avatarView2}>

                    {image ? <Image
                        source={{ uri: image }}
                        style={styles.image}
                    /> : <View style={styles.imagePlaceholder}>
                        <Text style={styles.imageTextPlaceholder}>
                            {(name ? name[0] : '') + (lastName ? lastName[0] : '')}
                        </Text>
                    </View>
                    }
                    <Pressable style={styles.avatarButton} onPress={pickImage}>
                        <Text style={styles.changeText}>Change</Text>
                    </Pressable>
                    <Pressable style={styles.avatarButton2} onPress={() => setImage(null)}>
                        <Text>Remove</Text>
                    </Pressable>
                </View>
            </View>
            <Text style={styles.nameText}>First Name</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={text => {
                    if (text.length > 2) {
                        setValidName(true)
                    } else {
                        setValidName(false)
                    }
                    setName(text)
                }}
            />
            <Text style={styles.nameText}>Last Name</Text>
            <TextInput
                value={lastName}
                style={styles.input}
                onChangeText={text => {
                    setLastName(text)
                }}
            />
            <Text style={styles.nameText}>Email</Text>
            <TextInput
                style={styles.input}
                value={email}
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
            <Text style={styles.nameText}>Phone number</Text>
            <MaskedTextInput
                value={phoneNumber}
                mask={"(999) 999-9999"}
                inputMode='numeric'
                style={styles.input}
                onChangeText={text => {
                    setPhoneNumber(text)
                }}
            />
            <Text style={styles.titleText2}>Email notifications</Text>
            <View style={styles.checkboxContainer}>
                <CheckBox
                    disabled={false}
                    value={notifyOrderStatuses}
                    onValueChange={setNotifyOrderStatuses}
                    style={styles.checkbox}
                />
                <Text style={styles.nameText2}>Order statuses</Text>
            </View>
            <View style={styles.checkboxContainer}>
                <CheckBox
                    disabled={false}
                    value={notifyPasswordChanges}
                    onValueChange={(newValue) => setNotifyPasswordChanges(newValue)}
                    style={styles.checkbox}
                />
                <Text style={styles.nameText2}>Password changes</Text>
            </View>
            <View style={styles.checkboxContainer}>
                <CheckBox
                    disabled={false}
                    value={notifySpecialOffers}
                    onValueChange={(newValue) => setNotifySpecialOffers(newValue)}
                    style={styles.checkbox}
                />
                <Text style={styles.nameText2}>Special offers</Text>
            </View>
            <View style={styles.checkboxContainer}>
                <CheckBox
                    disabled={false}
                    value={notifyNewsletter}
                    onValueChange={(newValue) => setNotifyNewsletter(newValue)}
                    style={styles.checkbox}
                />
                <Text style={styles.nameText2}>Newsletter</Text>
            </View>
            <Pressable
                onPress={() => deleteDataAndLogout()}
                style={({ pressed }) => [
                    {
                        backgroundColor: pressed
                            ? "rgb(210, 230, 255)"
                            : "white",
                    },
                    styles.logoutButton,
                ]}
            >
                <Text style={[
                    {
                        color: "black",
                    },
                    styles.buttonText2
                ]}>Logout</Text>
            </Pressable>
            <View style={styles.footer}>
                <Pressable
                    onPress={() => saveDataAndProceed(name, email, lastName, phoneNumber, image, notifyOrderStatuses, notifyPasswordChanges, notifySpecialOffers, notifyNewsletter)}
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
                    ]}>Save</Text>
                </Pressable>
                <Pressable
                    onPress={() => discardDataAndReload()}
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
                            color: "black",
                        },
                        styles.buttonText
                    ]}>Discard</Text>
                </Pressable>
            </View>
        </ScrollView></KeyboardAvoidingView>
    );
}

async function deleteDataAndLogout() {
    await AsyncStorage.removeItem('name');
    await AsyncStorage.removeItem('email');
    await AsyncStorage.removeItem('lastName');
    await AsyncStorage.removeItem('phoneNumber');
    await AsyncStorage.removeItem('image');
    await AsyncStorage.removeItem('notifyOrderStatuses');
    await AsyncStorage.removeItem('notifyPasswordChanges');
    await AsyncStorage.removeItem('notifySpecialOffers');
    await AsyncStorage.removeItem('notifyNewsletter');
    await AsyncStorage.removeItem('onboardingComplete');
    router.replace('Onboarding');
}

function discardDataAndReload() {
    router.replace('Home')
}

async function saveDataAndProceed(name, email, lastName, phoneNumber, image, notifyOrderStatuses, notifyPasswordChanges, notifySpecialOffers, notifyNewsletter) {
    await AsyncStorage.setItem('name', name);
    await AsyncStorage.setItem('email', email);
    await AsyncStorage.setItem('lastName', lastName);
    await AsyncStorage.setItem('phoneNumber', phoneNumber);
    await AsyncStorage.setItem('image', image || '');
    await AsyncStorage.setItem('notifyOrderStatuses', notifyOrderStatuses.toString());
    await AsyncStorage.setItem('notifyPasswordChanges', notifyPasswordChanges.toString());
    await AsyncStorage.setItem('notifySpecialOffers', notifySpecialOffers.toString());
    await AsyncStorage.setItem('notifyNewsletter', notifyNewsletter.toString());
    router.replace('Home');
}

function validateEmail(email) {
    const re = /\S+@\S+\.\S+/;
    const result = re.test(email)
    return result;
}

const styles = StyleSheet.create({
    nameText2: {
        fontSize: 16,
    },
    titleText2: {
        fontSize: 24,
        marginTop: 16,
    },
    checkbox: {
        marginRight: 8,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'top',
        marginBottom: 8,
    },
    avatarButton: {
        margin: 28,
        padding: 8,
        backgroundColor: 'gray',
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    changeText: {
        color: 'white',
    },
    avatarButton2: {
        margin: 28,
        padding: 8,
        backgroundColor: 'white',
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imagePlaceholder: {
        backgroundColor: 'gray',
        width: 100,
        height: 100,
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imageTextPlaceholder: {
        color: 'white',
        fontSize: 34,
    },
    avatarView2: {
        flexDirection: 'row',
        padding: 8,
        marginRight: 8,
    },
    avatarView: {
        // alignItems: 'center',
        // marginBottom: 16,
        marginRight: 8,
    },
    page: {
        flex: 1,
        padding: 16,
        // justifyContent: 'center',
        // alignItems: 'center',
    },
    welcome: {
        fontSize: 24,
        marginBottom: 8,
    },
    email: {
        fontSize: 16,
    },
    input: {
        borderWidth: 1,
        // flex: 1,
        // flexDirection: 'row',
        // margin: 8,
        marginBottom: 8,
        padding: 8,
    },
    nameText: {
        fontSize: 16,
        marginTop: 8,
    },
    titleText: {
        fontSize: 24,
        marginBottom: 16,
    },
    container: {
        alignItems: 'center',
        marginBottom: 16,
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 100,
    },
    button: {
        alignItems: "center",
        padding: 10,
        margin: 10,
        width: 100,
        borderRadius: 10,
        backgroundColor: "#ddd",
    },
    footer: {
        flexDirection: "row",
        justifyContent: "center",
    },
    header: {
        alignItems: "center",
        backgroundColor: "#ddd",
    },
    body: {
        backgroundColor: "#bbb",
    },
    logo: {
        height: 100,
        width: 300,
        resizeMode: "contain",
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
    buttonText2: {
        fontSize: 16,
        backgroundColor: "yellow",
        borderRadius: 10,
        padding: 10,
        margin: 10,
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
    },
});