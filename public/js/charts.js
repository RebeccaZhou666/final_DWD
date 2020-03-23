
let play = false;
window.onload = function(){
    getPeople();
    getCurrent();
    getChartData();
}


async function getCurrent(){ 
    const res = await fetch("/current");
    const data = await res.json();
    // console.log(data)
    today_data = data[0];
    $("#confirmed").text(data[0]);
    $("#recovered").text(data[1]);
    $("#death").text(data[2]);
  }

let current_data=[];
let date=[];
// let today_js = new Date;
let today_data;
let today = today_js.getFullYear()+'-'+(today_js.getMonth()+1)+'-'+today_js.getDate();



// ------------------- data visulization ------------------------
// line charts drawing

async function getChartData(){ 
    const res = await fetch("/getChartData");
    let current_data1 = await res.json();
    current_data1.forEach(element => {
        current_data.push(element.number);
        date.push(element.time);
    }); 

    date.push(today);
    // control orders to prevent blank array.
    buildCharts(current_data, date);
}

function buildCharts(data, date){ 
    // console.log(current_data1);
    console.log(today_data)
    console.log(date)
    let myChart = echarts.init(document.getElementById('figure-block'));

option = {
    title: {
        text: 'CoronaVirus Cases in US',
        subtext: 'data from 1point3acres.com',
        left: 'center',
        align: 'right'
    },
    grid: {
        bottom: 80
    },
    tooltip: {
        trigger: 'axis',
    },
    legend: {
        data: ['CoronaVirus Number', 'Today'],
        right: 10
    },
    dataZoom: [
        {
            show: true,
            realtime: true,
            start: 50,
            end: 100
        },
        {
            type: 'inside',
            realtime: true,
            start: 0,
            end: 100
        }
    ],
    xAxis: [
        {
            type: 'category',
            boundaryGap: false,
            axisLine: {onZero: false},
            data: date
        }
    ],
    yAxis: [
        {
            name: 'Cases',
            type: 'value',
        }
    ],
    series: [
        {
            name: 'Current CoronaVirus',
            type: 'line',
            animation: true,
            smooth:true,
            lineStyle: {
                width: 2
            },
            color: '#3722d3',
            data: data
        },
        {
            name: 'Today',
            type: 'scatter',
            // yAxisIndex: 1,
            animation: true,
            smooth:true,
            areaStyle: {},
            data: [[today,today_data]]
        }
    ]
    };
    myChart.setOption(option)
}

        