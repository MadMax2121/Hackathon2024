"use client"
import Image from "next/image";
import "./page.css";
import Calendar from "./Calendar";
import { useState } from "react";
import EventFinder from "./api-requests";

// Fetch events from the UMBInvolved API
// Get the queries

export default function Home() {
  const [events, setEvents] = useState([]); // Initialize the events array state here

  // Function to handle updating the events array
  const updateEvents = (newEvents) => {
    setEvents(newEvents);
  };

  return (
    <div className="main">
      {/* Pass the events array and the update function as props to Calendar */}
      <Calendar events={events} updateEvents={updateEvents} />
      {console.log(events)}
    </div>
  );
}
