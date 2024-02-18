import Image from "next/image";
import styles from "./page.module.css";
import Calendar from "./Calendar";
import EventFinder from "./api-requests";
// Fetch events from the UMBInvolved API
// Get the queries



export default function Home() {
  return (
    <main className={styles.main}>
      <Calendar />
    </main>
  );
}
