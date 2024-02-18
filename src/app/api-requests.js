"use client"
import styles from "./page.module.css";
import React, { useState, useEffect } from "react"; // Import useState and useEffect


async function fetchEvents(query) {
    const data = {
      query: query
    };
    
    // This is to put as a query string
    const searchParams = new URLSearchParams(data);
    
    // searchParams.toString() === 'var1=value1&var2=value2'
    const url = `https://corsproxy.io/?https://umb.campuslabs.com/engage/api/discovery/event/search?${searchParams.toString()}`;
    
    const response = await fetch(
      url,
      {
        mode: 'cors',
        
      }
    )
  
    const responseData = await response.json();
    console.log(responseData);
    return responseData;


    // const eventsDetails = jsonData.value.map(event => ({
    //   startsOn: event.startsOn,
    //   endsOn: event.endsOn,
    //   theme: event.theme,
    //   OrganizationName: event.OrganizationName,
    //   location: event.location
    // }));
      
      
    //   const event = eventsDetails[0];
    //   console.log(`Event ID: ${event.id}, Starts On: ${event.startsOn}, Ends On: ${event.endsOn}, Theme: ${event.theme}, Organization: ${event.OrganizationName}, Location: ${event.location}`);
      
    // return eventsDetails;
}

export default function EventFinder() {
 // Step 1: Create a state variable to store event data
 const [events, setEvents] = useState([]);

 // Step 2: Fetch event data when the component mounts
 useEffect(() => {
   // Define your search criteria or leave it as an empty string if not needed
   const query = "test"; 
   fetchEvents(query).then(data => {
     setEvents(data); // Update state with fetched data
   }).catch(error => {
     console.error("Failed to fetch events:", error);
   });
 }, []); // Empty dependency array means this runs once on mount

 // Step 3: Display the data
 return (
   <div className={styles.eventFinder}>
     <h2>Events</h2>
     <ul>
       {events.map((event, index) => (
         <li key={index}> {/* It's better to use a unique id if available */}
           <strong>Organization:</strong> {event.OrganizationName}<br />
           <strong>Starts On:</strong> {new Date(event.startsOn).toLocaleString()}<br />
           <strong>Ends On:</strong> {new Date(event.endsOn).toLocaleString()}<br />
           <strong>Theme:</strong> {event.theme}<br />
           <strong>Location:</strong> {event.location}
         </li>
       ))}
     </ul>
   </div>
 );
}