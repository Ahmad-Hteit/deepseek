import dbConnect from "@config/db";
import Chat from "@modules/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "User not authenticated",
      });
    }

    //Connect to db and fetch all chats from user
    //.sort({ createdAt: -1 })
    await dbConnect();
    const data = await Chat.find({ user: userId });

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
