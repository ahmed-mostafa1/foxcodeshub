import * as React from "react";
import { Button, Card, Tag, Image } from "antd";
import { Link } from "react-router-dom";
import { UserContext } from "../../App";
const { Meta } = Card;

const ItemCard = ({ item }) => {
  const { host } = React.useContext(UserContext);
  const itemPath = `/item?id=${item.id}`;

  return (
    <div style={{ position: "relative" }}>
      {host && (
        <Card
          hoverable
          cover={
            <Link to={itemPath}>
              <img
                style={{ height: "150px" }}
                alt="example"
                src={`${host}${item.preview_img}`}
              />
            </Link>
          }
        >
          <Meta
            title={<Link to={itemPath}>{item.name}</Link>}
            description={
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "0.5rem",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap" }}>
                  {item.discount_price ? (
                    <>
                      <Tag style={{ height: "fit-content" }} color="success">
                        ${item.discount_price}
                      </Tag>
                      <Tag style={{ height: "fit-content" }} color="orange">
                        old ${item.price}
                      </Tag>
                    </>
                  ) : (
                    <Tag style={{ height: "fit-content" }} color="orange">
                      ${item.price}
                    </Tag>
                  )}
                </div>
                <Link to={itemPath}>
                  <Button size="small" type="primary">
                    Buy Now
                  </Button>
                </Link>
              </div>
            }
          />
        </Card>
      )}
      <div style={{ position: "absolute", top: "3%", right: "3%" }}>
        <Image preview={false} src={require("../../images/item_card.ico")} />
      </div>
    </div>
  );
};

export default ItemCard;
