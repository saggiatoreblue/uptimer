import {
  IMonitorDocument,
  IMonitorState,
  IPagination,
} from "@/interfaces/monitor.interface";
import { Dispatch, FormEvent, JSX, SetStateAction } from "react";
import HomeButtonGroup from "./HomeButtonGroup";
import Button from "@/components/Button";
import TextInput from "@/components/TextInput";
import { FaBorderAll, FaCheckCircle, FaPause, FaPlay } from "react-icons/fa";
import clsx from "clsx";
import HomeTable from "./HomeTable";
import HomeGrid from "./HomeGrid";
import { setLocalStorageItem } from "@/utils/utils";
import { filter, toLower } from "lodash";

export const renderCreateButton = (
  monitorState: IMonitorState,
  setMonitorState: Dispatch<SetStateAction<IMonitorState>>
): JSX.Element => {
  return (
    <div className="h-[50%] flex flex-col items-center justify-center">
      <FaCheckCircle className="text-[60px] text-green-400" />
      <p className="text-base lg:text-lg py-2">You have no uptime tests.</p>
      <Button
        onClick={() => setMonitorState({ ...monitorState, showModal: true })}
        className="inline-flex items-center px-4 py-2 text-base font-medium text-white rounded bg-green-400 cursor-pointer"
        label="New Uptime Test"
      />
    </div>
  );
};
export const renderButtons = (
  monitors: IMonitorDocument[],
  monitorState: IMonitorState,
  setMonitorState: Dispatch<SetStateAction<IMonitorState>>
): JSX.Element => {
  return (
    <div className="h-20 flex flex-col gap-y-3 mb-4 mt-2 md:items-center md:justify-between md:flex-row md:mb-0 md:mt-0">
      <HomeButtonGroup monitors={monitors} />
      <Button
        label="New Uptime Test"
        type="button"
        onClick={() => {
          setMonitorState({
            ...monitorState,
            showModal: true,
          });
        }}
        className="inline-flex px-4 py-2 text-base font-medium text-white rounded bg-green-400 md:items-center"
      />
    </div>
  );
};

export const renderRefreshButtons = (
  view: string,
  isRefreshed: boolean,
  monitorsRef: IMonitorDocument[],
  monitors: IMonitorDocument[],
  setView: Dispatch<SetStateAction<string>>,
  setMonitors: Dispatch<SetStateAction<IMonitorDocument[]>>,
  refreshMonitors: () => void,
  enableAutoRefresh: () => void
): JSX.Element => {
  return (
    <div className="h-44 flex flex-col items-start justify-start lg:flex-row lg:items-center lg:justify-between lg:h-20">
      <Button
        onClick={refreshMonitors}
        label="Refresh"
        className={clsx(
          "inline-flex items-center px-4 py-2 cursor-pointer text-base font-medium text-white rounded mb-3 lg:mb-0",
          {
            "cursor-none pointer-events-none bg-green-200": isRefreshed,
            "bg-green-400": !isRefreshed,
          }
        )}
      />
      <div className="flex flex-col justify-start gap-3 lg:flex-row lg:justify-end lg:w-full ">
        <div
          onClick={() => {
            const item = view === "box" ? "list" : "box";
            setLocalStorageItem("view", JSON.stringify(item));
            setView(item);
          }}
          className="flex items-center gap-2 px-2 min-w-52 cursor-pointer rounded bg-[#9DFFE4]"
        >
          <FaBorderAll />
          <Button
            label={view === "box" ? "List View" : "Box View"}
            className="text-base font-bold px-4 py-2 lg:p-0"
          />
        </div>
        <div
          onClick={enableAutoRefresh}
          className="flex items-center gap-2 px-2 min-w-52 cursor-pointer rounded bg-[#9DFFE4]"
        >
          {!isRefreshed ? <FaPlay /> : <FaPause />}
          <Button
            label={
              !isRefreshed ? "Enable Auto Refresh" : "Disable Auto Refresh"
            }
            className="text-base font-bold px-4 py-2 lg:p-0"
          />
        </div>
        <div
          onChange={(event: FormEvent) => {
            const value: string = (event.target as HTMLInputElement).value;
            const results: IMonitorDocument[] = filter(
              monitors,
              (monitor: IMonitorDocument) => {
                return (
                  toLower(monitor.name).includes(toLower(value)) ||
                  toLower(monitor.type).includes(toLower(value))
                );
              }
            );
            setMonitors(!value || !results.length ? monitorsRef : results);
          }}
          className="w-full lg:w-[30%]"
        >
          <TextInput
            type="text"
            name="search"
            className="border border-black text-gray-900 text-sm rounded-lg focus:ring-[#1e8dee] focus:border-[#1e8dee] block w-full p-2.5"
            placeholder="Search by name"
          />
        </div>
      </div>
    </div>
  );
};

export const renderTableAndPagination = (
  view: string,
  limit: IPagination,
  autoRefreshLoading: boolean,
  monitors: IMonitorDocument[],
  updateLimit: (newLimit: IPagination) => void
): JSX.Element => {
  return (
    <div className="my-4">
      {view === "box" ? (
        <HomeTable
          limit={limit}
          monitors={monitors}
          autoRefreshLoading={autoRefreshLoading}
        />
      ) : (
        <HomeGrid
          limit={limit}
          monitors={monitors}
          autoRefreshLoading={autoRefreshLoading}
        />
      )}
    </div>
  );
};
