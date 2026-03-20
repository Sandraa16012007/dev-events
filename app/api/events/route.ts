import connectDB from "@/lib/mongodb";
import { NextRequest, NextResponse } from "next/server";
import Event from "@/database/event.model";
import { v2 as cloudinary } from "cloudinary";

// ✅ Auto-config from CLOUDINARY_URL
cloudinary.config({
    secure: true,
});

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const formData = await req.formData();
        const event: any = {};

        // ✅ Parse formData properly
        formData.forEach((value, key) => {
            if (event[key]) {
                event[key] = Array.isArray(event[key])
                    ? [...event[key], value]
                    : [event[key], value];
            } else {
                event[key] = value;
            }
        });

        // ✅ Fix arrays
        if (event.agenda && !Array.isArray(event.agenda)) {
            event.agenda = [event.agenda];
        }

        if (event.tags && !Array.isArray(event.tags)) {
            event.tags = [event.tags];
        }

        // 🔴 Get image file
        const file = formData.get("image") as File;

        if (!file || typeof file === "string") {
            return NextResponse.json(
                { message: "Valid image file is required" },
                { status: 400 }
            );
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json(
                { message: "Invalid image type. Allowed: JPEG, PNG, WebP, GIF" },
                { status: 400 }
            );
        }

        // Validate file size (e.g., max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { message: "Image size must be less than 5MB" },
                { status: 400 }
            );
        } delete event.image;

        let tags = JSON.parse(formData.get('tags') as string)
        let agenda = JSON.parse(formData.get('agenda') as string)

        // ✅ Convert to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // ✅ Upload to Cloudinary
        const uploadResult: any = await new Promise((resolve, reject) => {
            cloudinary.uploader
                .upload_stream(
                    { folder: "dev-events" },
                    (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }
                )
                .end(buffer);
        });

        // ✅ IMPORTANT: match schema field
        event.image = uploadResult.secure_url;

        // ✅ Save to DB
        const createdEvent = await Event.create({ ...event, tags: tags, agenda: agenda });

        return NextResponse.json(
            {
                message: "Event Created Successfully",
                event: createdEvent,
            },
            { status: 201 }
        );

    } catch (e: any) {
        console.error("Event creation failed:", e);

        return NextResponse.json(
            {
                message: "Event Creation Failed",
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    try {
        await connectDB();
        const events = await Event.find().sort({ createdAt: -1 });
        return NextResponse.json(
            {
                message: "Events fetched successfully",
                events,
            },
            { status: 200 }
        );
    }
    catch (e) {
        console.error("Failed to fetch events:", e);
        return NextResponse.json(
            {
                message: "Failed to fetch events"
            },
            { status: 500 }
        );
    }
}