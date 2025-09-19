import React, { ReactElement } from "react";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import { useSearchParams } from "react-router-dom";
import { useCurrentGame } from "../hooks";
import { Game } from "../store/game-slice";
import Header from "./Header";
import Instructions from "./Instructions";
import AlertBanner from "./AlertBanner";
import Footer from "./Footer";
import SplitMaker from "./SplitMaker";

export default function App(): ReactElement {
  const currentGame = useCurrentGame();
  let selectedIndex = 0;
  if (currentGame === "silksong") {
    selectedIndex = 1;
  }

  const [searchParams, setSearchParams] = useSearchParams();

  const switchGame = (game: Game) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("game", game);
    newParams.delete("builtin");
    newParams.delete("config");
    setSearchParams(newParams, { replace: true });
  };

  const onTabSelect = (index: number) => {
    // Only set query param here. AppWrapper will map query param to Redux store
    if (index === 0) {
      switchGame("hollowknight");
    }
    if (index === 1) {
      switchGame("silksong");
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
