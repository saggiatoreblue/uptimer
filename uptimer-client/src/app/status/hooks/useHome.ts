import { MonitorContext } from '@/context/MonitorContext';
import {
  IMonitorDocument,
  IMonitorState,
  IPagination,
  IUseHome,
} from '@/interfaces/monitor.interface';
import {
  ENABLE_AUTO_REFRESH,
  GET_USER_MONITORS,
  MONITORS_UPDATED,
} from '@/queries/status';
import {
  getLocalStorageItem,
  setLocalStorageItem,
  showErrorToast,
} from '@/utils/utils';
import { useLazyQuery, useQuery, useSubscription } from '@apollo/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useContext, useEffect, useRef, useState } from 'react';

export const useHome = (): IUseHome => {
  const {
    state: { user },
  } = useContext(MonitorContext);

  const [monitors, setMonitors] = useState<IMonitorDocument[]>([]);

  const [monitorState, setMonitorState] = useState<IMonitorState>({
    showModal: false,
    enableRefresh: false,
    autoRefreshLoading: false,
  });

  const searchParams = useSearchParams();
  const router = useRouter();
  const params = new URLSearchParams(searchParams.toString());

  const [view, setView] = useState<string>('');

  const monitorsRef = useRef<IMonitorDocument[]>([]);
  const autoMonitorsRef = useRef<IMonitorDocument[]>([]);

  const { data, loading } = useQuery(GET_USER_MONITORS, {
    fetchPolicy: 'network-only',
    variables: {
      userId: `${user?.id}`,
    },
  });

  const [getUserMonitors] = useLazyQuery(GET_USER_MONITORS, {
    fetchPolicy: 'network-only',
    variables: {
      userId: `${user?.id}`,
    },
  });

  const [autoRefresh, { data: refreshData }] = useLazyQuery(
    ENABLE_AUTO_REFRESH,
    {
      fetchPolicy: 'network-only',
    }
  );

  useSubscription(MONITORS_UPDATED, {
    onData: ({ client, data }) => {
      const { userId, monitors } = data.data.monitorsUpdated;
      if (userId === user?.id) {
        setMonitorState((prevState: IMonitorState) => ({
          ...prevState,
          autoRefreshLoading: true,
        }));
        autoMonitorsRef.current = monitors;
        client.cache.updateQuery({ query: GET_USER_MONITORS }, () => {
          return {
            getUserMonitors: {
              __typename: 'MonitorResponse',
              monitors,
            },
          };
        });
      } else {
        setMonitorState((prevState: IMonitorState) => ({
          ...prevState,
          autoRefreshLoading: false,
        }));
      }
    },
  });

  const storageViewItem = getLocalStorageItem('view');
  const isRefreshed = JSON.parse(getLocalStorageItem('refresh'));
  const openModal = JSON.parse(`${params.get('open')}`);
  const hasActiveMonitors = monitors.some(
    (monitor: IMonitorDocument) => monitor.active
  );

  const refreshMonitors = async (): Promise<void> => {
    try {
      if (hasActiveMonitors) {
        setMonitorState((prevState: IMonitorState) => ({
          ...prevState,
          autoRefreshLoading: true,
        }));
        const result = await getUserMonitors();
        if (result) {
          monitorsRef.current = result.data.getUserMonitors.monitors;
          setMonitors(result.data.getUserMonitors.monitors);
          setMonitorState((prevState: IMonitorState) => ({
            ...prevState,
            autoRefreshLoading: false,
          }));
        }
      } else {
        showErrorToast('There are no active monitors o refresh');
      }
    } catch (error) {
      console.error(error);
      showErrorToast('Error enabling autorefresh');
    }
  };

  const enableAutoRefresh = async (): Promise<void> => {
    if (hasActiveMonitors) {
      await autoRefresh({
        variables: {
          userId: `${user?.id}`,
          refresh: !isRefreshed,
        },
      });
      setMonitorState((prevState: IMonitorState) => ({
        ...prevState,
        enableRefresh: !isRefreshed,
      }));
      setLocalStorageItem('refresh', JSON.stringify(!isRefreshed));
    } else {
      showErrorToast('There are no active monitors to refresh');
    }
  };

  const closeUptimeModal = (): void => {
    params.delete('open');
    router.push(`/status?${params}`);
  };

  useEffect(() => {
    if (!storageViewItem) {
      setLocalStorageItem('view', JSON.stringify('box'));
    }
    if (isRefreshed === null) {
      setLocalStorageItem('refresh', JSON.stringify(false));
      setMonitorState((prevState: IMonitorState) => ({
        ...prevState,
        enableRefresh: false,
      }));
    } else {
      setMonitorState((prevState: IMonitorState) => ({
        ...prevState,
        enableRefresh: isRefreshed,
      }));
    }
    setView(storageViewItem || 'box');
  }, [isRefreshed, storageViewItem]);

  useEffect(() => {
    if (data && data.getUserMonitors) {
      monitorsRef.current = data.getUserMonitors.monitors;
      setMonitors(data.getUserMonitors.monitors);
    }
    if (refreshData && refreshData.autoRefresh) {
      setLocalStorageItem(
        'refresh',
        JSON.stringify(refreshData.autoRefresh.refresh)
      );
      setMonitorState((prevState: IMonitorState) => ({
        ...prevState,
        enableRefresh: refreshData.autoRefresh.refresh,
      }));
    }

    if (autoMonitorsRef.current.length) {
      autoMonitorsRef.current = [];
      setMonitorState((prevState: IMonitorState) => ({
        ...prevState,
        autoRefreshLoading: true,
      }));
    } else {
      setTimeout(() => {
        setMonitorState((prevState: IMonitorState) => ({
          ...prevState,
          autoRefreshLoading: false,
        }));
      }, 1000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, refreshData, autoMonitorsRef.current]);

  return {
    monitorState,
    monitors,
    limit: { start: 0, end: 10 },
    isRefreshed,
    autoMonitorsRef: autoMonitorsRef,
    monitorsRef: monitorsRef,
    openModal,
    view,
    loading,
    setView,
    setMonitors,
    updateLimit: (newLimit: IPagination) => {
      console.log(newLimit);
    },
    setMonitorState,
    refreshMonitors,
    enableAutoRefresh,
    closeUptimeModal,
  };
};
