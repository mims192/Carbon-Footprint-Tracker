import mongoose from "mongoose";
import { createUserProfile } from "./userprofrecord.js";

mongoose.connect("mongodb+srv://rivx192_db_user:00VrqciYch2qdYMO@tracker.e8wjjxz.mongodb.net/?appName=tracker")
  .then(async () => {
    console.log("DB connected");
    
    const result = await createUserProfile("6929b9fcc091efb900ceffca");
    console.log(result);

    process.exit();
  })
  .catch(err => console.error(err));
