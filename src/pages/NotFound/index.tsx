import { Layout, Result } from "antd";
import { Button } from "../../common/Button";
import { useHistory } from "react-router-dom";

const { Content } = Layout;

const NotFound = () => {
  const navigate = useHistory();
  return (
    <Content>
      <Result
        status="500"
        title="404"
        subTitle="Sorry, the page you visited does not exist."
        extra={<Button onClick={() => navigate.push("/")}>Back Home</Button>}
      />
    </Content>
  );
};

export default NotFound;
