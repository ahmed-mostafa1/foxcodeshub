import * as React from "react";
import { Col } from "antd";
import ItemCard from "../item/ItemCard";
const Products = ({ user }) => {
  return (
    <>
      {user.items.map((item) => {
        return (
          <Col
            key={item.id}
            xs={12}
            sm={6}
            lg={4}
            style={{ marginBottom: "1rem" }}
          >
            <ItemCard item={item} />
          </Col>
        );
      })}
    </>
  );
};

export default Products;
