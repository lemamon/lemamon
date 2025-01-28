const routes = [
  {
    path: ["/", "/lemamon", "/home"],
    exact: true,
    component: "Home",
  },
  {
    path: ["/projects"],
    exact: true,
    component: "Projects",
  },
  {
    path: ["/blog"],
    exact: true,
    component: "Blog",
  },
  {
    path: ["/post/:id"],
    exact: true,
    component: "Post",
  },
];

export default routes;
