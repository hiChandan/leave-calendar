import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Event from "@/models/Event";

export async function GET() {
  await connectDB();
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const isoDate = threeMonthsAgo.toISOString();

  const events = await Event.find({
    startDate: { $gte: isoDate },
  }).lean();

  return NextResponse.json(events);
}

export async function POST(req: Request) {
  await connectDB();

  const body = await req.json();
  if (!body.memberId || !body.name || !body.startDate || !body.endDate) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const conflict = await Event.findOne({
    memberId: body.memberId,
    $or: [
      {
        startDate: { $lte: body.endDate, $gte: body.startDate },
      },
      {
        endDate: { $gte: body.startDate, $lte: body.endDate },
      },
      {
        startDate: { $lte: body.startDate },
        endDate: { $gte: body.endDate },
      },
    ],
  });
  if (conflict) {
    return NextResponse.json(
      { message: "Leave already exists for this person on selected dates" },
      { status: 409 },
    );
  }

  const event = await Event.create(body);

  return NextResponse.json(event);
}
