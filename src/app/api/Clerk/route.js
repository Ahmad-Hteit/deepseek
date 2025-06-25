/* eslint-disable no-undef */
import { Webhook } from "svix";
import { headers } from "next/headers";
import dbConnect from "@/config/db"; // update if your path is different
import User from "@/modules/User"; // update if your path is different

export async function POST(req) {
  console.log("🔔 Clerk webhook triggered");

  try {
    const payload = await req.json();
    const body = JSON.stringify(payload);

    const headerPayload = headers();
    const svixHeaders = {
      "svix-id": headerPayload.get("svix-id"),
      "svix-timestamp": headerPayload.get("svix-timestamp"),
      "svix-signature": headerPayload.get("svix-signature"),
    };

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
    const { data, type } = wh.verify(body, svixHeaders);

    console.log("📦 Webhook Event:", type, data);

    const userData = {
      _id: data.id,
      name: `${data.first_name} ${data.last_name}`,
      email: data.email_addresses[0].email_address,
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
        return new Response("Unhandled event", { status: 400 });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Webhook error:", err);
    return new Response("Webhook error", { status: 500 });
  }
}
