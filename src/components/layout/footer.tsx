'use client';

import Link from 'next/link';
import { Rocket, Github, Twitter, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Footer() {
    return (
        <footer className="bg-secondary/30 border-t border-border/50 pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <div className="space-y-4">
                        <Link href="/" className="flex items-center space-x-2">
                            <Rocket className="h-6 w-6 text-primary" suppressHydrationWarning />
                            <span className="font-bold text-xl font-headline">Echo: The Bridge</span>
                        </Link>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                            Empowering individuals to turn their wildest dreams into actionable reality through the power of AI-driven strategy.
                        </p>
                        <div className="flex space-x-4">
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Twitter className="h-5 w-5" suppressHydrationWarning />
                                <span className="sr-only">Twitter</span>
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Github className="h-5 w-5" suppressHydrationWarning />
                                <span className="sr-only">GitHub</span>
                            </Link>
                            <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                                <Linkedin className="h-5 w-5" suppressHydrationWarning />
                                <span className="sr-only">LinkedIn</span>
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-4">Platform</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li>
                                <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                            </li>
                            <li>
                                <Link href="/plans" className="hover:text-primary transition-colors">Pricing</Link>
                            </li>
                            <li>
                                <Link href="/vision/new" className="hover:text-primary transition-colors">Create Vision</Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-4">Company</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li>
                                <Link href="/about" className="hover:text-primary transition-colors">About Us</Link>
                            </li>
                            <li>
                                <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
                            </li>
                            <li>
                                <Link href="/faq" className="hover:text-primary transition-colors">FAQ</Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
                            </li>
                            <li>
                                <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg mb-4">Stay Updated</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Subscribe to our newsletter for tips on goal setting and AI productivity.
                        </p>
                        <div className="flex gap-2">
                            <Input placeholder="Enter your email" className="bg-background" />
                            <Button size="icon">
                                <Rocket className="h-4 w-4" suppressHydrationWarning />
                                <span className="sr-only">Subscribe</span>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Echo: The Bridge. All rights reserved.</p>
                    <div className="flex gap-6">
                        <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
                        <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
