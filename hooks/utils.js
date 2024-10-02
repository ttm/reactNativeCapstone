import { useRef, useEffect } from 'react';
import * as SQLite from 'expo-sqlite';

export function useUpdateEffect(effect, dependencies = []) {
    const isInitialMount = useRef(true);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
        } else {
            return effect();
        }
    }, dependencies);
}

export async function filterByQueryAndCategories(query, activeCategories) {
    const activeCategories_ = '(' + activeCategories.map((item) => `'${item}'`).join(',') + ')';
    // const db = await SQLite.openDatabaseAsync('little_lemo');
    const db = await SQLite.openDatabaseAsync('capstone.db');
    const allRows__ = await db.getAllAsync(`select * from test where name like '%${query}%' and category in ${activeCategories_}`);
    return allRows__;
}