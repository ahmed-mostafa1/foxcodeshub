import * as React from "react";
import { Col, message } from "antd";
import ItemCard from "./ItemCard";
import { ItemContext } from "../../pages/ItemPage";
import { axiosFetchInstance, handleUnauthorized } from "../../Axios";

const SimilarItems = (props) => {
  const { item } = React.useContext(ItemContext);
  const [similars, setSimilars] = React.useState();
  React.useEffect(() => {
    axiosFetchInstance
      .get(`/items/sub_catigory=${item.sub_catigory}/`)
      .then((res) => {
        // console.log(res.data);
        setSimilars(res.data.slice(0, 13));
      })
      .catch((error) => {
        !error.response || error.response.status === 401
          ? handleUnauthorized(error)
          : message.error(error.response.data.error, 5);
      });
  }, [item]);
  return (
    <>
      {similars &&
        similars.map((item) => {
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

export default SimilarItems;
