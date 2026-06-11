import { lazy } from "react";

const DirMenuMain = lazy(
  () => import("@/pages/main-menu/directory-menu-management/component"),
);

const MainMt = () => {
  return (
    <main className="grow bg-gray-100" role="content">
      <DirMenuMain />
    </main>
  );
};

export { MainMt };
