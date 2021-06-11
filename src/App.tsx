import Footer from "./components/Footer";
import Header from "./components/Header";
import Switcher from "./components/Switcher";
import styled from "styled-components";
import { SelectProvider } from "./context";

const Main = styled.main`
  width: 100vw;
  max-width: 100vw;
  overflow: hidden;
  font-family: "Overpass", sans-serif;
  padding: 50px 0;
`;

function App() {
  return (
    <Main>
      <SelectProvider>
        <Header />
        <Switcher />
        <Footer />
      </SelectProvider>
    </Main>
  );
}

export default App;
