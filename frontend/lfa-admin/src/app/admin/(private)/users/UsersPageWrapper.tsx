"use client";

import dynamic from "next/dynamic";

const UserManagement = dynamic(() => import("./Users"), {
  ssr: false,
});

export default function UsersPageWrapper() {
  return <UserManagement />;
}
