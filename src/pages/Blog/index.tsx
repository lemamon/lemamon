import { lazy } from "react";
import { useTranslation } from "react-i18next";
import Container from "../../common/Container";
import ScrollToTop from "../../common/ScrollToTop";
import { Layout } from "antd";
import styled from "styled-components";
import { posts } from "../../data";
import { Slide } from "react-awesome-reveal";
import { useHistory } from "react-router-dom";

const MiddleBlock = lazy(() => import("../../components/MiddleBlock"));

const { Content } = Layout;

const PostsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-top: 2rem;
  max-width: 800px;
  margin: 2rem auto 0;
`;

const PostCard = styled.div`
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
  }
`;

const PostHeader = styled.header`
  padding: 1.5rem;
`;

const PostTitle = styled.h2`
  font-size: 1.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
`;

const PostExcerpt = styled.p`
  font-size: 0.9rem;
  color: #666;
`;

const LayoutStyled = styled.div`
  background: #f9f9f9;
  padding: 2rem;
  margin: 2rem 0;
`;

const BlogContent = () => {
  const history = useHistory();

  const handlePostClick = (id: number) => {
    history.push(`/post/${id}`);
  };

  return (
    <Slide direction="up" triggerOnce>
      <LayoutStyled id="content">
        <Content style={{ padding: "0 50px" }}>
          <div className="container">
            <PostsContainer>
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  onClick={() => handlePostClick(post.id)}
                >
                  <PostHeader>
                    <PostTitle>{post.title}</PostTitle>
                    <PostExcerpt>{post.excerpt}</PostExcerpt>
                  </PostHeader>
                </PostCard>
              ))}
            </PostsContainer>
          </div>
        </Content>
      </LayoutStyled>
    </Slide>
  );
};

const Blog = () => {
  const { t } = useTranslation();

  return (
    <Container>
      <ScrollToTop />
      <MiddleBlock
        title="blogContent.title"
        content="blogContent.text"
        button={t("blogContent.button")}
        goToPath="content"
      />
      <BlogContent />
    </Container>
  );
};

export default Blog;
