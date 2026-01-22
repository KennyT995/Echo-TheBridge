import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Contact Us | Echo: The Bridge",
    description: "Get in touch with the Echo: The Bridge team for support, partnerships, or feedback."
};

export default function ContactLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
