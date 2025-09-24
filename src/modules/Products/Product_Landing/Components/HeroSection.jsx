import { Button, Skeleton } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getHeroImages } from "../../products.api";

export default function HeroSection() {
  const [imgs, setImgs] = useState([]);
  console.log(imgs);
  useEffect(() => {
    let mounted = true;
    getHeroImages().then((data) => {
      console.log(data)
      if (mounted) {
        const imageUrls = data
          .map((img) => img.imageUrl)
          .filter((url, index, self) => url && self.indexOf(url) === index); // remove duplicates
        setImgs(imageUrls);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const firstImage = imgs[0];
  const secondImage = imgs[1];

  return (
    <section className="section">
      <div className="container container--bleed hero">
        <div>
          <div className="heading-xxl">
            NEW
            <br />
            COLLECTION
          </div>
          <div className="v-stack" style={{ marginTop: 16 }}>
            <div className="subtle">Winter</div>
            <div className="subtle">2025</div>
          </div>
          <div className="h-stack" style={{ gap: 12, marginTop: 22 }}>
            <Link to="/products">
              <Button size="large">Go To Shop</Button>
            </Link>
            <div className="h-stack" style={{ gap: 8 }}>
              <Button shape="circle" icon={<LeftOutlined />} />
              <Button shape="circle" icon={<RightOutlined />} />
            </div>
          </div>
        </div>

        <div className="tile" style={{ aspectRatio: "1 / 1" }}>
          {firstImage ? (
            <img src={firstImage} alt="Look 1" />
          ) : (
            <Skeleton.Image active style={{ width: "100%", height: "100%" }} />
          )}
        </div>

        <div className="tile" style={{ aspectRatio: "1 / 1" }}>
          {secondImage ? (
            <img src={secondImage} alt="Look 2" />
          ) : (
            <Skeleton.Image active style={{ width: "100%", height: "100%" }} />
          )}
        </div>
      </div>
    </section>
  );
}