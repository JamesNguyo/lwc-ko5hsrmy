import { LightningElement, track } from "lwc";
// import { loadScript } from "lightning/platformResourceLoader";
// import moment from "@salesforce/resourceUrl/moment";

export default class App extends LightningElement {
  title = "Friendly Loan Company";
  @track principalAmount = 100000;
  adminFee = 0.00;
  @track interest = 0.00;
  processingFee = 0.00;
  riskFee = 0.00;
  response = "";
  expectedStartDate = new Date();
  expectedEndDate = new Date();
  loanDuration = 0;
  @track loanMonths = [{"key":String, "mths":[{}]}];
  sumInterest = 0.00;
  monthlyPayment = 0.00;
  totalRepayable = 0.00;
  showFeatures = true;
  monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  selectedMonths = "";
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
        interest: 3.00,
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

  getAdjPaymentDate(dtValue){
    var dt = new Date(dtValue);
    switch (dt.getDay()) {
      case 0:
        return new Date(dt.setDate(dt.getDate() + 1));
      case 6:
        return new Date(dt.setDate(dt.getDate() + 2));
      default:
        return dt;
    }
  }

  onPrincipalSelected(event){
    this.principalAmount = event.target.value;
    console.log('event.target.value', event.target.value);
  }
  onLoanProductSelected(event){
    //get loan product details
    //console.log("logging = ", this.loanProducts.find(opt => opt.value === event.detail.value));
    let obj = this.loanProducts.find(opt => opt.value === event.detail.value);
    this.interest =obj.interest;
    this.adminFee = obj.admin;
    this.processingFee = obj.processing;
    this.riskFee = obj.risk;
  }

    displayMonths(){
      this.loanMonths.length = 0;
      
      let monthlyIntRate = parseFloat((this.interest/100)/this.loanDuration);
      this.monthlyPayment = parseFloat(this.principalAmount * (monthlyIntRate/(1-Math.pow(1+monthlyIntRate, - this.loanDuration)))).toFixed(2);

      let yr=this.expectedStartDate.getFullYear();
      let i;
      let mthSelected = false;
      let expPaymentDate;
      let prevExpPaymentDate;
      let prevPrincipalBalance = this.principalAmount;
      while (yr <= this.expectedEndDate.getFullYear()) {
        let arrMth = [{}];
        
        arrMth.length=0;
        for (i = 0; i < 12; i++) {
          mthSelected = false;
          if((i>=this.expectedStartDate.getMonth() && yr == this.expectedStartDate.getFullYear()) || (i<=this.expectedEndDate.getMonth() && yr == this.expectedEndDate.getFullYear())){
              mthSelected = true;
          }
          expPaymentDate = new Date(yr.toString() + '/' + (i+1).toString().padStart(2,'0') + "/15");
          prevExpPaymentDate = i==0 ? expPaymentDate :arrMth[i-1]["adjPaymentDate"];
          arrMth.push(  
            {
              "key":yr.toString().concat ((i+1).toString().padStart(2,'0')),
              "month":this.monthNames[i], 
              "selected":mthSelected,
              "expPaymentDate": expPaymentDate,
              "adjPaymentDate": this.getAdjPaymentDate(expPaymentDate),
              "daysBetween": this.getDaysBetween( prevExpPaymentDate, this.getAdjPaymentDate(expPaymentDate)) ,
              "runningBalance":0,
              "monthlyPrincipal":this.monthlyPayment,
              "monthlyInterest":0,
              "plannedPayment":this.monthlyPayment,
            });
        }
        this.loanMonths.push({"key":yr, "mths":arrMth,});
        yr = yr+1;
      }
  }

  getDaysBetween(dtParamStart, dtParamEnd){
    let dtStart = new Date(dtParamStart);
    let dtEnd = new Date(dtParamEnd);
    //let dt = new Date(d.setMonth(d.getMonth() + 1));
    //console.log("ddd", dtStart.valueOf(), ' *** ', this.expectedStartDate.valueOf() );
    if(this.expectedStartDate.valueOf() > dtParamEnd.valueOf() || dtEnd.valueOf() > this.expectedEndDate.valueOf()){
      return 0;
    }
    else 
    {
      return ((dtEnd - dtStart)/(1000*60*60*24))
    }
    
  }

  amortiseSchedule() {
    let previousBal = this.principalAmount;
    let monthlyIntRate = parseFloat((this.interest/100)/this.loanDuration);
    let interestAmt = 0.00;
    this.monthlyPayment = parseFloat(this.principalAmount * (monthlyIntRate/(1-Math.pow(1+monthlyIntRate, - this.loanDuration)))).toFixed(2);
    this.totalRepayable = parseFloat(this.monthlyPayment * this.loanDuration).toFixed(2);
    this.sumInterest = parseFloat(this.totalRepayable - this.principalAmount).toFixed(2);
    this.selectedMonths = "";
    this.loanMonths.map((i) => 
    {
      this.sumInterest = 0.00;
      (i.mths.map((e)=> {
        // if(e.key === event.target.name){
        //   e.selected = event.target.checked;
        // }
        if(e.adjPaymentDate >= this.expectedStartDate && e.adjPaymentDate <= this.expectedEndDate){
          e.plannedPayment = e.plannedPayment?e.plannedPayment: parseFloat(this.monthlyPayment).toFixed(2);
          interestAmt = parseFloat(previousBal * monthlyIntRate);
          e.monthlyInterest = parseFloat(interestAmt).toFixed(2);
          e.monthlyPrincipal = parseFloat(e.plannedPayment - interestAmt).toFixed(2);
          previousBal = previousBal - e.monthlyPrincipal;
          this.sumInterest = parseFloat(this.sumInterest +  e.monthlyInterest ).toFixed(2)
        }
        })
      )
    })
  }

   onMonthSelected(event){
    console.log("checked = ", event.target.checked, '***', event.target.name);
    //console.log(this.loanMonths);
    //Monthly Payment Formula used = r = (1 + i)^(1/n) - 1

    //console.log("in here", previousBal);
    //this.selectedMonths = this.selectedMonths.concat( e.key.toString(),", ") ;
   }

   onPlannedAmountChanged(event){
    console.log("checked = ", event.target.value, '***', event.target.name);
    this.loanMonths.map((i) => 
    {
      (i.mths.map((e)=> {
        if(e.key === event.target.name){
          e.plannedPayment = event.target.value;
          console.log("hapa",e.plannedPayment);
          
        }
        })
      )
    })
    //this.displayMonths();
    this.amortiseSchedule();
    //this.displayMonths();
   }

  onLoanDateChanged(event){
    if (event.target.name === 'dtStart') {
      this.expectedStartDate = new Date(event.detail.value);
    }
    if (event.target.name === 'dtEnd') {
      this.expectedEndDate = new Date(event.detail.value);
    }
    this.loanDuration = this.expectedEndDate - this.expectedStartDate;
    //console.log(event.target.name);
    this.loanDuration = this.expectedEndDate.getMonth()+ (12*(this.expectedEndDate.getFullYear()-this.expectedStartDate.getFullYear())) - this.expectedStartDate.getMonth();

    this.displayMonths();
    this.amortiseSchedule();
    //console.log("this this.expectedStartDate = ",this.expectedStartDate.getMonth(), '***',this.expectedStartDate.getFullYear());
  }

 }
