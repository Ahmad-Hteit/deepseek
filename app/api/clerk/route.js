/* eslint-disable no-undef */
import { Webhook } from "svix";
import dbConnect from "../../../config/db";
import User from "../../../modules/User";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    console.log("🔔 Clerk webhook triggered");

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const headerPayload = headers();
    const svixHeaders = {
      "svix-id": headerPayload.get("svix-id"),
      "svix-signature": headerPayload.get("svix-signature"),
      "svix-timestamp": headerPayload.get("svix-timestamp"),
    };

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const { data, type } = wh.verify(body, svixHeaders);
    console.log("📦 Event Type:", type);
    console.log("👤 User Data:", data);

    const userData = {
      _id: data.id,
      email: data.email_addresses?.[0]?.email_address ?? "unknown@clerk.dev",
      name: `${data.first_name} ${data.last_name}`,
      image: data.image_url,
    };

    await dbConnect();
    console.log("✅ Connected to MongoDB");

    switch (type) {
      case "user.created":
        await User.create(userData);
        break;
      case "user.updated":
        await User.findByIdAndUpdate(data.id, userData);
        break;
      case "user.deleted":
        await User.findByIdAndDelete(data.id);
        break;
      default:
        console.warn("⚠️ Unknown event type:", type);
        break;
    }

    return NextResponse.json({ message: "✅ Webhook handled" });
  } catch (err) {
    console.error("❌ Webhook error:", err.message, err.stack);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
