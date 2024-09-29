import Image from "next/image";

export const UserAvatar = () => (
  <div className="w-10 h-10 bg-white rounded-full overflow-hidden">
    <Image
      src="/avatar.jpg"
      alt="User Avatar"
      width={40}
      height={40}
      className="object-cover"
    />
  </div>
);
