import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    return NextResponse.json({ message: 'Weekly summary feature is temporarily disabled due to library incompatibility.' });
}
