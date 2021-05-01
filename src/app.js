import { LightningElement } from "lwc";

export default class App extends LightningElement {
  title = "Welcome to Lightning Web Components!";
  adminFee = 0.00;
  interest = 0.00;
  processingFee = 0.00;
  riskFee = 0.00;
  response = "";

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
        label: "Gold Loan",
        value: "Gold Loan",
        icon: "",
        interest: 15.00,
        processing: 5.00,
        admin: 2.00,
        risk: 2.00,
      },
    {
        id: "2",
        label: "Silver Loan",
        value: "Silver Loan",
        icon: "",
        interest: 18.00,
        processing: 5.00,
        admin: 2.00,
        risk: 3.00,
      },
      {
        id: "3",
        label: "Bronze Loan",
        value: "Bronze Loan",
        icon: "",
        interest: 20.00,
        processing: 5.00,
        admin: 2.00,
        risk: 5.00,
      },
    ];
  }

  onLoanProductSelected(event){
    //get loan product details
    console.log("logging = ", this.loanProducts.find(opt => opt.value === event.detail.value));
    let obj = this.loanProducts.find(opt => opt.value === event.detail.value);
    this.interest =obj.interest;
    this.adminFee = obj.admin;
    this.processingFee = obj.processing;
    this.riskFee = obj.risk;
  }
}
