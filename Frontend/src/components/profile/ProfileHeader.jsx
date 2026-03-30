import * as React from "react";
import { Col, Card, Avatar, Typography } from "antd";
import { UserContext } from "../../App";
const { Meta } = Card;
const { Title } = Typography;

const ProfileHeader = ({ user }) => {
  const { host } = React.useContext(UserContext);
  return (
    <>
      <Col xs={24} sm={16}>
        <Card style={{ width: "100%" }}>
          <Meta
            avatar={
              <Avatar shape="circle" size={96} src={`${user.profile_pic}`} />
            }
            title={<Title level={2}>{user.username}</Title>}
            description={user.devtype}
            className="card"
          />
        </Card>
      </Col>
      <Col xs={24} sm={8}>
        <Card bordered={true} style={{ width: "100%" }}>
          <Title level={5}>
            Member since: {user.join_date.substring(0, 10)}
          </Title>
          <Title level={5}>
            Expert in: {user.frameworks.map((f) => f.name).join(" ")}
            {", "}
            {user.operation_systems.map((o) => o.name).join(" ")}
          </Title>
          <Title level={5}>Developing experience: {user.dev_exp}</Title>
        </Card>
      </Col>
    </>
  );
};

export default ProfileHeader;
