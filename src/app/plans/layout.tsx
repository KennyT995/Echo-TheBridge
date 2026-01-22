import { Metadata } from 'next';

export const metadata: Metadata = {
    title: "Pricing & Plans | Echo: The Bridge",
    description: "Find the perfect plan to accelerate your journey. From the free Trailblazer tier to the unlimited Visionary experience."
};

export default function PlansLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
