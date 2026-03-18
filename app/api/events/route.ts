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
        console.log("FILE:", file);
        console.log("FILE SIZE:", file?.size);

        if (!file || typeof file === "string") {
            return NextResponse.json(
                { message: "Valid image file is required" },
                { status: 400 }
            );
        }

        // ❌ Remove raw file from event
        delete event.image;

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
        const createdEvent = await Event.create(event);

        return NextResponse.json(
            {
                message: "Event Created Successfully",
                event: createdEvent,
            },
            { status: 201 }
        );

    } catch (e: any) {
        console.error("FULL ERROR:", e);

        return NextResponse.json(
            {
                message: "Event Creation Failed",
                error: e?.message || JSON.stringify(e),
            },
            { status: 500 }
        );
    }
}