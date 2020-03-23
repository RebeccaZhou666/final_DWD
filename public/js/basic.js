// show current date in title section

document.getElementsByClassName("date");

let today_js= new Date();   
let weekday = today_js.getDay();
let month = today_js.getMonth();
let monthString, weekdayString;

switch (weekday){
    case 0: weekdayString = "Sunday"; break;
    case 1: weekdayString = "Monday"; break;
    case 2: weekdayString = "Tuesday"; break;
    case 3: weekdayString = "Wednesday"; break;
    case 4: weekdayString = "Thursday"; break;
    case 5: weekdayString = "Friday"; break;
    case 6: weekdayString = "Saturday"; break;
}

switch (month+1){
    case 1: monthString = "Jan"; break;
    case 2: monthString = "Feb"; break;
    case 3: monthString = "Mar"; break;
    case 4: monthString = "Apr"; break;
    case 5: monthString = "May"; break;
    case 6: monthString = "June"; break;
    case 7: monthString = "July"; break;
    case 8: monthString = "Aug"; break;
    case 9: monthString = "Sept"; break;
    case 10: monthString = "Oct"; break;
    case 11: monthString = "Nov"; break;
    case 12: monthString = "Dec"; break;
}


let today_date = today_js.getDate()+', '+monthString+', '+today_js.getFullYear()+" | "+ weekdayString;
let today_time = today_js.getFullYear()+'-'+(today_js.getMonth()+1)+'-'+today_js.getDate();
$(".date").text(today_date);

// let tomorrow_date = today_js.getDate()+1;
// let tomorrow = today_js.getFullYear()+'-'+(today_js.getMonth()+1)+'-'+ tomorrow_date;