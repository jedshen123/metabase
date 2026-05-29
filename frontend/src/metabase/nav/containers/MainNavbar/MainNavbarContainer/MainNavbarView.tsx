import { useDisclosure } from "@mantine/hooks";
import type { MouseEvent } from "react";
import { useCallback, useMemo } from "react";
import { t } from "ttag";
import _ from "underscore";

import ErrorBoundary from "metabase/ErrorBoundary";
import { skipToken, useListCollectionItemsQuery } from "metabase/api";
import {
  isExamplesCollection,
  isLibraryCollection,
  isRootTrashCollection,
} from "metabase/collections/utils";
import { CollapseSection } from "metabase/common/components/CollapseSection";
import { LogoIcon } from "metabase/common/components/LogoIcon";
import { Tree } from "metabase/common/components/tree";
import { useSetting, useUserSetting } from "metabase/common/hooks";
import { useIsAtHomepageDashboard } from "metabase/common/hooks/use-is-at-homepage-dashboard";
import { useShowOtherUsersCollections } from "metabase/common/hooks/use-show-other-users-collections";
import { NavbarLibrarySection } from "metabase/data-studio/nav/components/NavbarLibrarySection";
import type { CollectionTreeItem } from "metabase/entities/collections";
import {
  getCanAccessOnboardingPage,
  getIsNewInstance,
} from "metabase/home/selectors";
import { isSmallScreen } from "metabase/lib/dom";
import { useSelector } from "metabase/lib/redux";
import * as Urls from "metabase/lib/urls";
import { AppSwitcher } from "metabase/nav/components/AppSwitcher";
import NewItemButton from "metabase/nav/components/NewItemButton";
import { WhatsNewNotification } from "metabase/nav/components/WhatsNewNotification";
import { SearchButton } from "metabase/nav/components/search/SearchButton";
import { PLUGIN_REMOTE_SYNC, PLUGIN_TENANTS } from "metabase/plugins";
import {
  getIsTenantUser,
  getUser,
  getUserCanWriteToCollections,
} from "metabase/selectors/user";
import { ActionIcon, Icon, Text, Tooltip } from "metabase/ui";
import type { Bookmark, Collection, CollectionItem } from "metabase-types/api";

import {
  PaddedSidebarLink,
  SidebarAccountText,
  SidebarActions,
  SidebarBody,
  SidebarContentRoot,
  SidebarFooter,
  SidebarHeader,
  SidebarHeading,
  SidebarLogoLink,
  SidebarSection,
  TrashSidebarSection,
} from "../MainNavbar.styled";
import { SidebarCollectionLink } from "../SidebarItems";
import {
  trackAddDataModalOpened,
  trackNewCollectionFromNavInitiated,
} from "../analytics";
import type { SelectedItem } from "../types";

import { AddDataModal } from "./AddDataModal";
import BookmarkList from "./BookmarkList";
import { BrowseNavSection } from "./BrowseNavSection";
import { GettingStartedSection } from "./GettingStartedSection";

type Props = {
  isOpen: boolean;
  bookmarks: Bookmark[];
  hasDataAccess: boolean;
  collections: CollectionTreeItem[];
  selectedItems: SelectedItem[];
  sharedTenantCollections?: Collection[];
  canAccessTenantSpecificCollections: boolean;
  canCreateSharedCollection: boolean;
  showExternalCollectionsSection: boolean;
  handleCloseNavbar: () => void;
  handleLogout: () => void;
  handleCreateNewCollection: () => void;
  reorderBookmarks: ({
    newIndex,
    oldIndex,
  }: {
    newIndex: number;
    oldIndex: number;
  }) => Promise<any>;
};
const OTHER_USERS_COLLECTIONS_URL = Urls.otherUsersPersonalCollections();
const SIDEBAR_DASHBOARD_LIMIT = 100;

type DashboardTreeItem = {
  id: string;
  name: string;
  icon: "dashboard";
  children: [];
  data: CollectionItem & { model: "dashboard" };
};
type SidebarCollectionTreeItem = Omit<CollectionTreeItem, "children"> & {
  children: SidebarTreeItem[];
};
type SidebarTreeItem = SidebarCollectionTreeItem | DashboardTreeItem;

function getDashboardTreeItemId(dashboard: { id: string | number }) {
  return `dashboard-${dashboard.id}`;
}

function buildDashboardTreeItems(
  dashboards: CollectionItem[] = [],
): DashboardTreeItem[] {
  return dashboards
    .filter(
      (dashboard): dashboard is CollectionItem & { model: "dashboard" } =>
        dashboard.model === "dashboard" && !dashboard.archived,
    )
    .map((dashboard) => ({
      id: getDashboardTreeItemId(dashboard),
      name: dashboard.name,
      icon: "dashboard",
      children: [],
      data: dashboard,
    }));
}

