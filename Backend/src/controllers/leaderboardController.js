// leaderboardController.js
import User from "../models/Users.js";

export const getLeaderboard = async (req, res) => {
  try {
    const { period = "all", limit = 10 } = req.query;
    const currentUserId = req.query.userId;

    let leaderboardUsers;

    if (period === "month") {
      // If you want monthly leaderboard, you'd need to track monthly points
      // For now, we'll use all-time points
      leaderboardUsers = await User.find()
        .select("username points level streak")
        .sort({ points: -1 })
        .limit(parseInt(limit));
    } else {
      // All-time leaderboard
      leaderboardUsers = await User.find()
        .select("username points level streak")
        .sort({ points: -1 })
        .limit(parseInt(limit));
    }

    // Check if current user is in the top results
    const currentUserInTop = leaderboardUsers.find(
      (user) => user._id.toString() === currentUserId
    );

    let currentUserRank = null;
    let currentUserData = null;

    // If current user is not in top, find their rank
    if (!currentUserInTop && currentUserId) {
      const currentUser = await User.findById(currentUserId).select(
        "username points level streak"
      );

      if (currentUser) {
        // Count how many users have more points
        const rank = await User.countDocuments({
          points: { $gt: currentUser.points },
        });

        currentUserRank = rank + 1;
        currentUserData = {
          _id: currentUser._id,
          username: currentUser.username,
          points: currentUser.points,
          level: currentUser.level,
          streak: currentUser.streak,
          rank: currentUserRank,
          currentUser: true,
        };
      }
    }

    // Format the leaderboard with ranks
    const formattedLeaderboard = leaderboardUsers.map((user, index) => ({
      _id: user._id,
      username: user.username,
      points: user.points,
      level: user.level,
      streak: user.streak,
      rank: index + 1,
      currentUser: user._id.toString() === currentUserId,
    }));

    return res.json({
      success: true,
      leaderboard: formattedLeaderboard,
      currentUser: currentUserData, // Separate current user data if not in top
    });
  } catch (err) {
    console.error("Leaderboard Error:", err);
    return res.status(500).json({ error: err.message });
  }
};

// Optional: Get user's specific rank
export const getUserRank = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("username points level streak");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Count users with more points
    const rank = await User.countDocuments({
      points: { $gt: user.points },
    });

    return res.json({
      success: true,
      rank: rank + 1,
      user: {
        username: user.username,
        points: user.points,
        level: user.level,
        streak: user.streak,
      },
    });
  } catch (err) {
    console.error("Get Rank Error:", err);
    return res.status(500).json({ error: err.message });
  }
};

