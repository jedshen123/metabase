// eslint-disable-next-line no-restricted-imports
import styled from "@emotion/styled";

import { Link } from "metabase/common/components/Link";
import {
  NAV_SIDEBAR_TRIGGER_WIDTH,
  NAV_SIDEBAR_WIDTH,
} from "metabase/nav/constants";
import { breakpointMaxSmall } from "metabase/styled-components/theme";
import { Box, type BoxProps } from "metabase/ui";

import { SidebarLink } from "./SidebarItems";
import { ExpandToggleButton } from "./SidebarItems/SidebarItems.styled";

export const Sidebar = styled.aside<{
  isOpen: boolean;
  side: "left" | "right";
  width?: string;
}>`
  height: 100%;
  position: absolute;
  inset-block: 0;
  ${(props) =>
    props.side === "left" ? "inset-inline-start: 0;" : "inset-inline-end: 0;"}
  flex-shrink: 0;
  align-items: center;
  background-color: var(--mb-color-background-primary);
  z-index: 6;
  width: ${(props) => props.width ?? NAV_SIDEBAR_WIDTH};
  overflow: hidden;
  transform: ${(props) =>
    props.isOpen
      ? "translateX(0)"
      : `translateX(calc(-1 * ${props.width ?? NAV_SIDEBAR_WIDTH}))`};
  transition:
    transform 280ms cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 200ms ease;
  box-shadow: ${(props) =>
    props.isOpen ? "0 7px 20px var(--mb-color-shadow)" : "none"};
  ${(props) =>
    props.side === "left"
      ? "border-inline-end: 1px solid var(--mb-color-border);"
      : "border-inline-start: 1px solid var(--mb-color-border);"}

  ${breakpointMaxSmall} {
    width: 90vw;
    transform: ${(props) =>
      props.isOpen ? "translateX(0)" : "translateX(-90vw)"};
    position: absolute;
    top: 0;
    ${(props) =>
      props.side === "left" ? "inset-inline-start: 0;" : "inset-inline-end: 0;"}
    box-shadow: ${(props) =>
      props.isOpen ? "0 7px 20px var(--mb-color-shadow)" : "none"};
  }
`;

export const SidebarTrigger = styled.button<{
  isOpen: boolean;
  side: "left" | "right";
}>`
  position: absolute;
  top: 50%;
  ${(props) =>
    props.side === "left" ? "inset-inline-start: 0;" : "inset-inline-end: 0;"}
  z-index: 5;
  display: ${(props) => (props.isOpen ? "none" : "flex")};
  align-items: center;
  justify-content: center;
  width: ${NAV_SIDEBAR_TRIGGER_WIDTH};
  height: 4rem;
  padding: 0;
  border: 0;
  border-radius: 0 0.5rem 0.5rem 0;
  background: var(--mb-color-brand);
  color: var(--mb-color-text-white);
  cursor: pointer;
  opacity: 0.72;
  transform: translateY(-50%);
  transition:
    width 200ms ease,
    opacity 200ms ease;

  &:hover {
    width: 1.375rem;
    opacity: 1;
  }

  &::after {
    content: "";
    width: 0.5rem;
    height: 0.5rem;
    border-block-start: 2px solid currentColor;
    border-inline-end: 2px solid currentColor;
    transform: rotate(45deg);
  }
`;

export const NavRoot = styled.nav<{ isOpen: boolean }>`
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding-top: var(--mantine-spacing-sm);
  height: 100%;
  background-color: transparent;
  overflow-x: hidden;
  overflow-y: auto;
  width: ${NAV_SIDEBAR_WIDTH};

  ${breakpointMaxSmall} {
    width: 90vw;
  }
`;

export const SidebarContentRoot = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
  min-width: ${NAV_SIDEBAR_WIDTH};
`;

export const SidebarHeader = styled.div<{ isOpen: boolean }>`
  display: flex;
  flex-direction: column;
  gap: var(--mantine-spacing-md);
  padding: var(--mantine-spacing-xl) var(--mantine-spacing-md)
    var(--mantine-spacing-sm);
  width: ${NAV_SIDEBAR_WIDTH};
  opacity: ${(props) => (props.isOpen ? 1 : 0.94)};
`;

export const SidebarLogoLink = styled(Link)`
  display: flex;
  align-items: center;
  min-height: 2.5rem;
  width: fit-content;
  max-width: calc(${NAV_SIDEBAR_WIDTH} - 2rem);
  overflow: hidden;
  border-radius: 0.375rem;
  line-height: 0;
`;

export const SidebarActions = styled.div`
  display: flex;
  align-items: center;
  gap: var(--mantine-spacing-sm);
`;

export const SidebarBody = styled.div`
  flex: 1;
`;

export const SidebarFooter = styled.div<{ isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.isOpen ? "flex-start" : "center")};
  gap: var(--mantine-spacing-sm);
  padding: var(--mantine-spacing-md);
  border-top: 1px solid var(--mb-color-border);
  width: ${NAV_SIDEBAR_WIDTH};
`;

export const SidebarAccountText = styled.div`
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
`;

export const SidebarSection = styled(Box)<BoxProps>`
  margin-top: var(--mantine-spacing-sm);
  margin-bottom: var(--mantine-spacing-md);
  padding-inline-start: var(--mantine-spacing-md);
  padding-inline-end: var(--mantine-spacing-md);
` as unknown as typeof Box;

export const TrashSidebarSection = styled(SidebarSection)`
  ${ExpandToggleButton} {
    width: 12px;
  }
` as unknown as typeof Box;

export const SidebarHeading = styled.h4`
  color: var(--mb-color-text-secondary);
  font-weight: 700;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.45px;
  padding-inline-start: var(--mantine-spacing-md);
`;

export const LoadingAndErrorContainer = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const LoadingAndErrorContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  color: var(--mb-color-brand);
  text-align: center;
`;

export const PaddedSidebarLink = styled(SidebarLink)`
  padding-inline-start: 12px;
`;