function addDashboardsToCollectionTree(
  collections: CollectionTreeItem[],
  collectionId: Collection["id"] | undefined,
  dashboards: CollectionItem[] = [],
): SidebarTreeItem[] {
  if (collectionId == null || dashboards.length === 0) {
    return collections;
  }

  const dashboardTreeItems = buildDashboardTreeItems(dashboards);

  return collections.map((collection) => {
    const children = addDashboardsToCollectionTree(
      collection.children,
      collectionId,
      dashboards,
    );

    if (collection.id !== collectionId) {
      return children === collection.children
        ? collection
        : { ...collection, children };
    }

    return {
      ...collection,
      children: [...children, ...dashboardTreeItems],
    };
  });
}

export function MainNavbarView({
  isOpen,
  bookmarks,
  collections,
  selectedItems,
  hasDataAccess,
  reorderBookmarks,
  handleCreateNewCollection,
  handleCloseNavbar,
  sharedTenantCollections,
  canAccessTenantSpecificCollections,
  canCreateSharedCollection,
  showExternalCollectionsSection,
}: Props) {
  const [expandBookmarks = true, setExpandBookmarks] = useUserSetting(
    "expand-bookmarks-in-nav",
  );
  const [expandCollections = true, setExpandCollections] = useUserSetting(
    "expand-collections-in-nav",
  );

  const isAtHomepageDashboard = useIsAtHomepageDashboard();
  const canWriteToCollections = useSelector(getUserCanWriteToCollections);
  const currentUser = useSelector(getUser);
  const useTenants = useSetting("use-tenants");
  const isTenantUser = useSelector(getIsTenantUser);

  const [
    addDataModalOpened,
    { open: openAddDataModal, close: closeAddDataModal },
  ] = useDisclosure(false);

  const {
    card: cardItem,
    collection: collectionItem,
    dashboard: dashboardItem,
    "non-entity": nonEntityItem,
  } = _.indexBy(selectedItems, (item) => item.type);

  const { data: selectedCollectionItems } = useListCollectionItemsQuery(
    collectionItem?.id != null
      ? {
          id: collectionItem.id,
          models: ["dashboard"],
          archived: false,
          limit: SIDEBAR_DASHBOARD_LIMIT,
          sort_column: "name",
          sort_direction: "asc",
        }
      : skipToken,
  );

  const onItemSelect = useCallback(() => {
    if (isSmallScreen()) {
      handleCloseNavbar();
    }
  }, [handleCloseNavbar]);

  const handleHomeClick = useCallback(
    (event: MouseEvent) => {
      // Prevent navigating to the dashboard homepage when a user is already there
      // https://github.com/metabase/metabase/issues/43800
      if (isAtHomepageDashboard) {
        event.preventDefault();
      }
      onItemSelect();
    },
    [isAtHomepageDashboard, onItemSelect],
  );

  const { regularCollections, trashCollection, examplesCollection } =
    useMemo(() => {
      const trashCollection = collections.find(isRootTrashCollection);
      const examplesCollection = collections.find(isExamplesCollection);

      const regularCollections = collections.filter((c) => {
        const isNormalCollection =
          !isRootTrashCollection(c) && !isExamplesCollection(c);
        return isNormalCollection && !isLibraryCollection(c);
      });

      const collectionsByCategory = {
        trashCollection,
        examplesCollection,
      };

      return {
        ...collectionsByCategory,
        regularCollections:
          useTenants && isTenantUser
            ? PLUGIN_TENANTS.getFlattenedCollectionsForNavbar({
                currentUser,
                sharedTenantCollections,
                regularCollections,
              })
            : regularCollections,
      };
    }, [
      collections,
      isTenantUser,
      useTenants,
      sharedTenantCollections,
      currentUser,
    ]);

  const isNewInstance = useSelector(getIsNewInstance);
  const canAccessOnboarding = useSelector(getCanAccessOnboardingPage);
  const shouldDisplayGettingStarted = isNewInstance && canAccessOnboarding;

  const showOtherUsersCollections = useShowOtherUsersCollections();

  const collectionsHeading = showExternalCollectionsSection
    ? t`Internal Collections`
    : t`Collections`;

  const regularCollectionsWithDashboards = useMemo(
    () =>
      addDashboardsToCollectionTree(
        regularCollections,
        collectionItem?.id,
        selectedCollectionItems?.data,
      ),
    [regularCollections, collectionItem?.id, selectedCollectionItems?.data],
  );

  const hasSelectedDashboardInTree =
    dashboardItem?.id != null &&
    selectedCollectionItems?.data.some(
      (item) => item.model === "dashboard" && item.id === dashboardItem.id,
    );

  const selectedCollectionTreeItemId =
    hasSelectedDashboardInTree && dashboardItem?.id != null
      ? getDashboardTreeItemId({ id: dashboardItem.id })
      : collectionItem?.id;

  return (
    <ErrorBoundary>
      <SidebarContentRoot>
        <SidebarBody>
          <SidebarHeader isOpen={isOpen}>
            <SidebarLogoLink
              to="/"
              onClick={handleHomeClick}
              data-testid="main-logo-link"
            >
              <LogoIcon height={52} />
            </SidebarLogoLink>

            {isOpen && (
              <SidebarActions>
                <SearchButton w="100%" />
                <NewItemButton />
              </SidebarActions>
            )}
          </SidebarHeader>

          <SidebarSection>
            <PaddedSidebarLink
              isSelected={nonEntityItem?.url === "/"}
              icon="home"
              onClick={handleHomeClick}
              url="/"
            >
              {t`Home`}
            </PaddedSidebarLink>
          </SidebarSection>

          {shouldDisplayGettingStarted && (
            <SidebarSection>
              <ErrorBoundary>
                <GettingStartedSection
                  nonEntityItem={nonEntityItem}
                  onAddDataModalOpen={() => {
                    trackAddDataModalOpened("getting-started");
                    openAddDataModal();
                  }}
                >
                  {examplesCollection && (
                    <Tree
                      data={[examplesCollection]}
                      selectedId={collectionItem?.id}
                      onSelect={onItemSelect}
                      TreeNode={SidebarCollectionLink}
                      role="tree"
                      aria-label="examples-collection-tree"
                    />
                  )}
                </GettingStartedSection>
              </ErrorBoundary>
            </SidebarSection>
          )}

          {bookmarks.length > 0 && (
            <SidebarSection>
              <ErrorBoundary>
                <BookmarkList
                  bookmarks={bookmarks}
                  selectedItem={cardItem ?? dashboardItem ?? collectionItem}
                  onSelect={onItemSelect}
                  reorderBookmarks={reorderBookmarks}
                  onToggle={setExpandBookmarks}
                  initialState={expandBookmarks ? "expanded" : "collapsed"}
                />
              </ErrorBoundary>
            </SidebarSection>
          )}

          {/* Tenant users don't see the section about "External collections" */}
          {showExternalCollectionsSection && (
            <PLUGIN_TENANTS.MainNavSharedCollections
              canAccessTenantSpecificCollections={
                canAccessTenantSpecificCollections
              }
              canCreateSharedCollection={canCreateSharedCollection}
              sharedTenantCollections={sharedTenantCollections}
            />
          )}

          <NavbarLibrarySection
            collections={collections}
            selectedId={collectionItem?.id}
            onItemSelect={onItemSelect}
          />

          <SidebarSection>
            <ErrorBoundary>
              <CollapseSection
                header={<SidebarHeading>{collectionsHeading}</SidebarHeading>}
                initialState={expandCollections ? "expanded" : "collapsed"}
                iconPosition="right"
                iconSize={8}
                onToggle={setExpandCollections}
                rightAction={
                  canWriteToCollections && !isTenantUser ? (
                    <Tooltip label={t`Create a new collection`}>
                      <ActionIcon
                        aria-label={t`Create a new collection`}
                        color="text-secondary"
                        onClick={() => {
                          trackNewCollectionFromNavInitiated();
                          handleCreateNewCollection();
                        }}
                      >
                        <Icon name="add" />
                      </ActionIcon>
                    </Tooltip>
                  ) : null
                }
                role="section"
                aria-label={t`Collections`}
              >
                {PLUGIN_REMOTE_SYNC.CollectionsNavTree ? (
                  <PLUGIN_REMOTE_SYNC.CollectionsNavTree
                    collections={regularCollections}
                    selectedId={collectionItem?.id}
                    onSelect={onItemSelect}
                  />
                ) : (
                  <Tree
                    data={regularCollectionsWithDashboards}
                    selectedId={selectedCollectionTreeItemId}
                    onSelect={onItemSelect}
                    TreeNode={SidebarCollectionLink}
                    role="tree"
                    aria-label="collection-tree"
                  />
                )}
                {showOtherUsersCollections && (
                  <PaddedSidebarLink
                    icon="group"
                    url={OTHER_USERS_COLLECTIONS_URL}
                  >
                    {t`Other users' personal collections`}
                  </PaddedSidebarLink>
                )}
              </CollapseSection>
            </ErrorBoundary>
          </SidebarSection>

          <SidebarSection>
            <ErrorBoundary>
              <BrowseNavSection
                nonEntityItem={nonEntityItem}
                onItemSelect={onItemSelect}
                hasDataAccess={hasDataAccess}
                onAddDataModalOpen={openAddDataModal}
              />
            </ErrorBoundary>
          </SidebarSection>

          {trashCollection && (
            <TrashSidebarSection>
              <ErrorBoundary>
                <Tree
                  data={[trashCollection]}
                  selectedId={collectionItem?.id}
                  onSelect={onItemSelect}
                  TreeNode={SidebarCollectionLink}
                  role="tree"
                />
              </ErrorBoundary>
            </TrashSidebarSection>
          )}
          <div>
            <WhatsNewNotification />
          </div>
        </SidebarBody>
        <SidebarFooter isOpen={isOpen}>
          <AppSwitcher />
          {isOpen && (
            <SidebarAccountText>
              <Text fw={700} lh="sm" truncate>
                {currentUser?.first_name || currentUser?.email || t`Account`}
              </Text>
              {currentUser?.email && (
                <Text c="text-tertiary" fz="sm" lh="sm" truncate>
                  {currentUser.email}
                </Text>
              )}
            </SidebarAccountText>
          )}
        </SidebarFooter>
      </SidebarContentRoot>

      <AddDataModal opened={addDataModalOpened} onClose={closeAddDataModal} />
    </ErrorBoundary>
  );
}
