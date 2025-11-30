import mongoose from "mongoose";
import Activity from "./src/models/Activity.js";
import UserProfile from "./src/models/UserProfile.js";

export const createUserProfile = async (userId) => {
  try {
    const uid = new mongoose.Types.ObjectId(userId);

    // Single-document aggregation that always returns all fields (or null)
    const [agg] = await Activity.aggregate([
      { $match: { userId: uid } },

      {
        $group: {
          _id: null,

          // transport: try details.distance_km
          avg_distance_km: {
            $avg: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$category", "Transport"] },
                    { $ne: [{ $ifNull: ["$details.distance_km", null] }, null] }
                  ]
                },
                "$details.distance_km",
                null
              ]
            }
          },

          // electricity: try details.electricity_bill
          avg_electricity_bill: {
            $avg: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$category", "Electricity"] },
                    { $ne: [{ $ifNull: ["$details.electricity_bill", null] }, null] }
                  ]
                },
                "$details.electricity_bill",
                null
              ]
            }
          },

          // food: try details.nonveg_meals
          avg_nonveg_meals: {
            $avg: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$category", "Food"] },
                    { $ne: [{ $ifNull: ["$details.nonveg_meals", null] }, null] }
                  ]
                },
                "$details.nonveg_meals",
                null
              ]
            }
          },

          // lpg: try details.lpg_kg
          avg_lpg_kg: {
            $avg: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$category", "LPG"] },
                    { $ne: [{ $ifNull: ["$details.lpg_kg", null] }, null] }
                  ]
                },
                "$details.lpg_kg",
                null
              ]
            }
          },

          // shopping: try details.item (or quantity maybe?)
          avg_items: {
            $avg: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$category", "Shopping"] },
                    { $ne: [{ $ifNull: ["$details.item", null] }, null] }
                  ]
                },
                "$details.item",
                null
              ]
            }
          },

          // waste: try multiple possible fields (weight_k g, weight, waste_kg)
          avg_waste_kg: {
            $avg: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$category", "Waste"] },
                    {
                      $ne: [
                        {
                          $ifNull: [
                            "$details.weight_kg",
                            { $ifNull: ["$details.weight", "$details.waste_kg"] }
                          ]
                        },
                        null
                      ]
                    }
                  ]
                },
                {
                  // use the first non-null of the plausible fields
                  $ifNull: [
                    "$details.weight_kg",
                    { $ifNull: ["$details.weight", "$details.waste_kg"] }
                  ]
                },
                null
              ]
            }
          },

          // water: try litres_used or litres
          avg_water_litres: {
            $avg: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$category", "Water"] },
                    {
                      $ne: [
                        {
                          $ifNull: ["$details.litres_used", "$details.litres"]
                        },
                        null
                      ]
                    }
                  ]
                },
                { $ifNull: ["$details.litres_used", "$details.litres"] },
                null
              ]
            }
          }
        }
      }
    ]);

    // If there were no activities at all
    if (!agg) {
      return { message: "No activities found for this user." };
    }

    // Build profileData (keep nulls when absent)
    const profileData = {
      userId,
      avg_daily_travel_km: agg.avg_distance_km ?? null,
      avg_electricity_kwh: agg.avg_electricity_bill ?? null,
      avg_lpg_kg: agg.avg_lpg_kg ?? null,
      avg_nonveg_meals: agg.avg_nonveg_meals ?? null,
      avg_items_purchased: agg.avg_items ?? null,
      avg_waste_kg: agg.avg_waste_kg ?? null,
      avg_water_litres: agg.avg_water_litres ?? null,
      cluster_label: null,
      cluster_name: null
    };

    const profile = new UserProfile(profileData);
    await profile.save();

    return { message: "UserProfile created successfully", profile };
  } catch (err) {
    console.error(err);
    return { error: err.message };
  }
};
