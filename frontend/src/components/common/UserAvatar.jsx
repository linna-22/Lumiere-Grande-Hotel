import { useState } from "react";

function initials(name) {
  return (name || "?")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function UserAvatar({
  user,
  size = "w-9 h-9",
}) {
  const [imageError, setImageError] = useState(false);

  const avatarUrl = user?.avatar;

  // Show image if avatar exists and has not failed
  if (avatarUrl && !imageError) {
    return (
      <img
        src={avatarUrl}
        alt={user?.name || "User"}
        onError={() => setImageError(true)}
        className={`${size} rounded-full object-cover border border-base-border`}
      />
    );
  }

  // Show initials if there is no avatar
  // OR if the avatar image failed to load
  return (
    <div
      className={`
        ${size}
        rounded-full
        bg-amber-400/20
        text-amber-400
        flex
        items-center
        justify-center
        text-xs
        font-bold
        border
        border-base-border
        shrink-0
      `}
    >
      {initials(user?.name)}
    </div>
  );
}