import * as React from "react";
import { Card, Typography, Avatar } from "antd";
import { ItemContext } from "../../pages/ItemPage";
import { UserContext } from "../../App";
const { Title } = Typography;
const { Meta } = Card;

const ItemHeader = (props) => {
  const [loading, setLoading] = React.useState(false);
  const { host } = React.useContext(UserContext);
  const { item } = React.useContext(ItemContext);

  return (
    <div>
      <Card style={{ width: "100%" }} loading={loading}>
        <Meta
          avatar={<Avatar shape="square" size={96} src={`${item.icon_img}`} />}
          title={<Title level={2}>{item.name}</Title>}
          description={item.short_describtion}
          className="card"
        />
      </Card>
    </div>
  );
};

export default ItemHeader;
