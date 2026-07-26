import Image from "next/image";
import Link from "next/link";

import styles from "./ChatHeader.module.css";

interface HeaderProps {
    username: string;
    fullName: string | null;
    avatarUrl: string | null;
    listingId: string;
    listingTitle: string;
    listingImage: string | null;
    swapValue?: number;
}

export default function Header({
    username,
    fullName,
    avatarUrl,
    listingId,
    listingTitle,
    listingImage,
    swapValue,
}: HeaderProps) {

    return (
        <header className={styles.container}>

            <div className={styles.user}>

                <div className={styles.avatar}>

                    {avatarUrl ? (
                        <Image
                            src={avatarUrl}
                            alt={username}
                            fill
                        />
                    ) : (
                        <span>
                            {username.charAt(0).toUpperCase()}
                        </span>
                    )}

                </div>

                <div>
                    <h3>
                        {fullName || username}
                    </h3>

                    <p className={styles.activeStatus}>
                        <span className={styles.activeDot} />
                        Active now
                    </p>
                </div>

            </div>

            <Link href={`/Listing/${listingId}`} className={styles.listing}>

                {listingImage && (
                    <Image
                        src={listingImage}
                        alt={listingTitle}
                        width={36}
                        height={36}
                        className={styles.listingImage}
                    />
                )}

                <div className={styles.listingText}>
                    <span className={styles.listingTitle}>{listingTitle}</span>
                    {swapValue !== undefined && (
                        <span className={styles.listingValue}>
                            Swap value · {swapValue.toLocaleString()}
                        </span>
                    )}
                </div>

                <span className={styles.viewLink}>View listing</span>

            </Link>

        </header>
    );
}