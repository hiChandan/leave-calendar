import mongoose, { Schema, models } from "mongoose";

const MemberSchema = new Schema(
    {
        name: { type:String, required: true },
        id: { type: Number, required: true, unique: true }
    },
    { timestamps: true }
);

export default models.Member || mongoose.model("Member", MemberSchema);
