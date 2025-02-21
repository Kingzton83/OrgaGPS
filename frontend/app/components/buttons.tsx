'use client';

import { useRouter } from 'next/navigation';


export function DarkBtn({ msg='', path='', type='button', onclick }:
                        { msg: string, path: string, type: any, onclick: any}) {
    const router = useRouter();
    
    if (!onclick) {
        onclick = () => router.push(path)
    }

    return (
        <button
            type={ type }
            className="dark-btn"
            onClick={onclick}
            >
            { msg }
        </button>
    );
}

export function LightBtn ({ msg='', path='', type='button' }:
                         { msg: string, path: string, type: any}) {
    const router = useRouter();

    return (
        <button
            type={ type }
            className="light-btn"
            >
            { msg }
        </button>
    );
}
