import { LightningElement } from "lwc";

export default class App extends LightningElement {
  title = "Welcome to Lightning Web Components!";

  showFeatures = true;

  /**
   * Getter for the features property
   */
  get features() {
    return [
      {
        label: "Learn in the browser.",
        icon: "utility:edit",
      },
      // {
      //   label: "View changes to code instantly with Live Compilation.",
      //   icon: "utility:refresh",
      // },
      // {
      //   label: "Style your components with SLDS.",
      //   icon: "utility:brush",
      // },
    ];
  }

  get loanProducts() {
    return [
      {
        id: "1",
        name: "Gold Loan",
        icon: "",
        interest: 15.00,
        processing: 5.00,
        admin: 2.00,
        risk: 2.00,
      },
    {
        id: "2",
        name: "Silver Loan",
        icon: "",
        interest: 18.00,
        processing: 5.00,
        admin: 2.00,
        risk: 3.00,
      },
      {
        id: "3",
        name: "Bronze Loan",
        icon: "",
        interest: 20.00,
        processing: 5.00,
        admin: 2.00,
        risk: 5.00,
      },
    ];
  }
}
