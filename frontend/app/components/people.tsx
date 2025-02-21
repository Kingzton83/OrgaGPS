// frontend/app/components/People.tsx
import { DataFetcher } from './get_data';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export function Team() {
    const [people, setPeople] = useState<Array<any>>([]);
    const dataFetcher = new DataFetcher();

    useEffect(() => {
        async function fetchData() {
            try {
                const response = await dataFetcher.getData('/api/db/users/');
                if (response?.ok) {
                    const data = await response.json();
                    setPeople(data);
                } else {
                    console.error('Failed to fetch users:', response?.status);
                }
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        }
        fetchData();
    }, [dataFetcher]);

    const updateUser = async (id: string, updates: any) => {
        try {
            const response = await dataFetcher.patchData('api/db/users', id, updates);
            if (response) {
                console.log('User updated successfully.');
                // Optional: Aktualisiere den lokalen Zustand oder führe weitere Aktionen aus
            }
        } catch (error) {
            console.error('Failed to update user:', error);
        }
    };

    const deleteUser = async (id: string) => {
        try {
            const success = await dataFetcher.deleteData('api/db/users', id);
            if (success) {
                console.log('User deleted successfully.');
                // Optional: Entferne den Benutzer aus dem lokalen Zustand
                setPeople(prev => prev.filter(person => person.id !== id));
            }
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    return (
        <>
            <Link href="../create-member/">Add member</Link>
            <ul className="people">
                {people.length === 0 ? (
                    <li>No members yet</li>
                ) : (
                    people.map((person: any) => (
                        <li key={person.id}>
                            <div className="above-hr">
                                <p className="name">{person.username}</p>
                                <button onClick={() => updateUser(person.id, { /* update data */ })}>Update</button>
                                <button onClick={() => deleteUser(person.id)}>Delete</button>
                            </div>
                            <hr />
                        </li>
                    ))
                )}
            </ul>
        </>
    );
}
