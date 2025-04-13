import Button from "@/components/Button";
import { IMonitorDocument } from "@/interfaces/monitor.interface";
import React, { FC } from "react";
import { FaPause, FaPencilAlt, FaPlay, FaTrashAlt } from "react-icons/fa";

interface HomeTableBtnGroupProps {
  monitor: IMonitorDocument;
}

const HomeTableBtnGroup: FC<HomeTableBtnGroupProps> = ({ monitor }) => {
  return (
    <div className="inline-flex shadow-sm" role="group">
      <Button
        icon={monitor.active ? <FaPause /> : <FaPlay />}
        type="button"
        className="mr-1 inline-flex items-center px-4 py-2 text-sm font-bold text-[#1e8dee] rounded border border-[#1e8dee] hover:bg-[#1e8dee] hover:text-white"
      />
      <Button
        icon={<FaPencilAlt />}
        type="button"
        className="mr-1 inline-flex items-center px-4 py-2 text-sm font-bold text-[#1e8dee] rounded border border-[#1e8dee] hover:bg-[#1e8dee] hover:text-white"
      />
      <Button
        icon={<FaTrashAlt />}
        type="button"
        className="mr-1 inline-flex items-center px-4 py-2 text-sm font-bold text-white rounded bg-red-600 hover:bg-red-400 hover:text-white"
      />
    </div>
  );
};

export default HomeTableBtnGroup;
