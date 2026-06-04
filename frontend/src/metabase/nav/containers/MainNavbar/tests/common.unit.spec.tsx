import userEvent from "@testing-library/user-event";
import dayjs from "dayjs";

import { screen, within } from "__support__/ui";
import { createMockModelResult } from "metabase/browse/models/test-utils";
import { ROOT_COLLECTION } from "metabase/entities/collections";
import * as Urls from "metabase/lib/urls";
import registerVisualizations from "metabase/visualizations/register";
import {
  createMockCard,
  createMockCollection,
  createMockCollectionItem,
  createMockDashboard,
  createMockUser,
} from "metabase-types/api/mocks";

import {
  PERSONAL_COLLECTION_BASE,
  TEST_COLLECTION,
  setup,
  setupCollectionPage,
} from "./setup";

describe("nav > containers > MainNavbar", () => {
  beforeAll(() => {
    registerVisualizations();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("homepage link", () => {
    it("should render", async () => {
      await setup();
      const link = screen.getByRole("link", { name: /Home/i });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/");
    });

    it("should be highlighted if selected", async () => {
      await setup({ pathname: "/" });
      const link = screen.getByRole("listitem", { name: /Home/i });
      expect(link).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("Getting Started section", () => {
    it("should not render if the instance was created more than 30 days ago", async () => {
      await setup({
        user: createMockUser({ is_superuser: true }),
        instanceCreationDate: dayjs().subtract(31, "days").toISOString(),
      });
      const section = screen.queryByRole("tab", {
        name: /^Getting Started/i,
      });
      const onboardingLink = screen.queryByRole("link", {
        name: /How to use Metabase/i,
      });

      expect(section).not.toBeInTheDocument();
      expect(onboardingLink).not.toBeInTheDocument();
    });

    it("should render if the instance was created less than 30 days ago", async () => {
      await setup({
        user: createMockUser({ is_superuser: true }),
        instanceCreationDate: dayjs().subtract(14, "days").toISOString(),
      });
      const section = screen.getByRole("tab", {
        name: /^Getting Started/i,
      });
      const onboardingLink = within(section).getByRole("link", {
        name: /How to use Metabase/i,
      });

      expect(section).toBeInTheDocument();
      expect(onboardingLink).toBeInTheDocument();
      expect(onboardingLink).toHaveAttribute("href", "/getting-started");
    });

    it("should not render if the instance is inside embedding iframe", async () => {
      await setup({
        user: createMockUser({ is_superuser: true }),
        isEmbeddingIframe: true,
      });
      const section = screen.queryByRole("tab", {
        name: /^Getting Started/i,
      });
      const onboardingLink = screen.queryByRole("link", {
        name: /How to use Metabase/i,
      });

      expect(section).not.toBeInTheDocument();
      expect(onboardingLink).not.toBeInTheDocument();
    });

    it.each(["admin", "non-admin"])("should render for %s", async (user) => {
      await setup({ user: createMockUser({ is_superuser: user === "admin" }) });
      const section = screen.getByRole("tab", {
        name: /^Getting Started/i,
      });
      expect(section).toBeInTheDocument();
    });

    it("should be expanded initially but collapsible", async () => {
      await setup({ user: createMockUser({ is_superuser: true }) });
      const sectionTitle = screen.getByRole("heading", {
        name: /Getting Started/i,
      });

      expect(sectionTitle).toBeInTheDocument();
      expect(screen.getByText(/How to use Metabase/i)).toBeInTheDocument();

      await userEvent.click(sectionTitle);
      expect(sectionTitle).toBeInTheDocument();
      expect(
        screen.queryByText(/How to use Metabase/i),
      ).not.toBeInTheDocument();
    });

    it("'How to use Metabase' link should be highlighted if selected", async () => {
      await setup({
        pathname: "/getting-started",
        user: createMockUser({ is_superuser: true }),
      });
      const link = screen.getByRole("listitem", {
        name: /How to use Metabase/i,
      });
      expect(link).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("browse databases link", () => {
    it("should render", async () => {
      await setup();
      const listItem = screen.getByRole("listitem", {
        name: /Browse databases/i,
      });
      const link = within(listItem).getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/browse/databases");
    });

    it("should not render when a user has no data access", async () => {
      await setup({ hasDataAccess: false });
      expect(
        screen.queryByRole("listitem", { name: /Browse databases/i }),
      ).not.toBeInTheDocument();
    });

    it("should be highlighted if selected", async () => {
      await setup({ pathname: "/browse/databases" });
      const listItem = screen.getByRole("listitem", {
        name: /Browse databases/i,
      });
      expect(listItem).toHaveAttribute("aria-selected", "true");
    });

    it("should be highlighted if child route selected", async () => {
      await setup({ pathname: "/browse/databases/1" });
      const listItem = screen.getByRole("listitem", {
        name: /Browse databases/i,
      });
      expect(listItem).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("browse models link", () => {
    it("should render when there are models", async () => {
      await setup({ models: [createMockModelResult()] });
      const listItem = await screen.findByRole("listitem", {
        name: /Browse models/i,
      });
      const link = await within(listItem).findByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", "/browse/models");
    });

    it("should render when there are no models", async () => {
      await setup({ models: [] });
      expect(
        screen.getByRole("listitem", { name: /Browse models/i }),
      ).toBeInTheDocument();
    });

    it("should be highlighted if selected", async () => {
      await setup({
        models: [createMockModelResult()],
        pathname: "/browse/models",
      });
      const listItem = await screen.findByRole("listitem", {
        name: /Browse models/i,
      });
      expect(listItem).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("collection tree", () => {
    it("should show collections", async () => {
      const {
        rootCollectionElements,
        personalCollectionElements,
        regularCollectionElements,
      } = await setupCollectionPage({ pathname: "/", route: "/" });

      expect(rootCollectionElements.button).toBeInTheDocument();
      expect(rootCollectionElements.button).not.toHaveAttribute("href");
      expect(personalCollectionElements.button).toBeInTheDocument();
      expect(personalCollectionElements.button).not.toHaveAttribute("href");
      expect(regularCollectionElements.button).toBeInTheDocument();
      expect(regularCollectionElements.button).not.toHaveAttribute("href");
    });

    it("should not highlight collections when not selected", async () => {
      const {
        rootCollectionElements,
        personalCollectionElements,
        regularCollectionElements,
      } = await setupCollectionPage({ pathname: "/", route: "/" });

      expect(rootCollectionElements.listItem).toHaveAttribute(
        "aria-selected",
        "false",
      );
      expect(personalCollectionElements.listItem).toHaveAttribute(
        "aria-selected",
        "false",
      );
      expect(regularCollectionElements.listItem).toHaveAttribute(
        "aria-selected",
        "false",
      );
    });

    it("should highlight regular collection if selected", async () => {
      const {
        rootCollectionElements,
        personalCollectionElements,
        regularCollectionElements,
      } = await setupCollectionPage({
        pathname: Urls.collection(TEST_COLLECTION),
      });

      expect(regularCollectionElements.listItem).toHaveAttribute(
        "aria-selected",
        "true",
      );
      expect(rootCollectionElements.listItem).toHaveAttribute(
        "aria-selected",
        "false",
      );
      expect(personalCollectionElements.listItem).toHaveAttribute(
        "aria-selected",
        "false",
      );
    });

    it("should highlight root if selected", async () => {
      const {
        rootCollectionElements,
        personalCollectionElements,
        regularCollectionElements,
      } = await setupCollectionPage({
        pathname: Urls.collection(ROOT_COLLECTION),
      });

      expect(rootCollectionElements.listItem).toHaveAttribute(
        "aria-selected",
        "true",
      );
      expect(regularCollectionElements.listItem).toHaveAttribute(
        "aria-selected",
        "false",
      );
      expect(personalCollectionElements.listItem).toHaveAttribute(
        "aria-selected",
        "false",
      );
    });

    it("should show collection assets inside the selected collection", async () => {
      const dashboard = createMockCollectionItem({
        id: 123,
        model: "dashboard",
        name: "Operations dashboard",
        collection_id: TEST_COLLECTION.id,
      });
      const table = createMockCollectionItem({
        id: 456,
        model: "table",
        name: "Orders table",
        collection_id: TEST_COLLECTION.id,
      });
      const question = createMockCollectionItem({
        id: 789,
        model: "card",
        name: "Orders by month",
        collection_id: TEST_COLLECTION.id,
      });

      await setup({
        pathname: Urls.collection(TEST_COLLECTION),
        route: "/collection/:slug",
        testCollectionItems: [dashboard, table, question],
      });

      expect(
        await screen.findByRole("button", { name: /Operations dashboard/i }),
      ).not.toHaveAttribute("href");
      expect(
        within(
          screen.getByRole("button", { name: /Operations dashboard/i }),
        ).getByLabelText("dashboard icon"),
      ).toHaveStyle({
        color: "var(--mantine-color-saturated-blue-text)",
      });
      expect(
        screen.getByRole("button", { name: /Orders table/i }),
      ).not.toHaveAttribute("href");
      expect(
        screen.getByRole("button", { name: /Orders by month/i }),
      ).not.toHaveAttribute("href");
    });

    it("should show dashboard assets before other asset types inside a collection", async () => {
      const question = createMockCollectionItem({
        id: 789,
        model: "card",
        name: "Orders by month",
        collection_id: TEST_COLLECTION.id,
      });
      const table = createMockCollectionItem({
        id: 456,
        model: "table",
        name: "Orders table",
        collection_id: TEST_COLLECTION.id,
      });
      const dashboard = createMockCollectionItem({
        id: 123,
        model: "dashboard",
        name: "Operations dashboard",
        collection_id: TEST_COLLECTION.id,
      });

      await setup({
        pathname: Urls.collection(TEST_COLLECTION),
        route: "/collection/:slug",
        testCollectionItems: [question, table, dashboard],
      });

      await screen.findByRole("button", { name: /Operations dashboard/i });

      const tree = screen.getByRole("tree", { name: "collection-tree" });
      const assetNames = within(tree)
        .getAllByRole("button")
        .map((button) => button.textContent)
        .filter((name) =>
          ["Operations dashboard", "Orders by month", "Orders table"].includes(
            name ?? "",
          ),
        );

      expect(assetNames).toEqual([
        "Operations dashboard",
        "Orders by month",
        "Orders table",
      ]);
    });

    it("should use the card visualization icon for collection assets", async () => {
      const question = createMockCollectionItem({
        id: 789,
        model: "card",
        name: "Orders trend",
        display: "line",
        collection_id: TEST_COLLECTION.id,
      });

      await setup({
        pathname: Urls.collection(TEST_COLLECTION),
        route: "/collection/:slug",
        testCollectionItems: [question],
      });

      const questionButton = await screen.findByRole("button", {
        name: /Orders trend/i,
      });

      const questionIcon = within(questionButton).getByLabelText("line icon");

      expect(questionIcon).toBeInTheDocument();
      expect(questionIcon).toHaveStyle({
        color: "var(--mantine-color-accent5-text)",
      });
      expect(
        within(questionButton).queryByLabelText("bar icon"),
      ).not.toBeInTheDocument();
    });

    it("should preload collection assets before selecting a collection", async () => {
      const dashboard = createMockCollectionItem({
        id: 123,
        model: "dashboard",
        name: "Operations dashboard",
        collection_id: TEST_COLLECTION.id,
      });

      await setup({
        pathname: "/",
        route: "/",
        testCollectionItems: [dashboard],
      });

      expect(
        await screen.findByRole("button", { name: /Operations dashboard/i }),
      ).toBeInTheDocument();
    });

    it("should hide collections with ignored names", async () => {
      await setup({
        collections: [
          TEST_COLLECTION,
          createMockCollection({
            id: 3,
            name: "过程文件 archive",
          }),
          createMockCollection({
            id: 4,
            name: "下线 reports",
          }),
        ],
      });

      expect(
        screen.getByRole("treeitem", { name: /Test collection/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("treeitem", { name: /过程文件 archive/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("treeitem", { name: /下线 reports/i }),
      ).not.toBeInTheDocument();
    });

    it("should keep dashboards visible after navigating to another collection", async () => {
      const dashboard = createMockCollectionItem({
        id: 123,
        model: "dashboard",
        name: "Revenue dashboard",
        collection_id: TEST_COLLECTION.id,
      });

      await setup({
        pathname: Urls.collection(TEST_COLLECTION),
        route: "/collection/:slug",
        testCollectionItems: [dashboard],
      });

      expect(
        await screen.findByRole("button", { name: /Revenue dashboard/i }),
      ).toBeInTheDocument();

      await userEvent.click(
        screen.getByRole("button", { name: /Your personal collection/i }),
      );

      expect(
        await screen.findByRole("treeitem", {
          name: /Your personal collection/i,
        }),
      ).toHaveAttribute("aria-selected", "true");
      expect(
        screen.getByRole("button", { name: /Revenue dashboard/i }),
      ).toBeInTheDocument();
    });

    it("should collapse a selected collection with dashboards on the first click", async () => {
      const dashboard = createMockCollectionItem({
        id: 123,
        model: "dashboard",
        name: "Revenue dashboard",
        collection_id: TEST_COLLECTION.id,
      });

      await setup({
        pathname: "/dashboard/123",
        route: "/:entity/:slug",
        openDashboard: createMockDashboard({
          id: 123,
          name: "Revenue dashboard",
          collection_id: TEST_COLLECTION.id as number,
        }),
        testCollectionItems: [dashboard],
      });

      expect(
        await screen.findByRole("button", { name: /Revenue dashboard/i }),
      ).toBeInTheDocument();

      await userEvent.click(
        screen.getByRole("button", { name: /Test collection/i }),
      );

      expect(
        await screen.findByRole("treeitem", { name: /Test collection/i }),
      ).toHaveAttribute("aria-selected", "true");
      expect(
        screen.queryByRole("button", { name: /Revenue dashboard/i }),
      ).not.toBeInTheDocument();
    });

    it("should highlight personal collection if selected", async () => {
      const {
        rootCollectionElements,
        personalCollectionElements,
        regularCollectionElements,
      } = await setupCollectionPage({
        pathname: Urls.collection(PERSONAL_COLLECTION_BASE),
      });

      expect(personalCollectionElements.listItem).toHaveAttribute(
        "aria-selected",
        "true",
      );
      expect(rootCollectionElements.listItem).toHaveAttribute(
        "aria-selected",
        "false",
      );
      expect(regularCollectionElements.listItem).toHaveAttribute(
        "aria-selected",
        "false",
      );
    });

    it("should highlight question's collection if selected", async () => {
      const card = createMockCard({
        collection_id: TEST_COLLECTION.id as number,
      });
      await setup({
        openQuestionCard: card,
        route: "/question/:slug",
        pathname: `/question/${card.id}`,
      });

      expect(
        screen.getByRole("treeitem", { name: /Test collection/i }),
      ).toHaveAttribute("aria-selected", "true");
      expect(
        screen.getByRole("treeitem", { name: /Our analytics/i }),
      ).toHaveAttribute("aria-selected", "false");
    });

    it("should highlight dashboard's collection if selected", async () => {
      const dashboard = createMockDashboard({
        collection_id: TEST_COLLECTION.id as number,
      });
      await setup({
        openDashboard: dashboard,
        route: "/dashboard/:slug",
        pathname: `/dashboard/${dashboard.id}`,
      });

      expect(
        screen.getByRole("treeitem", { name: /Test collection/i }),
      ).toHaveAttribute("aria-selected", "true");
      expect(
        screen.getByRole("treeitem", { name: /Our analytics/i }),
      ).toHaveAttribute("aria-selected", "false");
    });

    it("should highlight model's collection when on model detail page", async () => {
      const model = createMockCard({
        collection_id: TEST_COLLECTION.id as number,
        type: "model",
      });
      await setup({
        route: "/model/:slug/detail",
        pathname: `/model/${model.id}/detail`,
        openQuestionCard: model,
      });

      expect(
        screen.getByRole("treeitem", { name: /Test collection/i }),
      ).toHaveAttribute("aria-selected", "true");
      expect(
        screen.getByRole("treeitem", { name: /Our analytics/i }),
      ).toHaveAttribute("aria-selected", "false");

      expect(
        screen.getByRole("button", { name: "Create a new collection" }),
      ).toBeInTheDocument();
    });

    it("should not display the new collection button if a user has no write permissions", async () => {
      await setup({
        user: createMockUser({ can_write_any_collection: false }),
      });

      expect(
        await screen.findByRole("treeitem", { name: /Our analytics/i }),
      ).toBeInTheDocument();

      expect(
        screen.queryByRole("button", { name: "Create a new collection" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("Personal Collections", () => {
    it("non-admin should see not other users personal collections", async () => {
      await setup({});

      expect(
        screen.queryByText(/Other users' personal collections/i),
      ).not.toBeInTheDocument();
    });

    it("admin should see other users personal collections if there other users", async () => {
      await setup({
        user: createMockUser({ is_superuser: true }),
      });
      expect(
        await screen.findByText(/Other users' personal collections/i),
      ).toBeInTheDocument();
    });

    it("admin not should see other users personal collections if there no other users", async () => {
      await setup({
        user: createMockUser({ is_superuser: true }),
        activeUsersCount: 1,
      });
      expect(
        screen.queryByText(/Other users' personal collections/i),
      ).not.toBeInTheDocument();
    });
  });
});
