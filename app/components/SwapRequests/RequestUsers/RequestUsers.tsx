import Image from "next/image";

import { ListingOwner } from "@/lib/types/Listing";

import styles from "./RequestUsers.module.css";

import {
  ArrowLeftRight,
} from "lucide-react";

interface RequestUsersProps {
  sender: ListingOwner;
  receiver: ListingOwner;
}

export default function RequestUsers({
  sender,
  receiver,
}: RequestUsersProps) {
  return (
    <section className={styles.container}>

      <div className={styles.userCard}>
        <div className={styles.avatar}>
          {sender.avatarUrl ? (
            <Image
              src={sender.avatarUrl}
              alt={sender.fullName}
              fill
            />
          ) : (
            <span>
              {sender.fullName.charAt(0)}
            </span>
          )}
        </div>

        <h3>{sender.fullName}</h3>

        <p>@{sender.username}</p>
      </div>

      <div className={styles.swapArrow}>
        <ArrowLeftRight/>
      </div>

      <div className={styles.userCard}>
        <div className={styles.avatar}>
          {receiver.avatarUrl ? (
            <Image
              src={receiver.avatarUrl}
              alt={receiver.fullName}
              fill
            />
          ) : (
            <span>
              {receiver.fullName.charAt(0)}
            </span>
          )}
        </div>

        <h3>{receiver.fullName}</h3>

        <p>@{receiver.username}</p>
      </div>

    </section>
  );
}