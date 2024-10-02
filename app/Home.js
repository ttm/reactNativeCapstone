import { Text, View, TextInput, Pressable, Image, StyleSheet, FlatList, Alert } from "react-native";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SQLite from 'expo-sqlite';
import Filters from '../components/Filters';
import { filterByQueryAndCategories, useUpdateEffect, getSectionListData } from '../hooks/utils';
import Ionicons from '@expo/vector-icons/Ionicons';
import debounce from 'lodash.debounce';

const sections = ['starters', 'mains', 'desserts'];
export default function Home() {
    const [image, setImage] = useState(null);
    const [data, setData] = useState(null);
    const [query, setQuery] = useState('');
    const [filterSelections, setFilterSelections] = useState(
        sections.map(() => false)
    );
    const [searchBarText, setSearchBarText] = useState('');

    useEffect(() => {
        AsyncStorage.getItem('image').then((value) => {
            setImage(value || null);
        });
        fetchAndWriteData(setData);
    }, []);

    useUpdateEffect(() => {
        (async () => {
            const activeCategories = sections.filter((s, i) => {
                // If all filters are deselected, all categories are active
                if (filterSelections.every((item) => item === false)) {
                    return true;
                }
                return filterSelections[i];
            });
            try {
                const menuItems = await filterByQueryAndCategories(
                    query,
                    activeCategories
                );
                // const sectionListData = getSectionListData(menuItems);
                setData(menuItems);
            } catch (e) {
                Alert.alert(e.message);
            }
        })();
    }, [filterSelections, query]);

    const handleFiltersChange = async (index) => {
        const arrayCopy = [...filterSelections];
        arrayCopy[index] = !filterSelections[index];
        setFilterSelections(arrayCopy);
    };

    const lookup = useCallback((q) => {
        setQuery(q);
    }, []);

    const debouncedLookup = useMemo(() => debounce(lookup, 500), [lookup]);

    const handleSearchChange = (text) => {
        setSearchBarText(text);
        debouncedLookup(text);
    };

    return (
        <View style={styles.page}>
            <View style={styles.header}>
                <Image
                    style={styles.logo}
                    source={require("../assets/imgs/Logo.png")}
                />
                <Pressable
                    onPress={() => router.navigate('Profile')}
                >
                    {image && <Image
                        source={{ uri: image }}
                        style={styles.image}
                    />}
                </Pressable>
            </View>
            <View style={styles.bannerComponent}>
                <View style={styles.banner}>
                    <View style={styles.bannerText}>
                        <Text style={styles.bannerHeading}>Little Lemon</Text>
                        <Text style={styles.bannerSubheading}>Chicago</Text>
                        <Text style={styles.bannerBody}>We are a family owned Mediterranean restaurant, focused on traditional recipes served with a modern twist.</Text>
                    </View>
                </View>
                <Image
                    source={require("../assets/imgs/Hero image.png")}
                    style={styles.bannerImage}
                />
            </View>
            <View style={styles.body}>
                <View style={styles.searchInput}>
                    <Ionicons
                        name='search'
                        size={22}
                        style={styles.searchIcon}
                        color='#bbb'
                    />
                    <TextInput
                        style={styles.inputText}
                        placeholder={'I\'m looking for...'}
                        placeholderTextColor={'#999'}
                        underlineColorAndroid={'#fff'}
                        autoCorrect={false}
                        onChangeText={handleSearchChange}
                    />
                </View>
                <Filters
                    selections={filterSelections}
                    onChange={handleFiltersChange}
                    sections={sections}
                />
                <FlatList
                    data={data}
                    renderItem={({ item }) => (
                        <View style={styles.foodCard}>
                            <View style={styles.foodText}>
                                <Text style={styles.foodName}>{item.name}</Text>
                                <Text style={styles.foodDescription}>{item.description.substring(0, 50) + '...'}</Text>
                                <Text style={styles.foodPrice}>${item.price.toFixed(2)}</Text>
                            </View>
                            <Image
                                source={{ uri: imageURL(item.image) }}
                                style={styles.foodImage}
                            />
                        </View>
                    )}
                    keyExtractor={(item, i) => item.name + i}
                />
            </View>
        </View>
    );
}

