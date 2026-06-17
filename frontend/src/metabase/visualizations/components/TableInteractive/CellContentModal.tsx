import { useClipboard } from "@mantine/hooks";
import { t } from "ttag";

import { CodeEditor } from "metabase/common/components/CodeEditor";
import { formatJsonValue, formatRawJsonCellValue } from "metabase/lib/json";
import { Box, Button, Flex, Icon, Modal } from "metabase/ui";
import type { RowValue } from "metabase-types/api";

import S from "./CellContentModal.module.css";

type Props = {
  parsedValue: unknown;
  rawValue: RowValue;
  opened: boolean;
  onClose: () => void;
};

export function CellContentModal({
  parsedValue,
  rawValue,
  opened,
  onClose,
}: Props) {
  const formattedJson = formatJsonValue(parsedValue);
  const rawJson = formatRawJsonCellValue(rawValue);
  const rawClipboard = useClipboard({ timeout: 2000 });
  const formattedClipboard = useClipboard({ timeout: 2000 });

  return (
    <Modal
      data-testid="cell-content-modal"
      title={t`Cell content`}
      size="xl"
      padding="xl"
      opened={opened}
      onClose={onClose}
    >
      <Box className={S.codeContainer} data-testid="cell-content-json">
        <CodeEditor
          language="json"
          lineNumbers={false}
          readOnly
          value={formattedJson}
        />
      </Box>
      <Flex className={S.actions} gap="sm" justify="flex-end" wrap="wrap">
        <Button
          data-testid="copy-original-button"
          variant="default"
          onClick={() => rawClipboard.copy(rawJson)}
        >
          {rawClipboard.copied ? t`Copied!` : t`Copy original`}
        </Button>
        <Button
          data-testid="copy-formatted-button"
          leftSection={<Icon name="copy" size={16} />}
          variant="filled"
          onClick={() => formattedClipboard.copy(formattedJson)}
        >
          {formattedClipboard.copied ? t`Copied!` : t`Copy formatted`}
        </Button>
      </Flex>
    </Modal>
  );
}
