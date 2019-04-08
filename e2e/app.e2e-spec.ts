import { BattleTrackerPage } from "./app.po";

describe("battle-tracker App", function() {
  let page: BattleTrackerPage;

  beforeEach(() => {
    page = new BattleTrackerPage();
  });

  it("should display message saying app works", () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual("app works!");
  });
});
