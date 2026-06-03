import { Card } from "@mantine/core";

import CardStyles from "./Card.module.css";

export const cardOverrides = {
  Card: Card.extend({
    classNames: {
      root: CardStyles.root,
      section: CardStyles.section,
    },
  }),
};
