import { ColorPicker } from "metabase/common/components/ColorPicker";
import {
  DEFAULT_NEW_CHART_COLOR,
  MAX_CHART_SERIES_COLORS,
  parseChartColorList,
  serializeChartColorList,
} from "metabase/dashboard/style-editor/chart-colors";
import { STYLE_EDITOR_LABELS } from "metabase/dashboard/style-editor/labels.zh";
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Icon,
  Stack,
  Text,
  Tooltip,
} from "metabase/ui";

type Props = {
  label: string;
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
};

export function ChartColorsListField({
  label,
  value,
  disabled,
  onChange,
}: Props) {
  const colors = parseChartColorList(value);

  const handleColorChange = (index: number, color: string) => {
    const baseColors = colors.length > 0 ? colors : [DEFAULT_NEW_CHART_COLOR];
    const nextColors = [...baseColors];
    nextColors[index] = color;
    onChange(serializeChartColorList(nextColors));
  };

  const handleAddColor = () => {
    if (colors.length >= MAX_CHART_SERIES_COLORS) {
      return;
    }

    const lastColor = colors[colors.length - 1];
    onChange(
      serializeChartColorList([
        ...colors,
        lastColor ?? DEFAULT_NEW_CHART_COLOR,
      ]),
    );
  };

  const handleRemoveColor = (index: number) => {
    const baseColors = colors.length > 0 ? colors : [DEFAULT_NEW_CHART_COLOR];

    if (baseColors.length <= 1) {
      return;
    }

    onChange(
      serializeChartColorList(
        baseColors.filter((_, colorIndex) => colorIndex !== index),
      ),
    );
  };

  const displayColors = colors.length > 0 ? colors : [DEFAULT_NEW_CHART_COLOR];

  return (
    <Stack gap="xs" data-testid="chart-colors-list-field">
      <Text size="sm" fw={500}>
        {label}
      </Text>

      <Stack gap="sm">
        {displayColors.map((color, index) => (
          <Group key={`${index}-${color}`} gap="sm" wrap="nowrap">
            <Text size="sm" w={56} c="text-secondary">
              {`${STYLE_EDITOR_LABELS.seriesColor} ${index + 1}`}
            </Text>
            <Box
              style={{
                opacity: disabled ? 0.5 : 1,
                pointerEvents: disabled ? "none" : "auto",
              }}
            >
              <ColorPicker
                value={color}
                onChange={(nextColor) =>
                  handleColorChange(index, nextColor ?? color)
                }
              />
            </Box>
            <Tooltip label={STYLE_EDITOR_LABELS.removeSeriesColor}>
              <ActionIcon
                aria-label={STYLE_EDITOR_LABELS.removeSeriesColor}
                disabled={disabled || displayColors.length <= 1}
                variant="subtle"
                color="text-secondary"
                onClick={() => handleRemoveColor(index)}
              >
                <Icon name="close" size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
        ))}
      </Stack>

      <Button
        disabled={disabled || displayColors.length >= MAX_CHART_SERIES_COLORS}
        size="xs"
        variant="subtle"
        onClick={handleAddColor}
      >
        {STYLE_EDITOR_LABELS.addSeriesColor}
      </Button>
    </Stack>
  );
}
