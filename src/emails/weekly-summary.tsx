import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
} from '@react-email/components';
import * as React from 'react';

interface WeeklySummaryEmailProps {
    userName: string;
    completedTasks: { text: string }[];
    upcomingTasks: { text: string }[];
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';

export const WeeklySummaryEmail = ({
    userName,
    completedTasks,
    upcomingTasks,
}: WeeklySummaryEmailProps) => (
    <Html>
        <Head />
        <Preview>Your weekly progress summary from Echo: The Bridge</Preview>
        <Body style={main}>
            <Container style={container}>
                <Img
                    src={`${baseUrl}/logo.png`}
                    width="42"
                    height="42"
                    alt="Echo: The Bridge"
                    style={logo}
                />
                <Heading style={heading}>Your Weekly Progress Summary</Heading>
                <Text style={paragraph}>Hi {userName},</Text>
                <Text style={paragraph}>
                    Here’s a look at your progress this week. Consistency is the key to bridging the gap between your vision and reality.
                </Text>
                
                {completedTasks.length > 0 && (
                    <Section>
                        <Heading as="h2" style={subHeading}>Wins this Week 🏆</Heading>
                        <ul style={list}>
                            {completedTasks.map((task, i) => (
                                <li key={i}><Text style={listItem}>{task.text}</Text></li>
                            ))}
                        </ul>
                    </Section>
                )}

                {upcomingTasks.length > 0 && (
                     <Section>
                        <Heading as="h2" style={subHeading}>Focus for Next Week ✨</Heading>
                         <ul style={list}>
                            {upcomingTasks.map((task, i) => (
                                <li key={i}><Text style={listItem}>{task.text}</Text></li>
                            ))}
                        </ul>
                    </Section>
                )}
                
                <Section style={buttonContainer}>
                    <Link style={button} href={`${baseUrl}/dashboard`}>
                        View Your Full Roadmap
                    </Link>
                </Section>

                <Hr style={hr} />
                <Text style={footer}>
                    Echo: The Bridge | Bridge your vision to reality
                </Text>
            </Container>
        </Body>
    </Html>
);

export default WeeklySummaryEmail;

const main = {
    backgroundColor: '#1c1c1c',
    fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
    color: '#eaeaea',
};

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    width: '580px',
};

const logo = {
    margin: '0 auto',
};

const heading = {
    fontSize: '32px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    color: '#00F5A0',
};

const subHeading = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#7DF9FF',
};


const paragraph = {
    fontSize: '16px',
    lineHeight: '24px',
    textAlign: 'left' as const,
};

const list = {
    paddingLeft: '20px',
}

const listItem = {
     ...paragraph,
     margin: '4px 0',
}

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '32px 0',
};

const button = {
    backgroundColor: '#00F5A0',
    borderRadius: '8px',
    color: '#1a1a1a',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 24px',
};

const hr = {
    borderColor: '#333',
    margin: '20px 0',
};

const footer = {
    color: '#888888',
    fontSize: '12px',
    lineHeight: '24px',
};
