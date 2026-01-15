

export default function PrivacyPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">

            <main className="flex-1 py-12 md:py-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tighter mb-8">
                        Privacy Policy
                    </h1>
                    <div className="prose prose-invert max-w-none text-muted-foreground">
                        <p className="lead text-xl text-foreground mb-8">
                            Your privacy is critically important to us. At Echo: The Bridge, we have a few fundamental principles:
                        </p>
                        <ul className="list-disc pl-6 space-y-2 mb-8">
                            <li>We don’t ask you for personal information unless we truly need it.</li>
                            <li>We don’t share your personal information with anyone except to comply with the law, develop our products, or protect our rights.</li>
                            <li>We don’t store personal information on our servers unless required for the on-going operation of one of our services.</li>
                        </ul>

                        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">1. Information We Collect</h2>
                        <p className="mb-4">
                            **Log Data:** Like most website operators, Echo: The Bridge collects non-personally-identifying information of the sort that web browsers and servers typically make available, such as the browser type, language preference, referring site, and the date and time of each visitor request.
                        </p>
                        <p className="mb-4">
                            **Personal Information:** When you sign up for an account, we ask for personal information such as your name and email address. When you create a vision, we store the content you provide to generate your roadmap.
                        </p>

                        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">2. How We Use Your Information</h2>
                        <p className="mb-4">
                            We use the information we collect to provide, maintain, protect, and improve our services, to develop new ones, and to protect Echo: The Bridge and our users. We also use this information to offer you tailored content – like giving you more relevant roadmap suggestions.
                        </p>

                        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">3. AI Processing</h2>
                        <p className="mb-4">
                            To provide our core service, your goal descriptions are processed by our AI partners (e.g., Google Gemini) to generate roadmaps. We have agreements in place to ensure this data is used solely for generating your output and is not used to train third-party models.
                        </p>

                        <h2 className="text-2xl font-bold text-foreground mt-8 mb-4">4. Security</h2>
                        <p className="mb-4">
                            The security of your Personal Information is important to us, but remember that no method of transmission over the Internet, or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Information, we cannot guarantee its absolute security.
                        </p>

                        <p className="mt-12 text-sm italic">
                            Last updated: January 14, 2026
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
