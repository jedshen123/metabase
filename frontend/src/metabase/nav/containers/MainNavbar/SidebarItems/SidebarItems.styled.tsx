// eslint-disable-next-line no-restricted-imports
import { css } from "@emotion/react";
// eslint-disable-next-line no-restricted-imports
import styled from "@emotion/styled";
import type { ComponentProps } from "react";
import { forwardRef } from "react";

import { Link } from "metabase/common/components/Link";
import { TreeNode } from "metabase/common/components/tree/TreeNode";
import type { ColorName } from "metabase/lib/colors/types";
import { NAV_SIDEBAR_WIDTH } from "metabase/nav/constants";
import type { IconProps } from "metabase/ui";
import { Icon, Tooltip } from "metabase/ui";
import { color } from "metabase/ui/utils/colors";

export const SidebarIcon = styled(
  forwardRef<SVGSVGElement, IconProps & { isSelected: boolean }>(
    function SidebarIcon({ color, isSelected, ...props }, ref) {
      return (
        <Icon
          {...props}
          c={color ?? props.c}
          size={props.size ?? 16}
          ref={ref}
        />
      );
    },
  ),
)<{
  color?: ColorName | string;
  isSelected: boolean;
}>`
  ${(props) =>
    !props.color &&
    css`
      color: ${props.isSelected
        ? "var(--mb-color-brand)"
        : "var(--mb-color-icon-secondary)"};
    `}
  transition: color 120ms ease;
`;

export const ExpandToggleButton = styled(TreeNode.ExpandToggleButton)`
  width: 18px;
  height: 28px;
  padding: 0;
  color: var(--mb-color-icon-secondary);
  opacity: ${(props) => (props.hidden ? 0 : 0.58)};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--mantine-radius-xs);
  transition:
    background-color 120ms ease,
    color 120ms ease,
    opacity 120ms ease;

  &:hover {
    color: var(--mb-color-brand);
    opacity: 1;
    background-color: var(--mb-color-background-hover);
  }
`;

const activeColorCSS = css`
  color: var(--mb-color-brand);
`;

function getTextColor() {
  return color("text-primary");
}

type NodeRootProps = ComponentProps<typeof TreeNode.Root> & {
  hasDefaultIconStyle?: boolean;
};

export const NodeRoot = styled(TreeNode.Root)<NodeRootProps>`
  position: relative;
  min-height: 32px;
  margin: 1px 0;
  gap: 2px;
  color: ${getTextColor()};
  font-family:
    var(--mb-default-font-family),
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
  background-color: ${(props) =>
    props.isSelected ? "var(--mb-color-background-selected)" : "transparent"};
  padding-left: ${(props) => `calc(${props.depth}rem + 2px)`};
  border-radius: var(--mantine-radius-sm);
  box-shadow: none;
  font-weight: ${(props) => (props.isSelected ? 500 : 400)};
  line-height: 1.4;
  transition:
    background-color 120ms ease,
    color 120ms ease;

  ${(props) =>
    props.depth > 0 &&
    css`
      &::before {
        content: "";
        position: absolute;
        top: 0;
        bottom: 0;
        left: calc(${props.depth}rem - 0.45rem);
        width: 1px;
        background-color: var(--mb-color-border-subtle);
      }
    `}

  &[data-sidebar-item-type="card"],
  &[data-sidebar-item-type="dashboard"],
  &[data-sidebar-item-type="table"] {
    color: var(--mb-color-text-primary);
    font-size: 11px;
    font-weight: ${(props) => (props.isSelected ? 500 : 400)};
    line-height: 1.4;
  }

  &[data-sidebar-item-type="collection"] {
    color: var(--mb-color-text-secondary);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0;
    line-height: 1.4;
    text-transform: none;
  }

  &:focus-within {
    outline: none;
    box-shadow: 0 0 0 2px var(--mb-color-focus);
  }

  ${ExpandToggleButton} {
    ${(props) =>
      props.isSelected &&
      css`
        ${activeColorCSS}
        opacity: 1;
      `}
  }

  &:hover {
    background-color: var(--mb-color-background-hover);
    color: var(--mb-color-text-primary);
    box-shadow: none;

    ${ExpandToggleButton} {
      color: var(--mb-color-brand);
      opacity: 1;
    }
  }

  &:hover,
  &:focus,
  &:focus-within {
    ${SidebarIcon} {
      ${({ hasDefaultIconStyle = true }) =>
        hasDefaultIconStyle && activeColorCSS};
    }
  }
`;

const collectionDragAndDropHoverStyle = css`
  color: var(--mb-color-text-primary-inverse);
  background-color: var(--mb-color-brand);
`;

export const CollectionNodeRoot = styled(NodeRoot)<{ hovered?: boolean }>`
  ${(props) => props.hovered && collectionDragAndDropHoverStyle}
`;

const itemContentStyle = css`
  display: flex;
  align-items: center;
  width: 100%;
`;

export const FullWidthButton = styled.button<{ isSelected: boolean }>`
  color: inherit;
  cursor: pointer;

  ${itemContentStyle}
  ${TreeNode.NameContainer} {
    font-weight: inherit;
    color: inherit;
    text-align: start;

    &:hover {
      color: inherit;
    }
  }

  &:focus,
  &:focus-visible {
    outline: none;
  }
`;

export const FullWidthLink = styled(Link)`
  ${itemContentStyle}
  color: inherit;

  &:focus,
  &:focus-visible {
    outline: none !important;
  }
`;

const ITEM_NAME_LENGTH_TOOLTIP_THRESHOLD = 35;
const ITEM_NAME_LABEL_WIDTH = Math.round(parseInt(NAV_SIDEBAR_WIDTH, 10) * 0.7);

export const ItemName = styled(TreeNode.NameContainer)`
  width: ${ITEM_NAME_LABEL_WIDTH}px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export function NameContainer({ children: itemName }: { children: string }) {
  if (itemName.length >= ITEM_NAME_LENGTH_TOOLTIP_THRESHOLD) {
    return (
      <Tooltip label={itemName} withArrow maw="none">
        <ItemName>{itemName}</ItemName>
      </Tooltip>
    );
  }
  return <TreeNode.NameContainer>{itemName}</TreeNode.NameContainer>;
}

export const LeftElementContainer = styled.div``;
export const RightElementContainer = styled.div``;
