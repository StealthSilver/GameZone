import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { username, score } = await request.json();

    if (!username || score === undefined) {
      return NextResponse.json(
        { error: "Username and score are required" },
        { status: 400 }
      );
    }

    const normalizedUsername = username.trim().toLowerCase();

    // Find user and update high score if new score is higher
    const user = await User.findOne({ username: normalizedUsername });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (score > user.highScore) {
      user.highScore = score;
      await user.save();

      return NextResponse.json({
        message: "New high score!",
        highScore: user.highScore,
        isNewHighScore: true,
      });
    }

    return NextResponse.json({
      message: "Score saved",
      highScore: user.highScore,
      isNewHighScore: false,
    });
  } catch (error) {
    console.error("Error saving score:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
