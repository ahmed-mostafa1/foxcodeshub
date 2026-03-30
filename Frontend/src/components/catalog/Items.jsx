import * as React from "react";
import ItemCard from "../item/ItemCard";
import { Row, Col } from "antd";
import { ItemsContext } from "../../pages/Catalog";

const Items = (props) => {
  const { items } = React.useContext(ItemsContext);

  return (
    <Row gutter={[16, 16]}>
      {items.map((item) => {
        return (
          <Col key={item.id} xs={12} sm={6} style={{ marginBottom: "1rem" }}>
            <ItemCard item={item} />
          </Col>
        );
      })}
    </Row>
  );
};

export default Items;
