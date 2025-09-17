import React, { ReactElement } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { RootState } from "../store";
import Header from "./Header";
import Instructions from "./Instructions";
import AlertBanner from "./AlertBanner";
import Footer from "./Footer";
import SplitMaker from "./SplitMaker";

export default function App(): ReactElement {
  const currentGame = useSelector(
    (reduxState: RootState) => reduxState.game.currentGame
  );

  let selectedIndex = 0;
  if (currentGame === "silksong") {
    selectedIndex = 1;
  }

  const [searchParams, setSearchParams] = useSearchParams();

  const onTabSelect = (index: number) => {
    // Only set query param here. AppWrapper will map query param to Redux store
    if (index === 0) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("game", "hollowknight");
      setSearchParams(newParams, { replace: true });
    }
    if (index === 1) {
      const newParams = new URLSearchParams(searchParams);
      newParams.set("game", "silksong");
      setSearchParams(newParams, { replace: true });
    }
  };

  return (
    <div id="app">
      <AlertBanner />
      <Tabs onSelect={onTabSelect} selectedIndex={selectedIndex}>
        <TabList>
          <Tab>Hollow Knight</Tab>
          <Tab>Silksong</Tab>
        </TabList>
        <TabPanel>
          <Header />
          <Instructions />
          <SplitMaker />
          <Footer />
        </TabPanel>
        <TabPanel>
          <Header />
          <Instructions />
          <SplitMaker />
          <Footer />
        </TabPanel>
      </Tabs>
    </div>
  );
}
