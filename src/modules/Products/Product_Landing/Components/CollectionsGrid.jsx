import { useEffect, useRef, useState } from "react";
import { PlusOutlined, LeftOutlined, RightOutlined } from "@ant-design/icons";
import { Skeleton, Button } from "antd";
import { Link } from "react-router-dom";
import { getCollections } from "../../products.api";

const tabs = ["Men", "Women", "Kid"];

export default function CollectionsGrid() {
  const [active, setActive] = useState("Women");
  const [items, setItems] = useState(null);
  const scrollerRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const categoryMap = {
      //All: [1, 39, 86],
      Men: [1],
      Women: [39],
      Kid: [86],
    };

    getCollections(categoryMap[active]).then((data) => {
      if (mounted) setItems(data);
    });

    return () => {
      mounted = false;
    };
  }, [active]); 

  const scroll = (dir) => {
    const node = scrollerRef.current;
    if (!node) return;
    node.scrollBy({
      left: (dir === "left" ? -1 : 1) * 3 * 284,
      behavior: "smooth",
    });
  };

  return (
    <section className="section">
      <div className="container">
        <div
          className="h-stack"
          style={{ justifyContent: "space-between", marginBottom: 16 }}
        >
          <div className="heading-xl">COLUMBIA COLLECTIONS 2025</div>
          <div className="h-stack" style={{ gap: 8 }}>
            <Link className="subtle" style={{ marginRight: 16 }} to="/products">
              See All
            </Link>
            <Button
              shape="circle"
              aria-label="Scroll left"
              onClick={() => scroll("left")}
              icon={<LeftOutlined />}
            />
            <Button
              shape="circle"
              aria-label="Scroll right"
              onClick={() => scroll("right")}
              icon={<RightOutlined />}
            />
          </div>
        </div>

        <div className="h-stack" style={{ gap: 8, marginBottom: 20 }}>
          {tabs.map((t) => (
            <button
              key={t}
              className={`pill ${active === t ? "active" : ""}`}
              onClick={() => setActive(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="scroller-wrap">
          <div className="scroller" ref={scrollerRef}>
            {(items ?? Array.from({ length: 6 })).map((c, idx) => (
              <div
                key={c?.imageUrl ?? idx}
                className="v-stack"
                style={{ gap: 10, flex: "0 0 284px" }}
              >
                <div
                  className="tile"
                  style={{ height: 300, position: "relative" }}
                >
                  {c ? (
                    <img
                      src={c.imageUrl}
                      alt={c.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <Skeleton.Image
                      active
                      style={{ width: "100%", height: "100%" }}
                    />
                  )}
                  <div className="plus">
                    <PlusOutlined />
                  </div>
                </div>
                <div className="subtle" style={{ fontSize: 12 }}>
                  {c?.meta ?? " "}
                </div>
                <div style={{ fontWeight: 600 }}>{c?.name ?? " "}</div>
                <div className="subtle" style={{ fontWeight: 600 }}>
                  {c ? `$ ${c.price}` : " "}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
