import { useCallback, useEffect, useState } from "react";
import { useMount } from "react-use";
import { t } from "ttag";

import ErrorBoundary from "metabase/ErrorBoundary";
import { useUpdateDashboardMutation } from "metabase/api";
import { Sidesheet, SidesheetCard } from "metabase/common/components/Sidesheet";
import { useUniqueId } from "metabase/common/hooks/use-unique-id";
import { setDashboardAttributes } from "metabase/dashboard/actions";
import { toggleAutoApplyFilters } from "metabase/dashboard/actions/parameters";
import { useDashboardContext } from "metabase/dashboard/context";
import { isDashboardCacheable } from "metabase/dashboard/utils";
import {
  getDashboardCustomCss,
  setDashboardCustomCssInCaveats,
} from "metabase/dashboard/utils/custom-css";
import { useDispatch } from "metabase/lib/redux";
import { PLUGIN_CACHING } from "metabase/plugins";
import {
  Button,
  Group,
  Switch,
  Text,
  Textarea,
  useModalsStack,
} from "metabase/ui";
import type { CacheableDashboard, Dashboard } from "metabase-types/api";

export function DashboardSettingsSidebar() {
  const { dashboard, closeSidebar } = useDashboardContext();
  const { open, state, close } = useModalsStack(["default", "caching"]);

  const currentModal: keyof typeof state = state.caching
    ? "caching"
    : "default";

  useMount(() => {
    // the modal is not rendered until it is "open"
    // but we want to set it open after it mounts to get
    // pretty animations
    open("default");
  });

  if (!dashboard) {
    return null;
  }

  if (currentModal === "caching") {
    return (
      <PLUGIN_CACHING.SidebarCacheForm
        item={dashboard as CacheableDashboard}
        model="dashboard"
        isOpen={state.caching}
        onClose={closeSidebar}
        onBack={() => close("caching")}
        pt="md"
      />
    );
  }

  return (
    <ErrorBoundary>
      <Sidesheet
        isOpen={state.default}
        onClose={closeSidebar}
        closeOnEscape={currentModal === "default"}
        title={t`Dashboard settings`}
        data-testid="dashboard-settings-sidebar"
      >
        <DashboardSidesheetBody dashboard={dashboard} openSidesheet={open} />
      </Sidesheet>
    </ErrorBoundary>
  );
}

export type DashboardSidebarPageProps = {
  dashboard: Dashboard;
  openSidesheet: (sidesheetKey: "caching") => void;
};

const DashboardSidesheetBody = ({
  dashboard,
  openSidesheet,
}: DashboardSidebarPageProps) => {
  const dispatch = useDispatch();
  const [updateDashboard, { error, isLoading }] = useUpdateDashboardMutation();
  const [customCss, setCustomCss] = useState(() =>
    getDashboardCustomCss(dashboard),
  );

  useEffect(() => {
    setCustomCss(getDashboardCustomCss({ caveats: dashboard.caveats }));
  }, [dashboard.caveats, dashboard.id]);

  const handleToggleAutoApplyFilters = useCallback(
    (isAutoApplyingFilters: boolean) => {
      dispatch(toggleAutoApplyFilters(isAutoApplyingFilters));
    },
    [dispatch],
  );

  const handleSaveCustomCss = useCallback(async () => {
    const caveats = setDashboardCustomCssInCaveats(
      dashboard.caveats,
      customCss,
    );

    await updateDashboard({ id: dashboard.id, caveats }).unwrap();
    dispatch(
      setDashboardAttributes({
        id: dashboard.id,
        attributes: { caveats },
        isDirty: false,
      }),
    );
  }, [customCss, dashboard.caveats, dashboard.id, dispatch, updateDashboard]);

  const autoApplyFilterToggleId = useUniqueId();
  const canWrite = dashboard.can_write && !dashboard.archived;
  const savedCustomCss = getDashboardCustomCss(dashboard);
  const hasCustomCssChanged = customCss !== savedCustomCss;

  const isCacheable = isDashboardCacheable(dashboard);
  const showCaching =
    (dashboard.can_set_cache_policy ?? canWrite) &&
    PLUGIN_CACHING.isGranularCachingEnabled();

  if (dashboard.archived) {
    return null;
  }

  return (
    <>
      <SidesheetCard title={t`General`}>
        <Switch
          disabled={!canWrite}
          label={t`Auto-apply filters`}
          labelPosition="left"
          variant="stretch"
          size="sm"
          id={autoApplyFilterToggleId}
          checked={dashboard.auto_apply_filters}
          onChange={(e) => handleToggleAutoApplyFilters(e.target.checked)}
        />
      </SidesheetCard>
      <SidesheetCard title={t`Theme & CSS`}>
        <Textarea
          autosize
          data-testid="dashboard-custom-css-editor"
          disabled={!canWrite}
          label={t`CSS editor`}
          minRows={10}
          maxRows={18}
          value={customCss}
          onChange={(event) => setCustomCss(event.currentTarget.value)}
          styles={{
            input: {
              fontFamily: "monospace",
            },
          }}
        />
        {error ? (
          <Text c="error" size="sm">{t`Couldn't save dashboard CSS.`}</Text>
        ) : null}
        <Group justify="flex-end">
          <Button
            disabled={!canWrite || !hasCustomCssChanged}
            loading={isLoading}
            onClick={handleSaveCustomCss}
          >
            {t`Save CSS`}
          </Button>
        </Group>
      </SidesheetCard>
      {showCaching && isCacheable && (
        <SidesheetCard title={t`Caching`}>
          <PLUGIN_CACHING.SidebarCacheSection
            model="dashboard"
            item={dashboard}
            setPage={() => openSidesheet("caching")}
          />
        </SidesheetCard>
      )}
    </>
  );
};
