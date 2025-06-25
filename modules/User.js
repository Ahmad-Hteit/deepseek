import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
      // default: () => new mongoose.Types.ObjectId().toString(),
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    image: {
      type: String,
      required: false,
    },
    //   password: {
    //     type: String,
    //     required: true,
    //   },
    //   role: {
    //     type: String,
    //     enum: ["admin", "user"],
    //     default: "user",
    //   },
    //   createdAt: {
    //     type: Date,
    //     default: Date.now,
    //   },
    //   updatedAt: {
    //     type: Date,
    //     default: Date.now,
    //   },
    //   resetPasswordToken: String,
    //   resetPasswordExpire: Date,
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
