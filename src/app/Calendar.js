'use client';
import React, { useState, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import * as ical from "ical.js";
import { parseISO, add, format } from "date-fns";
import { RRule } from "rrule";
import './Calendar.css'; 

function Calendar({ events, updateEvents }) {
 
  const [selectedEvent, setSelectedEvent] = useState(null);
  const fileInputRef = useRef(null);

  const isEventCompatible = (existingEvents, newEvent) => {
    return existingEvents.every(existingEvent => 
      new Date(newEvent.end).getTime() <= new Date(existingEvent.start).getTime() ||
      new Date(newEvent.start).getTime() >= new Date(existingEvent.end).getTime()
    );
  };

  const combineEventsBasedOnAvailability = (existingEvents, dummyEvents) => {
    const transformedDummyEvents = dummyEvents.map(de => ({
      title: de.name,
      start: de.date,
      end: new Date(new Date(de.date).getTime() + 2 * 60 * 60 * 1000).toISOString(), // Adding 2 hours to start time for end time
      location: de.theme, // Assuming theme can be repurposed as location
      color: 'red' // Marking compatible events with red color
    }));

    const compatibleEvents = transformedDummyEvents.filter(newEvent => 
      isEventCompatible(existingEvents, newEvent)
    );

    return [...existingEvents, ...compatibleEvents];
  };

  const generateCompatibleDummyEvents = () => {
    // Predefined list of 10 club names
    const clubNames = [
      "Astronomy Club",
      "Debate Team",
      "Coding Society",
      "Eco Warriors",
      "Chess Club",
      "Robotics Team",
      "Literature Circle",
      "Math League",
      "Science Club",
      "Art Collective"
    ];
  
    let dummyEvents = [];
    for (let i = 1; i <= 10; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i); // Each event is set on a consecutive day
      
      // Add a random hour between 8 AM and 5 PM (for example)
      const randomHour = Math.floor(Math.random() * (17 - 8 + 1) + 8);
      date.setHours(randomHour, 0, 0, 0); // Set minutes, seconds, and milliseconds to 0
  
      // Select a random club name from the list
      const randomClubNameIndex = Math.floor(Math.random() * clubNames.length);
      const clubName = clubNames[randomClubNameIndex];
      
      dummyEvents.push({
        id: i,
        name: clubName,
        date: date.toISOString(),
         // You might want to adjust or remove this, depending on your use case
      });
    }
    return dummyEvents;
  };
  
  

  const handleSubmit = () => {
    const dummyEvents = generateCompatibleDummyEvents();
    const updatedEvents = combineEventsBasedOnAvailability(events, dummyEvents);
    updateEvents(updatedEvents); // This should update the state with new events, including compatible ones marked in red
  };

  const handleFileChange = (event) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      parseIcsEvents(e.target.result);
    };
    reader.readAsText(event.target.files[0]);
  };

  const handleEventClick = (clickInfo) => {
    setSelectedEvent({
      title: clickInfo.event.title,
      start: format(new Date(clickInfo.event.startStr), "p"),
      end: format(new Date(clickInfo.event.endStr), "p"),
      location: clickInfo.event.extendedProps.location,
    });
  };

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const parseIcsEvents = (data) => {
    try {
      const jcalData = ical.parse(data);
      const comp = new ical.Component(jcalData);
      let allEvents = [];

      const generationStartDate = parseISO("2024-01-01T00:00:00Z");
      const generationEndDate = add(generationStartDate, { years: 1 });

      const vevents = comp.getAllSubcomponents("vevent");
      vevents.forEach((event) => {
        const dtstartProp = event.getFirstPropertyValue("dtstart");
        const dtendProp = event.getFirstPropertyValue("dtend");
        const eventStart = dtstartProp.toJSDate();
        const eventEnd = dtendProp.toJSDate();
        const summary = event.getFirstPropertyValue("summary");
        const location = event.getFirstPropertyValue("location");
        const rruleProp = event.getFirstPropertyValue("rrule");

        let title = summary;
        if (location) {
          title += ` (${location})`;
        }

        if (rruleProp) {
          const rruleOptions = RRule.parseString(rruleProp.toString());
          rruleOptions.dtstart = eventStart;
          const rrule = new RRule(rruleOptions);
          const dates = rrule.between(generationStartDate, generationEndDate, true);

          dates.forEach((date) => {
            const duration = eventEnd.getTime() - eventStart.getTime();
            const endDate = new Date(date.getTime() + duration);

            allEvents.push({
              title: title,
              start: date,
              end: endDate,
              location,
            });
          });
        } else {
          if (eventStart >= generationStartDate && eventEnd <= generationEndDate) {
            allEvents.push({
              title: title,
              start: eventStart,
              end: eventEnd,
              location,
            });
          }
        }
      });

      updateEvents(allEvents); // Assuming updateEvents is the method to update your event state
    } catch (error) {
      console.error("Error parsing ICS:", error);
    }
  };

  return (
    <div className="calendar-container">
      <div className="calendar-main">
        <div className="calendar-header">
          <h1>Event Calendar</h1>
          <button onClick={handleButtonClick} className="import-button">Import Your Own Calendar</button>
          <input
            type="file"
            onChange={handleFileChange}
            accept=".ics"
            ref={fileInputRef}
            style={{ display: 'none' }}
          />
        </div>
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          events={events}
          nowIndicator={true}
          slotMinTime="06:00:00"
          eventTimeFormat={{
            hour: "numeric",
            minute: "2-digit",
            meridiem: "short",
            hour12: true,
          }}
          eventClick={handleEventClick}
        />
      </div>
      <div className="event-info-container">
        <h2>Event Information</h2>
        {selectedEvent && (
          <div>
            <h3>{selectedEvent.title}</h3>
            <p>Start: {selectedEvent.start}</p>
            <p>End: {selectedEvent.end}</p>
            {selectedEvent.location && <p>Location: {selectedEvent.location}</p>}
          </div>
        )}
        <div className="compatible_classes">
          <p>Do you want to see if you have free time for any clubs available at Umass Boston? Click this button to see if you are compatible with any on-campus events.</p>
          <button onClick={handleSubmit}>Make Suggestions</button>
        </div>
      </div>
    </div>
  );
}

export default Calendar;
