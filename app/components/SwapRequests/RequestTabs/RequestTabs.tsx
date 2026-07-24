"use client";

import styles from "./RequestTabs.module.css";


interface RequestTabsProps {
  activeTab: "incoming" | "outgoing";

  onChange: (
    tab: "incoming" | "outgoing"
  ) => void;

  incomingCount?: number;

  outgoingCount?: number;
}


export default function RequestTabs({
  activeTab,
  onChange,
  incomingCount = 0,
  outgoingCount = 0,
}: RequestTabsProps) {

  return (
    <div className={styles.tabs}>


      <button
        className={
          activeTab === "incoming"
            ? styles.active
            : ""
        }
        onClick={() =>
          onChange("incoming")
        }
      >
        Incoming
        {incomingCount > 0 && (
          <span>
            {incomingCount}
          </span>
        )}
      </button>



      <button
        className={
          activeTab === "outgoing"
            ? styles.active
            : ""
        }
        onClick={() =>
          onChange("outgoing")
        }
      >
        Outgoing
        {outgoingCount > 0 && (
          <span>
            {outgoingCount}
          </span>
        )}
      </button>


    </div>
  );
}