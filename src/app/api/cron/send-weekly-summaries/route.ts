import { NextResponse } from 'next/server';
import { admin } from '@/firebase/admin';
import { Resend } from 'resend';
import { WeeklySummaryEmail } from '@/emails/weekly-summary';

const resend = new Resend(process.env.RESEND_API_KEY);

interface RoadmapItem {
    text: string;
    completed: boolean;
}

interface Roadmap {
    id: string;
    weeklyTactics: RoadmapItem[];
    // Add other fields if needed for the email
}

export async function GET(request: Request) {
    // Secure this endpoint with a cron job secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const usersSnapshot = await admin.firestore().collection('users').get();

        for (const userDoc of usersSnapshot.docs) {
            const user = userDoc.data();
            if (!user.email) continue;

            const roadmapsSnapshot = await userDoc.ref.collection('roadmaps').get();
            if (roadmapsSnapshot.empty) continue;

            // For simplicity, we'll just use the first roadmap.
            // A real app might aggregate data from all roadmaps.
            const roadmap = roadmapsSnapshot.docs[0].data() as Roadmap;
            const completedLastWeek = roadmap.weeklyTactics.filter(t => t.completed); // Simplified logic
            const upcomingThisWeek = roadmap.weeklyTactics.filter(t => !t.completed);

            if (completedLastWeek.length === 0 && upcomingThisWeek.length === 0) continue;

            await resend.emails.send({
                from: 'Echo: The Bridge <no-reply@yourdomain.com>', // Replace with your verified Resend domain
                to: user.email,
                subject: 'Your Weekly Vision Bridge Summary',
                react: WeeklySummaryEmail({
                    userName: user.displayName || 'Visionary',
                    completedTasks: completedLastWeek,
                    upcomingTasks: upcomingThisWeek,
                }),
            });
        }

        return NextResponse.json({ message: 'Weekly summaries sent successfully.' });

    } catch (error: any) {
        console.error("Error sending weekly summaries:", error);
        return new NextResponse(error.message, { status: 500 });
    }
}
