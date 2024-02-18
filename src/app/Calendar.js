'use client'
import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import * as ical from "ical.js";
import { parseISO, add, format } from "date-fns";
import { RRule } from "rrule";
import './Calendar.css'; // Make sure to have Calendar.css in the same directory

function Calendar() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const parseIcsEvents = (data) => {
    try {
      const jcalData = ical.parse(data);
      const comp = new ical.Component(jcalData);
      let allEvents = [];

      const generationStartDate = parseISO("2024-01-01T00:00:00Z");
      const generationEndDate = add(generationStartDate, { years: 1 });

      const vevents = comp.getAllSubcomponents("vevent");
      if (!vevents || !vevents.length) {
        console.error("No VEVENT found in the ICS data.");
        return;
      }

      vevents.forEach((event) => {
        const dtstartProp = event.getFirstPropertyValue("dtstart");
        const dtendProp = event.getFirstPropertyValue("dtend");
        if (!dtstartProp || !dtendProp) {
          console.error("Event start or end date is missing.");
          return;
        }
        const eventStart = dtstartProp.toJSDate();
        const eventEnd = dtendProp.toJSDate();
        const summary = event.getFirstPropertyValue("summary");
        const location = event.getFirstPropertyValue("location");
        const rruleProp = event.getFirstPropertyValue("rrule");

        let title = summary;
        if (location) {
          title += ` (${location})`; // Include location in the title if available
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

      allEvents.sort((a, b) => a.start - b.start);
      setEvents(allEvents.map((event) => ({
        ...event,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
      })));
    } catch (error) {
      console.error("Error parsing ICS file:", error);
    }
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
      start: format(new Date(clickInfo.event.startStr), "p"), // Format time
      end: format(new Date(clickInfo.event.endStr), "p"), // Format time
      location: clickInfo.event.extendedProps.location,
    });
  };

  const fileInputRef = React.createRef(); // Create a ref for the file input

  const handleButtonClick = () => {
    fileInputRef.current.click(); // Trigger file input click on button click
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
            style={{ display: 'none' }} // Hide the actual file input
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
        {selectedEvent ? (
          <div>
            <h3>{selectedEvent.title}</h3>
            <p>Start: {selectedEvent.start}</p>
            <p>End: {selectedEvent.end}</p>
            {selectedEvent.location && <p>Location: {selectedEvent.location}</p>}
          </div>
        ) : (
          <p>Select an event to see more information.</p>
        )}
      </div>
    </div>
  );
}

export default Calendar;
