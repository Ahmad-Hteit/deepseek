import dbConnect from "@config/db";
import Chat from "@modules/Chat";
import { getAuth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId } = getAuth(req);
    const { chatId } = req.json();

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized User",
      });
    }

    //connect to db and delete the chat

    await dbConnect();
    await Chat.deleteOne({ _id: chatId, userId });

    return NextResponse.json({
      success: true,
      message: "Chat Deleted",
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}
