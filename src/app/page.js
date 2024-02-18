
import Image from "next/image";
import styles from "./page.css";
import Calendar from "./Calendar";
import EventFinder from "./api-requests";
// Fetch events from the UMBInvolved API
// Get the queries




export default function Home() {


    return (
        <main className="main">
    
            <Calendar />
    </main>
  );
}
