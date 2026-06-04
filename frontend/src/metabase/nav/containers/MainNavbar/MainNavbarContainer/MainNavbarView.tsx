import { useDisclosure } from "@mantine/hooks";
import type { MouseEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import { ActionIcon, Icon, type IconName, Text, Tooltip } from "metabase/ui";
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
const SIDEBAR_COLLECTION_ITEM_LIMIT = 100;
const SIDEBAR_COLLECTION_ITEM_MODELS = ["dashboard", "table", "card"] as const;

type SidebarCollectionItemModel =
  (typeof SIDEBAR_COLLECTION_ITEM_MODELS)[number];

type CollectionAssetTreeItem = {
  id: string;
  name: string;
  icon: IconName;
  children: [];
  data: CollectionItem & { model: SidebarCollectionItemModel };
};
type SidebarCollectionTreeItem = Omit<CollectionTreeItem, "children"> & {
  children: SidebarTreeItem[];
};
type SidebarTreeItem = SidebarCollectionTreeItem | CollectionAssetTreeItem;

function isCollectionAssetTreeItem(
  item: SidebarTreeItem,
): item is CollectionAssetTreeItem {
  return (
    "data" in item &&
    SIDEBAR_COLLECTION_ITEM_MODELS.includes(
      item.data?.model as SidebarCollectionItemModel,
    )
  );
}

function getCollectionAssetTreeItemId(item: {
  id: string | number;
  model: CollectionItem["model"];
}) {
  return `${item.model}-${item.id}`;
}

function getCollectionItemsCacheKey(collectionId: Collection["id"]) {
  return String(collectionId);
}

function isSidebarCollectionItem(
  item: CollectionItem,
): item is CollectionItem & { model: SidebarCollectionItemModel } {
  return SIDEBAR_COLLECTION_ITEM_MODELS.includes(
    item.model as SidebarCollectionItemModel,
  );
}

function getCollectionAssetIconName(item: CollectionItem): IconName {
  switch (item.model) {
    case "card":
      return "table2";
    case "dashboard":
      return "dashboard";
    case "table":
      return "table";
    default:
      return "unknown";
  }
}

function getCollectionAssetSortGroup(item: {
  model: SidebarCollectionItemModel;
}) {
  return item.model === "dashboard" ? 0 : 1;
}

function buildCollectionAssetTreeItems(
  collectionItems: CollectionItem[] = [],
): CollectionAssetTreeItem[] {
  const uniqueItems = _.uniq(
    collectionItems,
    false,
    (item) => `${item.model}-${item.id}`,
  );

  return uniqueItems
    .filter((item) => isSidebarCollectionItem(item) && !item.archived)
    .map((item) => ({
      id: getCollectionAssetTreeItemId(item),
      name: item.name,
      icon: getCollectionAssetIconName(item),
      children: [],
      data: item,
    }))
    .sort(
      (a, b) =>
        getCollectionAssetSortGroup(a.data) -
        getCollectionAssetSortGroup(b.data),
    );
}

function addCollectionAssetsToCollectionTree(
  collections: CollectionTreeItem[],
  collectionItemsByCollectionId: Record<string, CollectionItem[]> = {},
): SidebarTreeItem[] {
  if (Object.keys(collectionItemsByCollectionId).length === 0) {
    return collections;
  }

  return collections.map((collection) => {
    const children = addCollectionAssetsToCollectionTree(
      collection.children,
      collectionItemsByCollectionId,
    );
    const assetTreeItems = buildCollectionAssetTreeItems(
      collectionItemsByCollectionId[getCollectionItemsCacheKey(collection.id)],
    );

    if (assetTreeItems.length === 0) {
      return children === collection.children
        ? collection
        : { ...collection, children };
    }
    const existingAssetIds = new Set(assetTreeItems.map((asset) => asset.id));
    const childrenWithoutDuplicateAssets = children.filter(
      (child) =>
        !isCollectionAssetTreeItem(child) || !existingAssetIds.has(child.id),
    );

    return {
      ...collection,
      children: [...childrenWithoutDuplicateAssets, ...assetTreeItems],
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
  const selectedCollectionId = collectionItem?.id;

  const { data: selectedCollectionItems } = useListCollectionItemsQuery(
    selectedCollectionId != null
      ? {
          id: selectedCollectionId,
          models: [...SIDEBAR_COLLECTION_ITEM_MODELS],
          archived: false,
          limit: SIDEBAR_COLLECTION_ITEM_LIMIT,
          sort_column: "name",
          sort_direction: "asc",
        }
      : skipToken,
  );
  const [collectionItemsByCollectionId, setCollectionItemsByCollectionId] =
    useState<Record<string, CollectionItem[]>>({});

  useEffect(() => {
    if (selectedCollectionId == null || selectedCollectionItems?.data == null) {
      return;
    }

    const cacheKey = getCollectionItemsCacheKey(selectedCollectionId);

    setCollectionItemsByCollectionId(
      (previousCollectionItemsByCollectionId) => {
        if (
          _.isEqual(
            previousCollectionItemsByCollectionId[cacheKey],
            selectedCollectionItems.data,
          )
        ) {
          return previousCollectionItemsByCollectionId;
        }

        return {
          ...previousCollectionItemsByCollectionId,
          [cacheKey]: selectedCollectionItems.data,
        };
      },
    );
  }, [selectedCollectionId, selectedCollectionItems?.data]);

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

  const regularCollectionsWithAssets = useMemo(
    () =>
      addCollectionAssetsToCollectionTree(
        regularCollections,
        collectionItemsByCollectionId,
      ),
    [regularCollections, collectionItemsByCollectionId],
  );

  const selectedCollectionItemsInTree =
    selectedCollectionId != null
      ? collectionItemsByCollectionId[
          getCollectionItemsCacheKey(selectedCollectionId)
        ]
      : undefined;

  const selectedAssetItem = dashboardItem ?? cardItem;
  const hasSelectedAssetInTree =
    selectedAssetItem?.id != null &&
    selectedCollectionItemsInTree?.some(
      (item) =>
        item.model === selectedAssetItem.type &&
        item.id === selectedAssetItem.id,
    );

  const selectedCollectionTreeItemId =
    hasSelectedAssetInTree && selectedAssetItem?.id != null
      ? getCollectionAssetTreeItemId({
          id: selectedAssetItem.id,
          model: selectedAssetItem.type,
        })
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
              <LogoIcon height={35} />
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
                    data={regularCollectionsWithAssets}
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
