import Image from "next/image";

import styles from "./ChatHeader.module.css";

interface HeaderProps {
    username: string;
    fullName: string | null;
    avatarUrl: string | null;
    listingTitle: string;
    listingImage: string | null;
}

export default function Header({
    username,
    fullName,
    avatarUrl,
    listingTitle,
    listingImage,
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

                    <p>
                        @{username}
                    </p>
                </div>

            </div>


            <div className={styles.listing}>

                {listingImage && (
                    <Image
                        src={listingImage}
                        alt={listingTitle}
                        width={50}
                        height={50}
                    />
                )}

                <span>
                    {listingTitle}
                </span>

            </div>

        </header>
    );
}