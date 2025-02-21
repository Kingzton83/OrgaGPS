// app/activate/layout.tsx
'use client';

export default function ActivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main
      style={{
        display: 'flex',
        flexDirection: 'column',  // optional, falls du vertikale Elemente hast
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#fff', // Hintergrundfarbe anpassen, falls nötig
        padding: '1rem',         // optionaler Innenabstand
      }}
    >
      {children}
    </main>
  );
}
