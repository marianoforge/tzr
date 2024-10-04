import Image from "next/image";

export const UserAvatar = () => (
  <div className="w-20 h-20 bg-white rounded-full overflow-hidden flex items-center justify-end">
    <Image
      src="/avatar.jpg"
      alt="User Avatar"
      width={50}
      height={50}
      className="object-cover"
    />
  </div>
);
