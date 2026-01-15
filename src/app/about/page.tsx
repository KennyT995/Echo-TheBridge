import Image from 'next/image';
import placeholderData from '@/app/lib/placeholder-images.json';

export default function AboutPage() {
    return (
        <div className="flex flex-col min-h-screen bg-background">

            <main className="flex-1 py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-16">
                        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter mb-6">
                            Democratizing Strategic Planning for Everyone
                        </h1>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            We believe that the power to shape the future shouldn't be reserved for Fortune 500 CEOs.
                            Echo: The Bridge brings high-level strategic intelligence to your personal life.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
                        <div className="relative h-[400px] rounded-lg overflow-hidden">
                            <Image
                                src={placeholderData.about.team}
                                alt="Our team brainstorming"
                                fill
                                className="object-cover"
                                data-ai-hint="team brainstorming office"
                            />
                        </div>
                        <div className="space-y-6">
                            <h2 className="text-3xl font-bold font-headline">Our Story</h2>
                            <p className="text-muted-foreground">
                                It started with a simple observation: most people have Big Dreams, but virtually no one has a reliable system for achieving them. We often get stuck in the "daily grind" and lose sight of the bigger picture.
                            </p>
                            <p className="text-muted-foreground">
                                Echo: The Bridge was built to solve this. By combining proven strategic planning frameworks with cutting-edge Generative AI, we provide a dynamic "Living Roadmap" that adapts to your life, keeping you focused on what truly matters.
                            </p>
                        </div>
                    </div>

                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold font-headline mb-12">The Minds Behind the Bridge</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            {placeholderData.about.members.map((member, i) => (
                                <div key={i} className="flex flex-col items-center">
                                    <div className="relative w-48 h-48 rounded-full overflow-hidden mb-4 border-4 border-primary/20">
                                        <Image
                                            src={member.img}
                                            alt={member.name}
                                            fill
                                            className="object-cover"
                                            data-ai-hint={`professional headshot ${member.role.split(' ')[0]}`}
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold">{member.name}</h3>
                                    <p className="text-muted-foreground">{member.role}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
