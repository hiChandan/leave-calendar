"use client";

import React, { useEffect, useState } from "react";
import { useSnack } from "@/app/SnackProvider";
import LeaveCalendar from "@/components/LeaveCalendar";
import EventModal from "./EventModal";

const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

type LeaveCalendarProps = {
  onAddLeave?: () => void;
};

type CalendarEvent = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

export default function DemoWrapper() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const { createSnack } = useSnack();

  useEffect(() => {
    fetch("api/events")
      .then((res) => res.json())
      .then(setEvents);
  }, []);

  const handleAddEvent = (event: CalendarEvent) => {
    setEvents((prev) => [...prev, event]); // instant UI update
  };

  return (
    <>
      <LeaveCalendar
        events={events}
        onAddLeave={() => {
          setSelectedDate(null);
          setShowModal(true);
        }}
      />

      {showModal && (
        <EventModal
          onSave={(event: CalendarEvent) => {
            setEvents((prev) => [...prev, event]);
            setShowModal(false);
            handleAddEvent;
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
