import { LightningElement, track } from "lwc";
// import { loadScript } from "lightning/platformResourceLoader";
// import moment from "@salesforce/resourceUrl/moment";

export default class App extends LightningElement {
  title = "Friendly Loan Company";
  @track principalAmount = 100000;
  adminFeeRate = 0.00;
  @track interestRate = 0.00;
  processingFeeRate = 0.00;
  riskFeeRate = 0.00;

  adminFeeRatePreset = 0.00;
  interestRatePreset = 0.00;
  processingFeeRatePreset = 0.00;
  riskFeeRatePreset = 0.00;

  adminFeeRateComputed = 0.00;  
  interestRateComputed = 0.00;
  processingFeeRateComputed = 0.00;
  riskFeeRateComputed = 0.00;

  response = "";
  expectedStartDate = new Date();
  expectedEndDate = new Date();
  loanDuration = 0;
  @track loanMonthsSchedule = [{"key":String, "mths":[{}]}];
  sumInterest = 0.00;
  sumFees = 0.00;
  sumFeesMonthly = 0.00
  monthlyPayment = 0.00;
  totalRepayable = 0.00;
  showFeatures = true;
  monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  recalculatedDuration = 0;
  earlyPayments = 0.00;
  recalculatedEndDate = new Date();

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
    this.calculateFees();
  }

  onPresetRateChanged(event){
    console.log("event.target.name",event.target.name);
    switch (event.target.name){
      case "adminFeeRate"  :
        this.adminFeeRate = event.target.value;
        break;
      case "interestRate" :
        this.interestRate = event.target.value;
        break;
      case "processingFeeRate"  :
        this.processingFeeRate = event.target.value;
        break;
      case "riskFeeRate"  :
        this.riskFeeRate = event.target.value;
        break;
    }
    this.calculateFees();
  }

  onLoanProductSelected(event){
    //get loan product details
    //console.log("logging = ", this.loanProducts.find(opt => opt.value === event.detail.value));
    let obj = this.loanProducts.find(opt => opt.value === event.detail.value);
    this.interestRatePreset =obj.interest;
    this.adminFeeRatePreset = obj.admin;
    this.processingFeeRatePreset = obj.processing;
    this.riskFeeRatePreset = obj.risk;
  
    this.interestRate =obj.interest;
    this.adminFeeRate = obj.admin;
    this.processingFeeRate = obj.processing;
    this.riskFeeRate = obj.risk;
    
  }

    displayMonths(){
      this.loanMonthsSchedule.length = 0;
      
      //let monthlyIntRate = parseFloat((/100)/this.loanDuration);
      this.monthlyPayment = this.calculateMonthlyPayment(this.principalAmount, this.interestRate, this.loanDuration);
      
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
              "plannedPayment": this.monthlyPayment,
              "monthlyFees" : 0.00,
              "totalPaymentInclFees": 0.00,
            });
        }
        this.loanMonthsSchedule.push({"key":yr, "mths":arrMth,});
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
      return ((dtEnd - dtStart)/(1000*60*60*24));
    }
    
  }

  calculateMonthlyPayment(principalAmt, intRate, loanMths ){
    let mthIntRate = parseFloat((intRate/100)/loanMths);
    return parseFloat(principalAmt * parseFloat((mthIntRate/(1-Math.pow(1+mthIntRate, - loanMths))))).toFixed(2);
    //parseFloat(this.principalAmount * (monthlyIntRate/(1-Math.pow(1+monthlyIntRate, - this.loanDuration)))).toFixed(2);
  }

  amortiseSchedule() {
    this.calculateFees();
    let previousBal = this.principalAmount;
    let monthlyIntRate = parseFloat((this.interestRate/100)/this.loanDuration);
    let interestAmt = 0.00;
    this.monthlyPayment = parseFloat(this.principalAmount * (monthlyIntRate/(1-Math.pow(1+monthlyIntRate, - this.loanDuration)))).toFixed(2);
    //this.monthlyPayment = parseFloat(this.monthlyPayment) + parseFloat(this.sumFeesMonthly);
    //this.monthlyPayment = parseFloat(this.calculateMonthlyPayment(this.principalAmount, monthlyIntRate, this.loanDuration)).toFixed(2);
    
    this.totalRepayable = parseFloat(this.monthlyPayment * this.loanDuration).toFixed(2);
    //this.sumInterest = parseFloat(this.totalRepayable - this.principalAmount).toFixed(2);
    this.recalculatedDuration = 0;
    this.sumInterest = 0.00;
    
    this.loanMonthsSchedule.map((i) => 
    {
      (i.mths.map((e)=> {
        e.selected = false;
        if(e.adjPaymentDate >= this.expectedStartDate ){
          e.runningBalance = previousBal >= 0 ? parseFloat(previousBal).toFixed(2) :0;
          if(e.runningBalance > 0){
            e.monthlyPayment = parseFloat(this.monthlyPayment).toFixed(2);
            e.monthlyFees = parseFloat((this.sumFees)/this.loanDuration).toFixed(2) ;
            e.plannedPayment = parseFloat(e.plannedPayment);// + parseFloat(e.monthlyFees);
            //parseFloat(this.monthlyPayment).toFixed(2);
            //e.plannedPayment = e.plannedPayment?e.plannedPayment: parseFloat(this.monthlyPayment).toFixed(2)
            interestAmt = parseFloat(previousBal * monthlyIntRate);
            e.monthlyInterest = parseFloat(interestAmt).toFixed(2);
            e.monthlyPrincipal = parseFloat(e.plannedPayment - interestAmt).toFixed(2);
            previousBal = previousBal - e.monthlyPrincipal;
            this.sumInterest = parseFloat(parseFloat(this.sumInterest) + parseFloat(e.monthlyInterest)).toFixed(2) ;
            e.totalPaymentInclFees = e.plannedPayment > 0 ? parseFloat(parseFloat(e.plannedPayment) + parseFloat(e.monthlyFees)).toFixed(2):0.00;
            this.recalculatedDuration = this.recalculatedDuration +  e.plannedPayment > 0 ?1:0;
            e.selected = e.plannedPayment > 0 ? true : false;
          }
          else 
          {
            e.plannedPayment = 0.00;
            e.monthlyInterest = 0.00;
            e.monthlyPrincipal = 0.00;
            e.monthlyPayment = 0.00;
            e.totalPaymentInclFees = 0.00;
          }
        }
        else 
          {
            e.plannedPayment = 0.00;
            e.monthlyInterest = 0.00;
            e.monthlyPrincipal = 0.00;
            e.monthlyPayment = 0.00;
            e.totalPaymentInclFees = 0.00;
          }
        })
      )
    })
  }

   onMonthSelected(event){
    
   }

   onPlannedAmountChanged(event){
    this.loanMonthsSchedule.map((i) => 
    {
      (i.mths.map((e)=> {
        
        if(e.key === event.target.name){
          e.selected = event.target.value > 0 ? true : false;
          e.plannedPayment = event.target.value;        
        }
        })
      )
    })
    this.amortiseSchedule();
   }

  onLoanDateChanged(event){
    if (event.target.name === 'dtStart') {
      this.expectedStartDate = new Date(event.detail.value);
    }
    if (event.target.name === 'dtEnd') {
      this.expectedEndDate = new Date(event.detail.value);
    }
    this.loanDuration = this.expectedEndDate - this.expectedStartDate;
    this.loanDuration = this.expectedEndDate.getMonth()+ (12*(this.expectedEndDate.getFullYear()-this.expectedStartDate.getFullYear())) - this.expectedStartDate.getMonth();
    
    this.calculateFees();
    
    this.displayMonths();
    this.amortiseSchedule();
    //console.log("this this.expectedStartDate = ",this.expectedStartDate.getMonth(), '***',this.expectedStartDate.getFullYear());
  }

  calculateFees(){
    this.processingFeeRateComputed = parseFloat(this.processingFeeRate)/100 * parseFloat(this.principalAmount);
    this.adminFeeRateComputed = ((parseFloat(this.adminFeeRate)/100)* parseFloat(this.principalAmount));
    this.riskFeeRateComputed = ((parseFloat(this.riskFeeRate)/100)* parseFloat(this.principalAmount));
    this.interestRateComputed = this.calculateMonthlyPayment(this.principalAmount, this.interestRate, this.loanDuration) * this.loanDuration - this.principalAmount; 
    this.sumFees = parseFloat(this.processingFeeRateComputed + this.adminFeeRateComputed + this.riskFeeRateComputed).toFixed(2);
    this.sumFeesMonthly = parseFloat(this.sumFees/this.loanDuration).toFixed(2);
  }

 }
