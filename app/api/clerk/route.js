/* eslint-disable no-undef */
import { Webhook } from "svix";
import dbConnect from "../../../config/db";
import User from "../../../modules/User";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export async function POST(req) {
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET);
  const headerPayload = await headers();
  const svixHeaders = {
    "svix-id": headerPayload.get("svix-id"),
    "svix-signature": headerPayload.get("svix-signature"),
    "svix-timestamp": headerPayload.get("svix-timestamp"),
  };

  //get the payload and verify it
  const payload = await req.json();
  const body = JSON.stringify(payload);

  const { data, type } = wh.verify(body, svixHeaders);

  //prepare user data to save in db
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

  return NextResponse.json({ message: "Event Recieved" });
}
