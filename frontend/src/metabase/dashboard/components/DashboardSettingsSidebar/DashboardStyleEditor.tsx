import { useEffect, useState } from "react";

import { ColorPicker } from "metabase/common/components/ColorPicker";
import { ChartColorsListField } from "metabase/dashboard/components/DashboardSettingsSidebar/ChartColorsListField";
import {
  DEFAULT_DARK_STYLE_TOKENS,
  DEFAULT_LIGHT_STYLE_TOKENS,
  applyDefaultTemplateConfig,
} from "metabase/dashboard/style-editor/defaults";
import {
  STYLE_EDITOR_LABELS,
  STYLE_TOKEN_DESCRIPTIONS,
} from "metabase/dashboard/style-editor/labels.zh";
import {
  CUSTOM_PRESET_VALUE,
  FONT_FAMILY_PRESETS,
  KPI_FONT_SIZE_PRESETS,
  type StylePresetOption,
  findMatchingPreset,
} from "metabase/dashboard/style-editor/presets";
import {
  STYLE_TOKEN_CATEGORIES,
  getTokensForThemeAndCategory,
} from "metabase/dashboard/style-editor/tokens";
import type {
  DashboardStyleEditorConfig,
  StyleTokenDefinition,
  StyleTokenTheme,
} from "metabase/dashboard/style-editor/types";
import {
  Accordion,
  Box,
  Button,
  Group,
  NumberInput,
  Radio,
  SegmentedControl,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  Textarea,
} from "metabase/ui";

type Props = {
  config: DashboardStyleEditorConfig;
  disabled?: boolean;
  onChange: (config: DashboardStyleEditorConfig) => void;
};

export function DashboardStyleEditor({ config, disabled, onChange }: Props) {
  const [previewTheme, setPreviewTheme] = useState<StyleTokenTheme>("light");
  const [showAdvanced, setShowAdvanced] = useState(
    Boolean(config.advancedCss?.trim()),
  );

  const handleToggleEnabled = (enabled: boolean) => {
    onChange({ ...config, enabled });
  };

  const handleTokenChange = (
    theme: StyleTokenTheme,
    name: string,
    value: string,
  ) => {
    onChange({
      ...config,
      tokens: {
        ...config.tokens,
        [theme]: {
          ...config.tokens[theme],
          [name]: value,
        },
      },
    });
  };

  const handleResetTheme = (theme: StyleTokenTheme) => {
    onChange({
      ...config,
      tokens: {
        ...config.tokens,
        [theme]:
          theme === "light"
            ? { ...DEFAULT_LIGHT_STYLE_TOKENS }
            : { ...DEFAULT_DARK_STYLE_TOKENS },
      },
    });
  };

  const handleApplyDefaultTemplate = () => {
    onChange(applyDefaultTemplateConfig(config));
    setShowAdvanced(false);
  };

  return (
    <Stack gap="md" data-testid="dashboard-style-editor">
      <Switch
        disabled={disabled}
        label={STYLE_EDITOR_LABELS.enable}
        description={STYLE_EDITOR_LABELS.enableDescription}
        labelPosition="left"
        variant="stretch"
        size="sm"
        checked={config.enabled}
        onChange={(event) => handleToggleEnabled(event.target.checked)}
      />

      {config.enabled ? (
        <>
          <Box
            data-mantine-color-scheme={
              previewTheme === "dark" ? "dark" : "light"
            }
            p="sm"
            style={{
              borderRadius: 8,
              border: "1px solid var(--mbdb-border, var(--mb-color-border))",
              background:
                "var(--dashboard-page-bg, var(--mb-color-bg-dashboard))",
            }}
          >
            <Group justify="space-between" mb="sm">
              <Text fw={600} size="sm">
                {STYLE_EDITOR_LABELS.editTheme}
              </Text>
              <SegmentedControl
                data-testid="dashboard-style-theme-toggle"
                disabled={disabled}
                size="xs"
                value={previewTheme}
                onChange={(value) => setPreviewTheme(value as StyleTokenTheme)}
                data={[
                  { label: STYLE_EDITOR_LABELS.light, value: "light" },
                  { label: STYLE_EDITOR_LABELS.dark, value: "dark" },
                ]}
              />
            </Group>

            <Group justify="flex-end" mb="xs" gap="xs">
              <Button
                disabled={disabled}
                size="xs"
                variant="subtle"
                onClick={handleApplyDefaultTemplate}
              >
                {STYLE_EDITOR_LABELS.useDefaultTemplate}
              </Button>
              <Button
                disabled={disabled}
                size="xs"
                variant="subtle"
                onClick={() => handleResetTheme(previewTheme)}
              >
                {previewTheme === "light"
                  ? STYLE_EDITOR_LABELS.resetLight
                  : STYLE_EDITOR_LABELS.resetDark}
              </Button>
            </Group>
            <Text size="xs" c="text-secondary" mb="xs">
              {STYLE_EDITOR_LABELS.useDefaultTemplateDescription}
            </Text>

            <Accordion variant="separated" defaultValue={null}>
              {STYLE_TOKEN_CATEGORIES.map((category) => {
                const tokens = getTokensForThemeAndCategory(
                  previewTheme,
                  category.id,
                );

                if (tokens.length === 0) {
                  return null;
                }

                return (
                  <Accordion.Item key={category.id} value={category.id}>
                    <Accordion.Control>{category.label}</Accordion.Control>
                    <Accordion.Panel>
                      <Stack gap="sm">
                        {tokens.map((token) => (
                          <StyleTokenField
                            key={`${previewTheme}-${token.name}`}
                            token={token}
                            theme={previewTheme}
                            value={
                              config.tokens[previewTheme][token.name] ?? ""
                            }
                            disabled={disabled || !config.enabled}
                            onChange={(value) =>
                              handleTokenChange(previewTheme, token.name, value)
                            }
                          />
                        ))}
                      </Stack>
                    </Accordion.Panel>
                  </Accordion.Item>
                );
              })}
            </Accordion>
          </Box>

          <Switch
            disabled={disabled}
            label={STYLE_EDITOR_LABELS.showAdvancedCss}
            labelPosition="left"
            variant="stretch"
            size="sm"
            checked={showAdvanced}
            onChange={(event) => setShowAdvanced(event.target.checked)}
          />

          {showAdvanced ? (
            <Textarea
              autosize
              disabled={disabled}
              data-testid="dashboard-style-advanced-css"
              label={STYLE_EDITOR_LABELS.additionalCss}
              description={STYLE_EDITOR_LABELS.additionalCssDescription}
              minRows={4}
              maxRows={10}
              value={config.advancedCss ?? ""}
              onChange={(event) =>
                onChange({
                  ...config,
                  advancedCss: event.currentTarget.value,
                })
              }
              styles={{
                input: {
                  fontFamily: "monospace",
                },
              }}
            />
          ) : null}
        </>
      ) : null}
    </Stack>
  );
}

