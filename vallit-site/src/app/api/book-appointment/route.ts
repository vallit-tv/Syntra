import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

// Define the request body interface
interface BookingRequest {
    name: string;
    email: string;
    company: string;
    customField: string;
    date: string; // ISO string
}

// Zoom API Types
interface ZoomTokenResponse {
    access_token: string;
    expires_in: number;
    scope: string;
    token_type: string;
}

interface ZoomMeetingResponse {
    id: number;
    join_url: string;
    start_url: string;
    password?: string;
}

async function getZoomAccessToken() {
    const accountId = process.env.ZOOM_ACCOUNT_ID;
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;

    if (!accountId || !clientId || !clientSecret) {
        throw new Error("Missing Zoom Credentials");
    }

    const tokenUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`;
    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

    const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
            Authorization: `Basic ${authHeader}`,
        },
        cache: "no-store",
    });

    if (!response.ok) {
        const error = await response.text();
        console.error("Zoom Token Error:", error);
        throw new Error(`Failed to get Zoom Token: ${response.status}`);
    }

    const data: ZoomTokenResponse = await response.json();
    return data.access_token;
}

async function createZoomMeeting(accessToken: string, topic: string, startTime: string) {
    const meetingData = {
        topic: topic,
        type: 2, // Scheduled meeting
        start_time: startTime, // ISO format
        duration: 60, // 1 hour
        timezone: "Europe/Berlin",
        settings: {
            host_video: true,
            participant_video: true,
            join_before_host: false,
            mute_upon_entry: true,
            waiting_room: true,
        },
    };

    const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(meetingData),
    });

    if (!response.ok) {
        const error = await response.text();
        console.error("Zoom Create Meeting Error:", error);
        throw new Error(`Failed to create Zoom meeting: ${response.status}`);
    }

    const data: ZoomMeetingResponse = await response.json();
    return data;
}

// Function to generate ICS file content
function generateICS(
    startTime: string,
    durationMinutes: number,
    subject: string,
    description: string,
    location: string,
    organizerName: string,
    organizerEmail: string
) {
    const startDate = new Date(startTime);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);

    const formatICSDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@vallit.net`;

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Vallit//Vallit Network//EN
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${formatICSDate(new Date())}
DTSTART:${formatICSDate(startDate)}
DTEND:${formatICSDate(endDate)}
SUMMARY:${subject}
DESCRIPTION:${description.replace(/\n/g, "\\n")}
LOCATION:${location}
ORGANIZER;CN=${organizerName}:mailto:${organizerEmail}
STATUS:CONFIRMED
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
}

export async function POST(req: Request) {
    try {
        const body: BookingRequest = await req.json();
        const { name, email, company, customField, date } = body;

        // 1. Get Zoom Token & Create Meeting
        console.log("Creating Zoom Meeting...");
        const zoomToken = await getZoomAccessToken();
        const meetingTopic = `Vallit Network: Call with ${company} (${name})`;
        const zoomMeeting = await createZoomMeeting(zoomToken, meetingTopic, date);

        console.log("Zoom Meeting Created:", zoomMeeting.id);

        // 2. Configure Email Transporter
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: Number(process.env.SMTP_PORT),
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });

        // 3. Generate ICS content
        const icsContent = generateICS(
            date,
            60, // 60 minutes
            meetingTopic,
            `Topic: ${customField}\n\nJoin Zoom Meeting:\n${zoomMeeting.join_url}`,
            zoomMeeting.join_url,
            "Vallit Network",
            "info@vallit.net"
        );

        // 4. Send Confirmation Email to User
        const userMailOptions = {
            from: '"Vallit Network" <info@vallit.net>',
            to: email,
            subject: `Confirmation: ${meetingTopic}`,
            html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background-color: #fafafa;">
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: #22c55e;">Appointment Confirmed</h2>
            </div>
            <p>Hi ${name},</p>
            <p>Your appointment with <strong>Vallit Network</strong> has been successfully scheduled.</p>
            
            <div style="background-color: #ffffff; padding: 15px; border-radius: 8px; border: 1px solid #eee; margin: 20px 0;">
                <p><strong>Topic:</strong> ${customField}</p>
                <p><strong>Time:</strong> ${new Date(date).toLocaleString("de-DE", { dateStyle: "full", timeStyle: "short" })}</p>
                <p><strong>Zoom Link:</strong> <a href="${zoomMeeting.join_url}" style="color: #007bff;">Join Meeting</a></p>
            </div>
            
            <p>A calendar invitation is attached to this email. Please add it to your calendar.</p>
            
            <p>Best regards,<br>The Vallit Network Team</p>
          </div>
        `,
            icalEvent: {
                filename: 'invitation.ics',
                method: 'request',
                content: icsContent
            }
        };

        // 5. Send Notification Email to Vallit (also includes ICS for easy adding)
        const adminMailOptions = {
            from: '"Vallit Bot" <info@vallit.net>',
            to: "info@vallit.net",
            subject: `NEW BOOKING: ${company} - ${name}`,
            html: `
          <div style="font-family: Arial, sans-serif; padding: 10px;">
            <h3>New Appointment Request</h3>
            <ul>
                <li><strong>Name:</strong> ${name}</li>
                <li><strong>Company:</strong> ${company}</li>
                <li><strong>Email:</strong> ${email}</li>
                <li><strong>Interest:</strong> ${customField}</li>
                <li><strong>Date:</strong> ${new Date(date).toLocaleString("de-DE")}</li>
            </ul>
            <p><strong>Zoom ID:</strong> ${zoomMeeting.id}</p>
            <p><a href="${zoomMeeting.start_url}">Start Meeting (Host)</a></p>
          </div>
        `,
            icalEvent: {
                filename: 'booking.ics',
                method: 'request',
                content: icsContent
            }
        };

        // Send both emails in parallel
        await Promise.all([
            transporter.sendMail(userMailOptions),
            transporter.sendMail(adminMailOptions)
        ]);

        console.log("Emails sent successfully.");

        return NextResponse.json({ success: true, meetingId: zoomMeeting.id });

    } catch (error) {
        console.error("Booking API Error:", error);
        return NextResponse.json(
            { error: "Failed to process booking", details: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
