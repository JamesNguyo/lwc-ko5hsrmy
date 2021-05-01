import { LightningElement } from "lwc";
// import { loadScript } from "lightning/platformResourceLoader";
// import moment from "@salesforce/resourceUrl/moment";

export default class App extends LightningElement {
  title = "Friendly Loan Company";
  adminFee = 0.00;
  interest = 0.00;
  processingFee = 0.00;
  riskFee = 0.00;
  response = "";
  expectedStartDate = new Date();
  expectedEndDate = new Date();
  loanDuration = 0;
  loanMonths = [{"key":String, "mths":[{}]}];
  showFeatures = true;

  // momentInitialized = false;

  // renderedCallback() {
  //   if (this.momentInitialized) {
  //       return;
  //   }
  //   this.momentInitialized = true;
  //   loadScript(this, moment)
  //   .then(() => {
  //       console.log(window.moment().format());
  //   })
  //   .catch(error => {
  //       console.log(error);
  //   });
  // }
  
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

    displayMonths(){
    let arrO = [{}];//[{month:String, selected:Boolean }];
    this.loanMonths.length = 0;

    let  monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let yr=this.expectedStartDate.getFullYear();
    let i;
    let mthSelected = false;
    while (yr <= this.expectedEndDate.getFullYear()) {
      arrO.length=0;
      for (i = 0; i < 12; i++) {
        mthSelected = false;
        if((i==this.expectedStartDate.getMonth() && yr == this.expectedStartDate.getFullYear()) || (i==this.expectedEndDate.getMonth() && yr == this.expectedEndDate.getFullYear())){
            mthSelected = true;
        }
        arrO.push({"key":i,"month":monthNames[i], "selected":mthSelected});
      }
      this.loanMonths.push({"key":yr, "mths":arrO,});
      yr = yr+1;
    }
  }

  onLoanDateChanged(event){
    if (event.target.name === 'dtStart') {
      this.expectedStartDate = new Date(event.detail.value);
    }
    if (event.target.name === 'dtEnd') {
      this.expectedEndDate = new Date(event.detail.value);
    }
    this.loanDuration = this.expectedEndDate - this.expectedStartDate;
    console.log(event.target.name);
    this.loanDuration = this.expectedEndDate.getMonth()+ (12*(this.expectedEndDate.getFullYear()-this.expectedStartDate.getFullYear())) - this.expectedStartDate.getMonth();

    this.displayMonths();
    console.log("this this.expectedStartDate = ",this.expectedStartDate.getMonth(), '***',this.expectedStartDate.getFullYear());
    

  }

   
}
