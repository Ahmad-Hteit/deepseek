/* eslint-disable no-undef */
import mongoose from "mongoose";

let cached = global.mongoose || { con: null, promise: null };

export default async function dbConnect() {
  if (cached.con) {
    return cached.con;
  }

  if (!cached.promise) {
    // const opts = {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    //   bufferCommands: false,
    // };

    cached.promise = mongoose
      .connect(process.env.MONGODB_URI)
      .then((mongoose) => mongoose);
  }
  try {
    cached.con = await cached.promise;
  } catch (e) {
    console.log("Error connecting to mongodb: ", e);
  }

  return cached.con;
}
