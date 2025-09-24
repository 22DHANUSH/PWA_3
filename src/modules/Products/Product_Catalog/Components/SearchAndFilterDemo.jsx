import { Row, Col } from "antd";
import SearchBar from "./SearchBar";
import ProductFilter from "./ProductFilter";
import ProductsPage from "../../../Products/Product_Catalog/Pages/ProductsPage";

function SearchAndFilterDemo() {
  return (
    <Row gutter={16} style={{ padding: 24 }}>
      <Col span={6}>
        <ProductFilter />
      </Col>
      <Col span={18}>
        <SearchBar />
        <ProductsPage />
      </Col>
    </Row>
  );
}

export default SearchAndFilterDemo;