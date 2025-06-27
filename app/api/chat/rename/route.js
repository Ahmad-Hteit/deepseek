import Chat from "@modules/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import dbConnect from "@config/db";

export async function POST(req) {
  try {
    const { userId } = getAuth(req);

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized User",
      });
    }

    const { chatId, name } = await req.json();

    //connect to db and update the chat name
    await dbConnect();
    await Chat.findByIdAndUpdate({ _id: chatId, userId }, { name });

    return NextResponse.json({ success: true, message: "Chat Renamed" });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}
