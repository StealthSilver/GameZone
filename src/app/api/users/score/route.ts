import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { score } = await request.json();

    if (score === undefined) {
      return NextResponse.json({ error: "Score is required" }, { status: 400 });
    }

    // Use a default/global username for storing high scores
    const globalUsername = "global_player";

    // Find or create global user
    let user = await User.findOne({ username: globalUsername });

    if (!user) {
      user = await User.create({
        username: globalUsername,
        highScore: 0,
      });
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
