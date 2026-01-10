import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { score, gameMode } = await request.json();

    if (score === undefined) {
      return NextResponse.json({ error: "Score is required" }, { status: 400 });
    }

    if (!gameMode || !["easy", "medium", "hard"].includes(gameMode)) {
      return NextResponse.json(
        { error: "Valid game mode is required (easy, medium, or hard)" },
        { status: 400 }
      );
    }

    // Use a default/global username for storing high scores
    const globalUsername = "global_player";

    // Find or create global user
    let user = await User.findOne({ username: globalUsername });

    if (!user) {
      user = await User.create({
        username: globalUsername,
        highScore: 0,
        highScores: {
          easy: 0,
          medium: 0,
          hard: 0,
        },
      });
    }

    // Ensure highScores object exists (for backward compatibility)
    if (!user.highScores) {
      user.highScores = {
        easy: 0,
        medium: 0,
        hard: 0,
      };
    }

    const currentHighScore =
      user.highScores[gameMode as keyof typeof user.highScores];

    if (score > currentHighScore) {
      user.highScores[gameMode as keyof typeof user.highScores] = score;
      await user.save();

      return NextResponse.json({
        message: "New high score!",
        highScore: score,
        gameMode,
        isNewHighScore: true,
      });
    }

    return NextResponse.json({
      message: "Score saved",
      highScore: currentHighScore,
      gameMode,
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
