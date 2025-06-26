/* eslint-disable no-undef */
import { Webhook } from "svix";
import dbConnect from "../../../config/db";
import User from "../../../modules/User";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const headerPayload = await headers(); // 🟢 FIXED: await this

    const svixHeaders = {
      "svix-id": headerPayload.get("svix-id"),
      "svix-signature": headerPayload.get("svix-signature"),
      "svix-timestamp": headerPayload.get("svix-timestamp"),
    };

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const evt = wh.verify(body, svixHeaders);

    const { data, type } = evt;

    const userData = {
      _id: data.id,
      email: data.email_addresses[0].email_address,
      name: `${data.first_name} ${data.last_name}`,
      image: data.image_url,
    };

    await dbConnect();

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
        break;
    }

    return NextResponse.json({ message: "Event received" });
  } catch (error) {
    console.error("❌ Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
