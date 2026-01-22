import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: "About Us | Echo: The Bridge",
    description: "Learn about Echo: The Bridge and our mission to help you turn your long-term vision into daily action."
};

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-12 md:py-24 max-w-4xl">
            <h1 className="font-headline text-4xl md:text-5xl font-bold mb-8">About Echo: The Bridge</h1>
            <div className="prose prose-lg dark:prose-invert max-w-none">
                <p>
                    Echo: The Bridge is designed to solve a fundamental problem: the gap between long-term ambition and daily execution.
                    We believe that everyone has a vision for their future self, but the path to get there is often obscured by the noise of daily life.
                </p>
                <p>
                    Our platform acts as the bridge. By using advanced AI to reverse-engineer your 10-year vision into
                    yearly milestones, monthly sprints, weekly tactics, and daily habits, we ensure that every action you take
                    is a step towards your ultimate goal.
                </p>
                <h2>Our Philosophy</h2>
                <p>
                    We believe in &quot;actionable dreaming.&quot; A vision without a plan is just a dream. A plan without a vision is drudgery.
                    But a vision with a plan can change your life.
                </p>
            </div>
        </div>
    );
}
