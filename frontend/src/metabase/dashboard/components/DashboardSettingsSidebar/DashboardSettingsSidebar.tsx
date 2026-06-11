import { useCallback, useEffect, useMemo, useState } from "react";
import { useMount } from "react-use";
import { t } from "ttag";

import ErrorBoundary from "metabase/ErrorBoundary";
import { useUpdateDashboardMutation } from "metabase/api";
import { Sidesheet, SidesheetCard } from "metabase/common/components/Sidesheet";
import { useUniqueId } from "metabase/common/hooks/use-unique-id";
import { setDashboardAttributes } from "metabase/dashboard/actions";
import { toggleAutoApplyFilters } from "metabase/dashboard/actions/parameters";
import { useDashboardContext } from "metabase/dashboard/context";
import { dispatchDashboardStyleUpdated } from "metabase/dashboard/hooks/use-dashboard-style-revision";
import { STYLE_EDITOR_LABELS } from "metabase/dashboard/style-editor/labels.zh";
import { parseDashboardCaveatsPayload } from "metabase/dashboard/style-editor/style-config";
import type { DashboardStyleEditorConfig } from "metabase/dashboard/style-editor/types";
import { isDashboardCacheable } from "metabase/dashboard/utils";
import {
  createStyleEditorConfigOnEnable,
  getDashboardCustomCssRaw,
  getDashboardStyleEditorConfig,
  setDashboardCustomCssInCaveats,
  setDashboardStyleEditorInCaveats,
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

import { DashboardStyleEditor } from "./DashboardStyleEditor";

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

  const savedPayload = useMemo(
    () => parseDashboardCaveatsPayload(dashboard.caveats),
    [dashboard.caveats],
  );

  const [styleConfig, setStyleConfig] = useState<DashboardStyleEditorConfig>(
    () => getDashboardStyleEditorConfig(dashboard),
  );
  const [legacyCustomCss, setLegacyCustomCss] = useState(() =>
    getDashboardCustomCssRaw(dashboard),
  );

  const usesStyleEditor = Boolean(savedPayload.styleEditor);

  useEffect(() => {
    setStyleConfig(
      getDashboardStyleEditorConfig({ caveats: dashboard.caveats }),
    );
    setLegacyCustomCss(
      getDashboardCustomCssRaw({ caveats: dashboard.caveats }),
    );
  }, [dashboard.caveats, dashboard.id]);

  const handleToggleAutoApplyFilters = useCallback(
    (isAutoApplyingFilters: boolean) => {
      dispatch(toggleAutoApplyFilters(isAutoApplyingFilters));
    },
    [dispatch],
  );

  const handleStyleConfigChange = useCallback(
    (nextConfig: DashboardStyleEditorConfig) => {
      if (nextConfig.enabled && !styleConfig.enabled && !usesStyleEditor) {
        setStyleConfig({
          ...createStyleEditorConfigOnEnable(dashboard.caveats),
          enabled: true,
        });
        return;
      }

      setStyleConfig(nextConfig);
    },
    [dashboard.caveats, styleConfig.enabled, usesStyleEditor],
  );

  const handleSaveStyles = useCallback(async () => {
    const caveats =
      usesStyleEditor || styleConfig.enabled
        ? setDashboardStyleEditorInCaveats(dashboard.caveats, styleConfig)
        : setDashboardCustomCssInCaveats(dashboard.caveats, legacyCustomCss);

    dispatch(
      setDashboardAttributes({
        id: dashboard.id,
        attributes: { caveats },
        isDirty: false,
      }),
    );
    dispatchDashboardStyleUpdated(dashboard.id);

    await updateDashboard({ id: dashboard.id, caveats }).unwrap();
  }, [
    dashboard.caveats,
    dashboard.id,
    dispatch,
    legacyCustomCss,
    styleConfig,
    updateDashboard,
    usesStyleEditor,
  ]);

  const autoApplyFilterToggleId = useUniqueId();
  const canWrite = dashboard.can_write && !dashboard.archived;
  const savedStyleConfig = getDashboardStyleEditorConfig(dashboard);
  const savedLegacyCss = getDashboardCustomCssRaw(dashboard);

  const hasStyleChanges =
    usesStyleEditor || styleConfig.enabled
      ? JSON.stringify(styleConfig) !== JSON.stringify(savedStyleConfig)
      : legacyCustomCss !== savedLegacyCss;

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
      <SidesheetCard title={STYLE_EDITOR_LABELS.customStyling}>
        <DashboardStyleEditor
          config={styleConfig}
          disabled={!canWrite}
          onChange={handleStyleConfigChange}
        />
        {!usesStyleEditor && !styleConfig.enabled && legacyCustomCss.trim() ? (
          <Textarea
            autosize
            data-testid="dashboard-custom-css-editor"
            disabled={!canWrite}
            label={STYLE_EDITOR_LABELS.legacyCss}
            description={STYLE_EDITOR_LABELS.legacyCssDescription}
            minRows={6}
            maxRows={12}
            mt="md"
            value={legacyCustomCss}
            onChange={(event) => setLegacyCustomCss(event.currentTarget.value)}
            styles={{
              input: {
                fontFamily: "monospace",
              },
            }}
          />
        ) : null}
        {error ? (
          <Text c="error" size="sm">
            {STYLE_EDITOR_LABELS.saveError}
          </Text>
        ) : null}
        <Group justify="flex-end" mt="md">
          <Button
            disabled={!canWrite || !hasStyleChanges}
            loading={isLoading}
            data-testid="dashboard-style-save-button"
            onClick={handleSaveStyles}
          >
            {STYLE_EDITOR_LABELS.saveStyles}
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
