import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Member from "@/models/Member";

export async function GET() {
  await connectDB();

  const members = await Member.find().sort({ name: 1 }).lean();

  return NextResponse.json(members);
}
