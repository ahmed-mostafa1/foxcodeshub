import * as React from "react";
import ItemCard from "../item/ItemCard";
import { Row, Col } from "antd";
import { ItemsContext } from "../../pages/Catalog";
import AdBanner from "../common/AdBanner";

const AD_INTERVAL = 6; // Insert ad after every N items

const Items = (props) => {
  const { items } = React.useContext(ItemsContext);

  const rows = [];
  items.forEach((item, idx) => {
    rows.push(
      <Col key={item.id} xs={12} sm={6} style={{ marginBottom: "1rem" }}>
        <ItemCard item={item} />
      </Col>
    );
    // After every AD_INTERVAL items, inject a full-width ad slot
    if ((idx + 1) % AD_INTERVAL === 0 && idx + 1 < items.length) {
      rows.push(
        <Col key={`ad-${idx}`} span={24}>
          <AdBanner location="between_products" />
        </Col>
      );
    }
  });

  return <Row gutter={[16, 16]}>{rows}</Row>;
};

export default Items;