async function fetchAndWriteData(setData) {
    const db = await SQLite.openDatabaseAsync('capstone.db');
    const DATABASE_VERSION = 1;
    // await db.execAsync(`PRAGMA user_version = 0`);
    let { user_version: currentDbVersion } = await db.getFirstAsync('PRAGMA user_version');
    if (currentDbVersion >= DATABASE_VERSION) {
        const allRows = await db.getAllAsync('SELECT * FROM test');
        const cats = allRows.map((row) => row.category);
        setData(allRows);
        return;
    }
    fetch('https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/capstone.json')
        .then((response) => response.json())
        .then(async (data) => {
            setData(data.menu);
            await db.execAsync('CREATE TABLE IF NOT EXISTS test (name TEXT, category TEXT, description TEXT, price REAL, image TEXT)');
            // await db.execAsync('DELETE FROM test');
            for (const item of data.menu) {
                await db.runAsync('INSERT INTO test (name, category, description, price, image) VALUES (?, ?, ?, ?, ?)', [
                    item.name,
                    item.category,
                    item.description,
                    item.price,
                    item.image,
                ]);
            }
            await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
        });
}


function imageURL(image) {
    return `https://github.com/Meta-Mobile-Developer-PC/Working-With-Data-API/blob/main/images/${image}?raw=true`;
}

const styles = StyleSheet.create({
    banner: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        margin: 10,
        borderWidth: 1,
        borderRadius: 10,
    },
    bannerComponent: {
        margin: 10,
        padding: 10,
        marginBottom: 0,
        paddingBottom: 0,
        flexDirection: 'row',
        backgroundColor: '#ddd',
    },
    bannerHeading: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    bannerSubheading: {
        fontSize: 20,
    },
    bannerBody: {
        fontSize: 16,
    },
    bannerImageView: {
        // width: '100%',
        height: 100,
        resizeMode: 'cover',
        alignSelf: "right",
        // margin: 0,
        // padding: 0,
    },
    bannerText: {
        // flex: 1,
        // flexDirection: 'row',
        width: 200,
        // height: 100,
        // margin: 10,
    },
    bannerImage: {
        width: 100,
        height: 100,
        resizeMode: 'cover',
        alignSelf: "center",
        // margin: 0,
        // padding: 0,
    },
    inputText: {
        flex: 1,
        fontSize: 16,
        color: '#000',
        marginLeft: 10,
    },
    searchInput: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        margin: 10,
        borderWidth: 1,
        borderRadius: 10,
    },
    foodImage: {
        width: 100,
        height: 100,
        resizeMode: 'cover',
        // alignSelf: "right",
        margin: 0,
        padding: 0,
    },
    foodCard: {
        flexDirection: "row",
        // justifyContent: "space-between",
        // alignItems: "center",
        width: 300,
        margin: 10,
        padding: 10,
        borderWidth: 1,
        borderRadius: 10,
    },
    foodText: {
        flex: 1,
        margin: 10
    },
    foodName: {
        fontSize: 20,
        fontWeight: "bold",
    },
    foodDescription: {
        fontSize: 16,
    },
    foodPrice: {
        fontSize: 16,
        fontWeight: "bold",
    },
    image: {
        width: 50,
        height: 50,
        resizeMode: "contain",
        // alignSelf: "left",
        margin: 0,
        padding: 0,
        borderRadius: 100,
    },
    logo: {
        width: 300,
        height: 50,
        resizeMode: "contain",
        // alignSelf: "right",
    },
    page: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "center",
        alignItems: "center",
    },
    header: {
        // flex: 1,
        flexDirection: "row",
        // justifyContent: "space-between",
        alignItems: "right",
        // alignItems: "flex-start",
        margin: 0,
        padding: 0,
    },
    body: {
        flex: 2,
        justifyContent: "center",
        alignItems: "center",
    },
    welcome: {
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 20,
    },
});