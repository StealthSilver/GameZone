import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { username } = await request.json();

    if (!username || username.trim().length === 0) {
      return NextResponse.json(
        { error: "Username is required" },
        { status: 400 }
      );
    }

    const normalizedUsername = username.trim().toLowerCase();

    // Check if username already exists
    const existingUser = await User.findOne({ username: normalizedUsername });

    if (existingUser) {
      return NextResponse.json(
        { error: "Username already taken" },
        { status: 409 }
      );
    }

    // Create new user
    const newUser = await User.create({
      username: normalizedUsername,
      highScore: 0,
    });

    return NextResponse.json(
      {
        message: "User created successfully",
        user: {
          username: newUser.username,
          highScore: newUser.highScore,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error checking username:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
