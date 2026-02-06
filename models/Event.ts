import mongoose, { Schema, models } from "mongoose";

const EventSchema = new Schema(
  {
    memberId: { type: Number, required: true },
    name: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
);

export default models.Event || mongoose.model("Event", EventSchema);
