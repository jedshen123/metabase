import { useCallback, useEffect, useState } from "react";
import * as React from "react";
import { usePrevious } from "react-use";
import _ from "underscore";

import type { BoxProps } from "metabase/ui";

import { TreeNode as DefaultTreeNode } from "./TreeNode";
import { TreeNodeList } from "./TreeNodeList";
import type { ITreeNodeItem } from "./types";
import { getAllExpandableIds, getInitialExpandedIds } from "./utils";

interface TreeProps<TData = unknown> extends Omit<BoxProps, "children"> {
  data: ITreeNodeItem<TData>[];
  selectedId?: ITreeNodeItem<TData>["id"];
  emptyState?: React.ReactNode;
  initialExpandedIds?: ITreeNodeItem<TData>["id"][];
  initiallyExpanded?: boolean;
  role?: string;
  onSelect?: (item: ITreeNodeItem<TData>) => void;
  rightSection?: (item: ITreeNodeItem<TData>) => React.ReactNode;
  TreeNode?: any;
}

function BaseTree<TData = unknown>({
  data,
  selectedId,
  role = "menu",
  emptyState = null,
  initialExpandedIds,
  initiallyExpanded = false,
  onSelect,
  TreeNode = DefaultTreeNode,
  rightSection,
  ...boxProps
}: TreeProps<TData>) {
  const [expandedIds, setExpandedIds] = useState(() => {
    if (initiallyExpanded) {
      return new Set(getAllExpandableIds(data));
    }
    if (initialExpandedIds) {
      return new Set(initialExpandedIds);
    }
    return new Set(
      selectedId != null ? getInitialExpandedIds(selectedId, data) : [],
    );
  });
  const [manuallyCollapsedIds, setManuallyCollapsedIds] = useState<
    Set<ITreeNodeItem<TData>["id"]>
  >(new Set());
  const previousSelectedId = usePrevious(selectedId);
  const prevData = usePrevious(data);

  useEffect(() => {
    const dataHasChanged = !_.isEqual(data, prevData);

    if (initiallyExpanded && dataHasChanged) {
      setExpandedIds((prev) => {
        const autoExpandedIds = getAllExpandableIds(data).filter(
          (id) => !manuallyCollapsedIds.has(id),
        );
        return new Set([...prev, ...autoExpandedIds]);
      });
      return;
    }

    if (!selectedId) {
      return;
    }
    const selectedItemChanged =
      previousSelectedId !== selectedId && !expandedIds.has(selectedId);

    if (selectedItemChanged || dataHasChanged) {
      setExpandedIds((prev) => {
        const autoExpandedIds = getInitialExpandedIds(selectedId, data).filter(
          (id) => !manuallyCollapsedIds.has(id),
        );
        return new Set([...prev, ...autoExpandedIds]);
      });
    }
  }, [
    prevData,
    data,
    selectedId,
    previousSelectedId,
    expandedIds,
    manuallyCollapsedIds,
    initiallyExpanded,
  ]);

  const handleToggleExpand = useCallback(
    (itemId: string | number) => {
      if (expandedIds.has(itemId)) {
        setExpandedIds(
          (prev) => new Set([...prev].filter((id) => id !== itemId)),
        );
        setManuallyCollapsedIds((prev) => new Set([...prev, itemId]));
      } else {
        setExpandedIds((prev) => new Set([...prev, itemId]));
        setManuallyCollapsedIds(
          (prev) => new Set([...prev].filter((id) => id !== itemId)),
        );
      }
    },
    [expandedIds],
  );

  if (data.length === 0) {
    return <React.Fragment>{emptyState}</React.Fragment>;
  }

  const effectiveExpandedIds = initiallyExpanded
    ? new Set([
        ...expandedIds,
        ...getAllExpandableIds(data).filter(
          (id) => !manuallyCollapsedIds.has(id),
        ),
      ])
    : expandedIds;

  return (
    <TreeNodeList
      role={role}
      items={data}
      TreeNode={TreeNode}
      expandedIds={effectiveExpandedIds}
      selectedId={selectedId}
      depth={0}
      onSelect={onSelect}
      onToggleExpand={handleToggleExpand}
      rightSection={rightSection}
      {...boxProps}
    />
  );
}

export const Tree = Object.assign(BaseTree, {
  Node: DefaultTreeNode,
  NodeList: TreeNodeList,
});
