import * as React from "react";
import { Card, Tag, Image } from "antd";
import { Link } from "react-router-dom";
import { UserContext } from "../../App";
const { Meta } = Card;

const ItemCard = ({ item }) => {
  const { host } = React.useContext(UserContext);
  return (
    <div style={{ position: "relative" }}>
      <Link to={`/item?id=${item.id}`}>
        {host && (
          <Card
            hoverable
            cover={
              <img
                style={{ height: "150px" }}
                alt="example"
                src={`${host}${item.preview_img}`}
              />
            }
          >
            <Meta
              title={item.name}
              description={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                  }}
                >
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
              }
            />
          </Card>
        )}
      </Link>
      <div style={{ position: "absolute", top: "3%", right: "3%" }}>
        <Image preview={false} src={require("../../images/item_card.ico")} />
      </div>
    </div>
  );
};

export default ItemCard;