function StyleTokenField({
  token,
  theme: _theme,
  value,
  disabled,
  onChange,
}: {
  token: StyleTokenDefinition;
  theme: StyleTokenTheme;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const label = token.label;

  if (token.type === "chartColors") {
    return (
      <ChartColorsListField
        disabled={disabled}
        label={label}
        value={value}
        onChange={onChange}
      />
    );
  }

  if (token.type === "color") {
    return (
      <Group justify="space-between" wrap="nowrap" gap="sm">
        <Text size="sm" style={{ flex: 1 }}>
          {label}
        </Text>
        <Box
          style={{
            opacity: disabled ? 0.5 : 1,
            pointerEvents: disabled ? "none" : "auto",
          }}
        >
          <ColorPicker
            value={value}
            onChange={(color) => onChange(color ?? value)}
          />
        </Box>
      </Group>
    );
  }

  if (token.type === "number") {
    return (
      <NumberInput
        disabled={disabled}
        label={label}
        value={Number(value) || 0}
        min={token.min}
        max={token.max}
        step={token.step ?? 1}
        onChange={(nextValue) => onChange(String(nextValue ?? value))}
      />
    );
  }

  if (token.type === "fontFamily") {
    return (
      <FontFamilyPresetField
        disabled={disabled}
        label={label}
        description={
          STYLE_TOKEN_DESCRIPTIONS[
            token.name as keyof typeof STYLE_TOKEN_DESCRIPTIONS
          ]
        }
        value={value}
        onChange={onChange}
      />
    );
  }

  if (token.type === "kpiFontSize") {
    return (
      <PresetSelectField
        disabled={disabled}
        label={label}
        description={
          STYLE_TOKEN_DESCRIPTIONS[
            token.name as keyof typeof STYLE_TOKEN_DESCRIPTIONS
          ]
        }
        value={value}
        presets={KPI_FONT_SIZE_PRESETS}
        onChange={onChange}
      />
    );
  }

  return (
    <TextInput
      disabled={disabled}
      label={label}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  );
}

function FontFamilyPresetField({
  label,
  description,
  value,
  disabled,
  onChange,
}: {
  label: string;
  description?: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const matchedPreset = findMatchingPreset(value, FONT_FAMILY_PRESETS);
  const [useCustom, setUseCustom] = useState(!matchedPreset);
  const radioValue = useCustom
    ? CUSTOM_PRESET_VALUE
    : (matchedPreset?.id ?? CUSTOM_PRESET_VALUE);

  useEffect(() => {
    if (findMatchingPreset(value, FONT_FAMILY_PRESETS)) {
      setUseCustom(false);
    }
  }, [value]);

  return (
    <Stack gap="xs" data-testid="font-family-preset-field">
      <Text size="sm" fw={500}>
        {label}
      </Text>
      {description ? (
        <Text size="xs" c="text-secondary">
          {description}
        </Text>
      ) : null}
      <Radio.Group
        value={radioValue}
        onChange={(nextId) => {
          if (nextId === CUSTOM_PRESET_VALUE) {
            setUseCustom(true);
            return;
          }

          const preset = FONT_FAMILY_PRESETS.find(
            (option) => option.id === nextId,
          );

          setUseCustom(false);

          if (preset) {
            onChange(preset.value);
          }
        }}
      >
        <Stack gap="xs">
          {FONT_FAMILY_PRESETS.map((preset) => (
            <Radio
              key={preset.id}
              disabled={disabled}
              label={preset.label}
              value={preset.id}
            />
          ))}
          <Radio
            disabled={disabled}
            label={STYLE_EDITOR_LABELS.customPreset}
            value={CUSTOM_PRESET_VALUE}
          />
        </Stack>
      </Radio.Group>

      {useCustom ? (
        <TextInput
          disabled={disabled}
          label={STYLE_EDITOR_LABELS.customValue}
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          styles={{
            input: {
              fontFamily: "monospace",
            },
          }}
        />
      ) : null}
    </Stack>
  );
}

function PresetSelectField({
  label,
  description,
  value,
  presets,
  disabled,
  onChange,
}: {
  label: string;
  description?: string;
  value: string;
  presets: StylePresetOption[];
  disabled?: boolean;
  onChange: (value: string) => void;
}) {
  const matchedPreset = findMatchingPreset(value, presets);
  const [customMode, setCustomMode] = useState(!matchedPreset);
  const derivedSelectValue =
    customMode || !matchedPreset
      ? CUSTOM_PRESET_VALUE
      : (matchedPreset?.id ?? CUSTOM_PRESET_VALUE);
  const [selectValue, setSelectValue] = useState(derivedSelectValue);

  useEffect(() => {
    if (findMatchingPreset(value, presets)) {
      setCustomMode(false);
    }
  }, [value, presets]);

  useEffect(() => {
    setSelectValue(derivedSelectValue);
  }, [derivedSelectValue]);

  const showCustomInput = customMode || !matchedPreset;

  const selectData = [
    ...presets.map((preset) => ({
      label: preset.label,
      value: preset.id,
    })),
    { label: STYLE_EDITOR_LABELS.customPreset, value: CUSTOM_PRESET_VALUE },
  ];

  return (
    <Stack gap="xs">
      <Select
        disabled={disabled}
        label={label}
        description={description}
        data={selectData}
        value={selectValue}
        comboboxProps={{
          withinPortal: false,
          middlewares: { flip: true, size: { padding: 6 } },
        }}
        onChange={(nextValue) => {
          if (nextValue == null) {
            return;
          }

          if (nextValue === CUSTOM_PRESET_VALUE) {
            setSelectValue(CUSTOM_PRESET_VALUE);
            setCustomMode(true);
            return;
          }

          const preset = presets.find((option) => option.id === nextValue);

          setSelectValue(nextValue);
          setCustomMode(false);

          if (preset) {
            onChange(preset.value);
          }
        }}
      />

      {showCustomInput ? (
        <TextInput
          disabled={disabled}
          label={STYLE_EDITOR_LABELS.customValue}
          value={value}
          onChange={(event) => onChange(event.currentTarget.value)}
          styles={{
            input: {
              fontFamily: "monospace",
            },
          }}
        />
      ) : null}
    </Stack>
  );
}
