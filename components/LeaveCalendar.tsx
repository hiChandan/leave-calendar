"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
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

type LeaveEvent = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

type LeaveCalendarProps = {
  events: LeaveEvent[];
  onAddLeave: () => void;
};
const COLORS = [
  "from-pink-400 to-rose-500",
  "from-indigo-400 to-blue-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-purple-400 to-fuchsia-500",
  "from-cyan-400 to-sky-500",
];

function getColorByName(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}

export default function LeaveCalendar({
  onAddLeave,
  events = [],
}: LeaveCalendarProps) {
  const [today, setToday] = useState(() => new Date());
  const dayRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(0);
  const monthOptions = monthNames.map((month, index) => ({
    name: month,
    value: `${index}`,
  }));
 
  useEffect(() => {
    const now = new Date();
    setToday(now);
    setYear(now.getFullYear());
    console.log("loaded from useEffect SET today ", now);
  }, []);
  

  const scrollToDay = (monthIndex: number, dayIndex: number) => {
    // console.log(
    //   'refs count:',
    //   dayRefs.current.length,
    //   'non-null:',
    //   dayRefs.current.filter(Boolean).length
    // );
    //pendingScroll.current = { month: monthIndex, day: dayIndex };
    const targetDayIndex = dayRefs.current.findIndex(
      (ref) =>
        ref &&
        ref.getAttribute("data-month") === `${monthIndex}` &&
        ref.getAttribute("data-day") === `${dayIndex}`,
    );

    const targetElement = dayRefs.current[targetDayIndex];

    if (targetDayIndex !== -1 && targetElement) {
      const container = document.querySelector(".calendar-container");
      const elementRect = targetElement.getBoundingClientRect();

      const is2xl = window.matchMedia("(min-width: 1536px)").matches;

      const offsetFactor = is2xl ? 3 : 2.5;

      if (container) {
        const containerRect = container.getBoundingClientRect();

        const offset =
          elementRect.top -
          containerRect.top -
          containerRect.height / offsetFactor +
          elementRect.height / 2;

        container.scrollTo({
          top: container.scrollTop + offset,

          behavior: "smooth",
        });
      } else {
        const offset =
          window.scrollY +
          elementRect.top -
          window.innerHeight / offsetFactor +
          elementRect.height / 2;
        window.scrollTo({
          top: offset,
          behavior: "smooth",
        });
      }
    }
  };

  const handlePrevYear = () => setYear((prevYear) => prevYear - 1);
  const handleNextYear = () => setYear((prevYear) => prevYear + 1);

  const handleMonthChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const monthIndex = parseInt(event.target.value, 10);
    setSelectedMonth(monthIndex);
    scrollToDay(monthIndex, 1);
  };
  const nameLimit = 7;
  const handleTodayClick = () => {
    setYear(today.getFullYear());
    scrollToDay(today.getMonth(), today.getDate());
  };

  useLayoutEffect(() => {
    scrollToDay(today.getMonth(), today.getDate());
    console.log("loaded from useLayoutEffect  today ", today);
  }, [today, year, events]);

  const generateCalendar = useMemo(() => {
    const daysInYear = (): { month: number; day: number }[] => {
      const daysInYear = [];
      const startDayOfWeek = new Date(year, 0, 1).getDay();

      if (startDayOfWeek < 6) {
        for (let i = 0; i < startDayOfWeek; i++) {
          daysInYear.push({ month: -1, day: 32 - startDayOfWeek + i });
        }
      }

      for (let month = 0; month < 12; month++) {
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        for (let day = 1; day <= daysInMonth; day++) {
          daysInYear.push({ month, day });
        }
      }

      const lastWeekDayCount = daysInYear.length % 7;
      if (lastWeekDayCount > 0) {
        const extraDaysNeeded = 7 - lastWeekDayCount;
        for (let day = 1; day <= extraDaysNeeded; day++) {
          daysInYear.push({ month: 0, day });
        }
      }

      return daysInYear;
    };

    const calendarDays = daysInYear();

    const calendarWeeks = [];
    for (let i = 0; i < calendarDays.length; i += 7) {
      calendarWeeks.push(calendarDays.slice(i, i + 7));
    }

    const calendar = calendarWeeks.map((week, weekIndex) => (
      <div className="flex w-full" key={`week-${weekIndex}`}>
        {week.map(({ month, day }, dayIndex) => {
          const index = weekIndex * 7 + dayIndex;
          const isNewMonth =
            index === 0 || calendarDays[index - 1].month !== month;
          const isToday =
            today.getMonth() === month &&
            today.getDate() === day &&
            today.getFullYear() === year;

          const cellDate = month < 0 ? null : new Date(year, month, day);

          const dayEvents = cellDate
            ? events.filter((event) => {
                const start = new Date(event.startDate);
                const end = new Date(event.endDate);

                // normalize time
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);
                cellDate.setHours(12, 0, 0, 0);
                // if (cellDate >= start && cellDate <= end) {
                //   console.log("RANGE CHECK Continuous 177", cellDate, start, end);
                // }
                return cellDate >= start && cellDate <= end;
              })
            : [];
          if (isToday) console.log(day, month, year);

          return (
            <div
              key={`${month}-${day}`}
              ref={(el) => {
                dayRefs.current[index] = el;
              }}
              data-month={month}
              data-day={day}
              // onClick={() => handleDayClick(day, month, year)}
              className={`relative z-10 m-[-0.5px] group aspect-square w-full grow  cursor-pointer rounded-xl border font-medium transition-all hover:z-20 hover:border-cyan-400 sm:-m-px sm:size-20 sm:rounded-2xl sm:border-2 lg:size-36 lg:rounded-3xl 2xl:size-40`}
            >
              <span
                className={`absolute left-1 top-1 flex size-5 items-center justify-center rounded-full text-xs sm:size-6 sm:text-sm lg:left-2 lg:top-2 lg:size-8 lg:text-base ${isToday ? "border-2 border-blue-500  font-semibold " : ""} ${month < 0 ? "text-slate-400" : "text-slate-800"}`}
              >
                {day}
              </span>
              {isNewMonth && (
                <span className="absolute bottom-0.5 left-0 w-full truncate px-1.5 text-sm font-semibold text-slate-300 sm:bottom-0 sm:text-lg lg:bottom-2.5 lg:left-3.5 lg:-mb-1 lg:w-fit lg:px-0 lg:text-xl 2xl:mb-[-4px] 2xl:text-2xl">
                  {monthNames[month]}
                </span>
              )}
              <div className="mt-6 pt-3 flex flex-wrap gap-1 px-1">
                {dayEvents.slice(0, nameLimit).map((event) => {
                  const colorClass = getColorByName(event.name);
                  return (
                    <div
                      key={event.id}
                      title={event.name}
                      className={`
                      rounded-full
                      bg-gradient-to-r ${colorClass}
                      px-2 py-0.5
                      text-[10px] font-semibold text-white
                      truncate
                      shadow-sm
                      cursor-default
                      max-w-full
                    `}
                    >
                      {event.name.trim().split(/\s+/)[0]}
                    </div>
                  );
                })}

                {dayEvents.length > nameLimit && (
                  <div className="relative group">
                    <div className="flex items-center gap-1 cursor-pointer rounded-full bg-slate-200 px-2 py-0.5 text-[11px] text-slate-700 hover:bg-slate-300">
                      <span>+{dayEvents.slice(nameLimit).length}</span>
                      <span>ⓘ</span>
                    </div>

                    <div className="absolute z-50 hidden group-hover:block w-48 rounded-lg bg-white p-2 shadow-xl border border-slate-200 mt-1">
                      <div className="text-xs font-semibold text-slate-600 mb-1">
                        More people
                      </div>

                      <div className="flex flex-col gap-1 max-h-40 overflow-auto">
                        {dayEvents.slice(nameLimit).map((event) => (
                          <div
                            key={event.id}
                            className="rounded-md bg-slate-100 px-2 py-1 text-[11px] text-slate-700"
                          >
                            {event.name.trim()}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    ));

    return calendar;
  }, [year, events, today]);
  // useLayoutEffect(() => {

  //   if (!pendingScroll.current) return;

  //   const { month, day } = pendingScroll.current;

  //   const targetDayIndex = dayRefs.current.findIndex(
  //     (ref) =>
  //       ref &&
  //       ref.getAttribute('data-month') === `${month}` &&
  //       ref.getAttribute('data-day') === `${day}`
  //   );

  //   if (targetDayIndex === -1) {
  //     console.warn('Scroll target not found yet', { month, day });
  //     return;
  //   }

  //   const targetElement = dayRefs.current[targetDayIndex];
  //   const container = document.querySelector('.calendar-container') as HTMLElement | null;

  //   if (!targetElement || !container) return;

  //   const is2xl = window.matchMedia('(min-width: 1536px)').matches;
  //   const offsetFactor = is2xl ? 3 : 2.5;

  //   const targetOffsetTop = targetElement.offsetTop;
  //   const scrollPosition =
  //     targetOffsetTop - container.offsetTop - container.clientHeight / offsetFactor;

  //   container.scrollTo({
  //     top: scrollPosition,
  //     behavior: 'smooth',
  //   });

  //   // clear intent
  //   pendingScroll.current = null;
  // }, [year, events]);

  useEffect(() => {
    const calendarContainer = document.querySelector(".calendar-container");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const month = parseInt(
              entry.target.getAttribute("data-month")!,
              10,
            );
            setSelectedMonth(month);
          }
        });
      },
      {
        root: calendarContainer,
        rootMargin: "-75% 0px -25% 0px",
        threshold: 0,
      },
    );

    dayRefs.current.forEach((ref) => {
      if (ref && ref.getAttribute("data-day") === "15") {
        observer.observe(ref);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className="calendar-container h-[95vh] overflow-y-scroll no-scrollbar rounded-t-2xl bg-white pb-10 text-slate-800 shadow-xl">
      <div className="sticky top-0 z-50 bg-white px-5 pt-7 sm:px-8 sm:pt-8">
        {" "}
        <div className="mb-4 flex w-full flex-wrap items-center justify-between gap-6">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Select
              name="month"
              value={`${selectedMonth}`}
              options={monthOptions}
              onChange={handleMonthChange}
            />
            <button
              onClick={handleTodayClick}
              type="button"
              className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-900 hover:bg-gray-100 lg:px-5 lg:py-2.5"
            >
              Today
            </button>
            <button
              type="button"
              onClick={onAddLeave}
              className="whitespace-nowrap rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1.5 text-center text-sm font-medium text-white hover:bg-gradient-to-bl focus:outline-none focus:ring-4 focus:ring-cyan-300 sm:rounded-xl lg:px-5 lg:py-2.5"
            >
              + Add Leave
            </button>
          </div>

          <div className="absolute right-4 top-2 text-[10px] text-slate-300">
            Build by Chandan Chauhan
          </div>

          <div className="flex w-fit items-center justify-between">
            <button
              onClick={handlePrevYear}
              className="rounded-full border border-slate-300 p-1 transition-colors hover:bg-slate-100 sm:p-2"
            >
              <svg
                className="size-5 text-slate-800"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m15 19-7-7 7-7"
                />
              </svg>
            </button>
            <h1 className="min-w-16 text-center text-lg font-semibold sm:min-w-20 sm:text-xl">
              {year}
            </h1>
            <button
              onClick={handleNextYear}
              className="rounded-full border border-slate-300 p-1 transition-colors hover:bg-slate-100 sm:p-2"
            >
              <svg
                className="size-5 text-slate-800"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m9 5 7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
        <div className="grid w-full grid-cols-7 justify-between text-slate-500">
          {daysOfWeek.map((day, index) => (
            <div
              key={index}
              className="w-full border-b border-slate-200 py-2 text-center font-semibold"
            >
              {day}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full px-5 pt-4 sm:px-8 sm:pt-6">{generateCalendar}</div>
    </div>
  );
}

export interface SelectProps {
  name: string;
  value: string;
  label?: string;
  options: { name: string; value: string }[];
  onChange: (_event: React.ChangeEvent<HTMLSelectElement>) => void;
  className?: string;
}

export const Select = ({
  name,
  value,
  label,
  options = [],
  onChange,
  className,
}: SelectProps) => (
  <div className={`relative ${className}`}>
    {label && (
      <label htmlFor={name} className="mb-2 block font-medium text-slate-800">
        {label}
      </label>
    )}
    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className="cursor-pointer rounded-lg border border-gray-300 bg-white py-1.5 pl-2 pr-6 text-sm font-medium text-gray-900 hover:bg-gray-100 sm:rounded-xl sm:py-2.5 sm:pl-3 sm:pr-8"
      required
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.name}
        </option>
      ))}
    </select>
    <span className="pointer-events-none absolute inset-y-0 right-0 ml-3 flex items-center pr-1 sm:pr-2">
      <svg
        className="size-5 text-slate-600"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </span>
  </div>
);
