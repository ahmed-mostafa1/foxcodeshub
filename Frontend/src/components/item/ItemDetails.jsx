import * as React from "react";
import { Image, Button, Card, message } from "antd";
import { ItemContext } from "../../pages/ItemPage";
import { UserContext } from "../../App";
import { axiosFetchInstance, handleUnauthorized } from "../../Axios";
const ItemDetails = (props) => {
  const { host, authedUser, setAuthedUser } = React.useContext(UserContext);
  const { item, setItem } = React.useContext(ItemContext);
  const [likeState, setLikeState] = React.useState();
  const [wishlistState, setWishlistState] = React.useState();
  const [ownerState, setOwnerState] = React.useState(false);
  React.useEffect(() => {
    const checkLike =
      item.likes && item.likes.find((like) => like.user === authedUser.id);
    const checkwish =
      authedUser.wishlist_items &&
      authedUser.wishlist_items.find((i) => i.id === item.id);
    if (item.seller.username === authedUser.username) {
      setOwnerState(true);
    } else {
      if (checkLike) setLikeState("unlike");
      else setLikeState("like");
      if (checkwish) setWishlistState("unwish");
      else setWishlistState("wish");
    }
  }, [authedUser, item]);

  const handleLike = (operation) => {
    axiosFetchInstance
      .get(`/handle-likes/${item.id}/${operation}/`)
      .then((res) => {
        message.success(res.data.success);
        likeState === "like" ? setLikeState("unlike") : setLikeState("like");
      })
      .catch((error) => {
        console.log(error.response);
        !error.response || error.response.status === 401
          ? handleUnauthorized(error)
          : message.error(error.response.data.error, 5);
      });
  };
  const handleWishlist = (operation) => {
    axiosFetchInstance
      .get(`/handle-wishlist/${item.id}/${operation}/`)
      .then((res) => {
        message.success(res.data.success);
        operation === "wish" &&
          setAuthedUser({
            ...authedUser,
            wishlist_items: [...authedUser.wishlist_items, item],
          });

        wishlistState === "wish"
          ? setWishlistState("unwish")
          : setWishlistState("wish");
      })
      .catch((error) => {
        handleUnauthorized(error);
      });
  };
  return (
    <>
      <div>
        <div style={{ position: "relative" }}>
          <Image
            width="100%"
            style={{ height: "57vh" }}
            src={`${host}${item.preview_img}`}
          />
          <div style={{ position: "absolute", bottom: "5%", right: "5%" }}>
            <Image preview={false} src={require("../../images/item.ico")} />
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            flexWrap: "wrap",
            backgroundColor: "#fff",
            border: "1px solid #f0f0f0",
            padding: "1rem 0",
          }}
        >
          <Button
            onClick={() => window.open(item.demo_url, "_blank")}
            style={{ margin: "0.25rem 0" }}
            type="primary"
          >
            Live Demo
          </Button>
          {ownerState ? (
            <Button disabled style={{ margin: "0.25rem 0" }} type="primary">
              Likes {item.likes.length}
            </Button>
          ) : (
            <>
              <Button
                style={{ margin: "0.25rem 0" }}
                onClick={
                  likeState === "like"
                    ? () => handleLike("like")
                    : () => handleLike("unlike")
                }
                type="primary"
              >
                {likeState === "like" ? "Like" : "Unlike"}
              </Button>

              <Button
                style={{ margin: "0.25rem 0" }}
                onClick={
                  wishlistState === "wish"
                    ? () => handleWishlist("add")
                    : () => handleWishlist("remove")
                }
                type="primary"
              >
                {wishlistState === "wish"
                  ? "Add to Wishlist"
                  : "Remove from Wishlist"}
              </Button>
            </>
          )}
        </div>
      </div>
      <div
        style={{ margin: "1rem 0" }}
        className="site-card-border-less-wrapper"
      >
        <Card title="Screen Shots" bordered={true} style={{ width: "100%" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              flexWrap: "wrap",
            }}
          >
            {item.screens.map((i, n) => {
              return <Image key={n} width={100} src={`${host}${i.image}`} />;
            })}
          </div>
        </Card>
      </div>
      <div
        style={{ margin: "1rem 0" }}
        className="site-card-border-less-wrapper"
      >
        <Card
          title="Item Describtion"
          bordered={true}
          style={{ width: "100%" }}
        >
          <p>{item.describtion}</p>
        </Card>
      </div>
      <div
        style={{ margin: "1rem 0" }}
        className="site-card-border-less-wrapper"
      >
        <Card title="Item Features" bordered={true} style={{ width: "100%" }}>
          <p>{item.featurs}</p>
        </Card>
      </div>
    </>
  );
};

export default ItemDetails;
