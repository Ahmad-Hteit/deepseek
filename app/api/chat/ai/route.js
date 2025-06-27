/* eslint-disable no-undef */
export const maxDuration = 60;
import { getAuth } from "@clerk/nextjs/server";
import dbConnect from "@config/db";
import Chat from "@modules/Chat";
import { NextResponse } from "next/server";
import OpenAI from "openai";

//intialize deepseek openai client and deepseek api
const openai = new OpenAI({
  baseURL: "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY,
});

export async function POST(req) {
  try {
    const { userId } = getAuth(req);

    //extract chatId and prompt from request body

    const { chatId, prompt } = await req.json();

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized User",
      });
    }

    //Find the chat document in the db based on userID and chatId
    await dbConnect();
    const data = await Chat.findOne({ userId, _id: chatId });
    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "Chat not found",
        },
        { status: 404 }
      );
    }

    //create a user message object
    const userPrompt = {
      role: "user",
      content: prompt,
      timestamp: Date.now(),
    };

    data.messages.push(userPrompt);
    //Deepseek call api

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: data.messages, // the whole chat history
      store: true,
    });

    const message = completion.choices[0].message;
    message.timestamp = Date.now();
    data.messages.push(message);
    data.save();

    return NextResponse.json({
      success: true,
      message: message,
    });
  } catch (e) {
    return NextResponse.json(
      { success: false, error: e.message },
      { status: 500 }
    );
  }
}
