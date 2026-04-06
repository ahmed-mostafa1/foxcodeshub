import * as React from "react";
import { Carousel, Image, Button, Card, message } from "antd";
import { ItemContext } from "../../pages/ItemPage";
import { UserContext } from "../../App";
import { axiosFetchInstance, handleUnauthorized } from "../../Axios";
import AdBanner from "../common/AdBanner";

const ItemDetails = (props) => {
  const { host, authedUser, setAuthedUser } = React.useContext(UserContext);
  const { item, setItem } = React.useContext(ItemContext);
  const [likeState, setLikeState] = React.useState();
  const [wishlistState, setWishlistState] = React.useState();
  const [ownerState, setOwnerState] = React.useState(false);
  const carouselRef = React.useRef();

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

  // Build gallery slides: YouTube first (if exists), then screenshot images
  const gallerySlides = [];
  if (item.youtube_url) {
    const videoId = item.youtube_url.includes("watch?v=")
      ? new URL(item.youtube_url).searchParams.get("v")
      : item.youtube_url.split("/").pop();
    gallerySlides.push({ type: "youtube", videoId });
  }
  item.screens && item.screens.forEach((s) => {
    gallerySlides.push({ type: "image", src: `${host}${s.image}` });
  });

  return (
    <>
      {/* ── Gallery Carousel ── */}
      <div style={{ background: "#000", borderRadius: "8px", overflow: "hidden" }}>
        {gallerySlides.length > 0 ? (
          <Carousel ref={carouselRef} autoplay={false} dots={{ className: "gallery-dots" }}>
            {gallerySlides.map((slide, idx) => (
              <div key={idx}>
                {slide.type === "youtube" ? (
                  <div style={{ position: "relative", paddingTop: "56.25%" }}>
                    <iframe
                      title="Product demo video"
                      src={`https://www.youtube.com/embed/${slide.videoId}`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                      }}
                    />
                  </div>
                ) : (
                  <Image
                    src={slide.src}
                    preview={true}
                    style={{ width: "100%", maxHeight: "57vh", objectFit: "cover" }}
                  />
                )}
              </div>
            ))}
          </Carousel>
        ) : (
          <Image
            width="100%"
            style={{ height: "57vh", objectFit: "cover" }}
            src={`${host}${item.preview_img}`}
          />
        )}
      </div>

      {/* ── Action buttons ── */}
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

      {/* ── Description ── */}
      <div style={{ margin: "1rem 0" }} className="site-card-border-less-wrapper">
        <Card title="Item Description" bordered={true} style={{ width: "100%" }}>
          <p>{item.describtion}</p>
        </Card>
      </div>

      {/* ── Mid-page AdSense ── */}
      <AdBanner location="product_page_mid" />

      {/* ── Features ── */}
      <div style={{ margin: "1rem 0" }} className="site-card-border-less-wrapper">
        <Card title="Item Features" bordered={true} style={{ width: "100%" }}>
          <p>{item.featurs}</p>
        </Card>
      </div>
    </>
  );
};

export default ItemDetails;
