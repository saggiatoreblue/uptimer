import React, { ReactElement, ReactNode } from "react";
import { FaAngleDoubleLeft } from "react-icons/fa";
import Sidebar from "./sidebar/Sidebar";

const LayoutBody = ({
  children,
}: Readonly<{ children: ReactNode }>): ReactElement => {
  return (
    <div className="h-screen relative">
      <div className="grid grid-cols-5">
        <div className="hidden top-0 bottom-0 h-auto p-0 text-center border-r border-[#e5f3ff] lg:flex">
          <Sidebar type="sidebar" />
        </div>
        <div className="col-span-5 lg:col-span-4">
          {/* HomeHeader */}
          {children}
        </div>
      </div>
      <div className="hidden absolute bottom-auto p-4 cursor-pointer lg:flex">
        <FaAngleDoubleLeft />
      </div>
    </div>
  );
};

export default LayoutBody;
