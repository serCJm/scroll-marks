import mongoose from "mongoose";

const MarksLogSchema = new mongoose.Schema(
	{
		address: { type: String, required: true },
		marks: Number,
		rank: Number
	},
	{ timestamps: true }
);

MarksLogSchema.index({ address: 1 }, { unique: true });

export default mongoose.model("MarksLog", MarksLogSchema);
