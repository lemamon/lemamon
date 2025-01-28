import { useEffect } from "react";
import styled from "styled-components";
import { Layout, Tag, Typography, Alert, Table, Checkbox } from "antd";
import { useTranslation } from "react-i18next";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css";
import { useParams } from "react-router-dom";
import { posts } from "../../data";
import { PostContent } from "../../types";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const PostContainer = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin: 4rem 0;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const PostMeta = styled.div`
  font-size: 1rem;
  color: #666;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
`;

const PostTags = styled.div`
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;

  .tag {
    margin-right: 0.5rem;
  }
`;

const CheckList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  .ant-checkbox-wrapper + .ant-checkbox-wrapper {
    margin: 0;
  }
`;

const PostItem = ({ item }: { item: PostContent }) => {
  switch (item.type) {
    case "text":
      return <Paragraph>{item.content}</Paragraph>;
    case "code":
      return (
        <pre>
          <code className={`language-${item.language}`}>{item.content}</code>
        </pre>
      );
    case "image":
      return <img src={item.url} alt={item.alt} style={{ maxWidth: "100%" }} />;
    case "video":
      return (
        <video controls poster={item.poster} style={{ maxWidth: "100%" }}>
          <source src={item.url} type="video/mp4" />
        </video>
      );
    case "callout":
      return (
        <div className={`callout`}>
          <Title level={4}>{item.title}</Title>
          <Paragraph>{item.content}</Paragraph>
        </div>
      );
    case "table":
      const columns = item.headers.map((header) => ({
        title: header,
        dataIndex: header.toLowerCase(),
        key: header.toLowerCase(),
      }));
      const dataSource = item.rows.map((row, rowIndex) => {
        const rowData: { [key: string]: any } = {};
        row.forEach((cell, cellIndex) => {
          rowData[columns[cellIndex].key] = cell;
        });
        return { key: rowIndex, ...rowData };
      });
      return (
        <Table columns={columns} dataSource={dataSource} pagination={false} />
      );
    case "checklist":
      return (
        <div className="checklist">
          <Title level={4}>{item.title}</Title>
          <CheckList>
            {item.items.map((listItem, listIndex) => (
              <Checkbox key={listIndex} checked={listItem.checked}>
                {listItem.text}
              </Checkbox>
            ))}
          </CheckList>
        </div>
      );
    case "blockquote":
      return (
        <Alert
          message={item.content}
          description={
            item.author && `${item.author} ${item.role ? `- ${item.role}` : ""}`
          }
          type="info"
          showIcon
        />
      );
    case "figure":
      return (
        <figure>
          <img src={item.url} alt={item.alt} style={{ maxWidth: "100%" }} />
          <figcaption>{item.caption}</figcaption>
        </figure>
      );
    case "list":
      return (
        <ul>
          {item.items.map((itemText, listIndex) => (
            <li key={listIndex}>{itemText}</li>
          ))}
        </ul>
      );
    case "codepen":
      return (
        <div className="codepen-embed">
          <iframe
            title="codepen"
            src={item.url}
            style={{ width: "100%", border: "none" }}
          />
        </div>
      );
    default:
      return null;
  }
};

const Post = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();

  const post = posts.find((p) => p.id === parseInt(id, 10));

  useEffect(() => {
    Prism.highlightAll();
  }, [post]);

  if (!post) {
    return <div>{t("postNotFound")}</div>;
  }

  return (
    <Content>
      <PostContainer>
        <Title level={1}>{post.title}</Title>
        <PostMeta>
          {t("postContent.byAuthor", { author: post.author })} -{" "}
          {new Date(post.date).toLocaleDateString(t("locale"))}
        </PostMeta>
        <div>
          {post.content.map((item, index) => (
            <PostItem key={index} item={item} />
          ))}
        </div>
        <PostTags>
          {post.tags.map((tag, index) => (
            <Tag className="tag" key={index}>{`#${tag}`}</Tag>
          ))}
        </PostTags>
      </PostContainer>
    </Content>
  );
};

export default Post;
