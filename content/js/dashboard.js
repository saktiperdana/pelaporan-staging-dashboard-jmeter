/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7683333333333333, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.425, 500, 1500, "api/areas/hospital"], "isController": false}, {"data": [0.895, 500, 1500, "api/dashboard/v2/summary-case"], "isController": false}, {"data": [0.885, 500, 1500, "api/areas/village/32.17.09.2004"], "isController": false}, {"data": [0.875, 500, 1500, "api/areas/district-city"], "isController": false}, {"data": [0.88, 500, 1500, "api/case-related/32.17"], "isController": false}, {"data": [0.88, 500, 1500, "api/dashboard/v2/summary-case-criteria"], "isController": false}, {"data": [0.905, 500, 1500, "api/reports/daily-report"], "isController": false}, {"data": [0.85, 500, 1500, "api/country"], "isController": false}, {"data": [0.4, 500, 1500, "api/map?kode_kab=32.17"], "isController": false}, {"data": [0.875, 500, 1500, "api/areas/sub-district/32.17.09"], "isController": false}, {"data": [0.44, 500, 1500, "api/login"], "isController": false}, {"data": [0.91, 500, 1500, "api/dashboard/v2/visualization-case"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1200, 0, 0.0, 694.0166666666669, 361, 10109, 438.0, 1217.8000000000002, 1415.1000000000008, 2426.55, 10.917924502552065, 717.8342821834257, 7.298163400387586], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["api/areas/hospital", 100, 0, 0.0, 1271.83, 795, 10109, 1098.5, 1875.0000000000005, 2206.9, 10032.17999999996, 1.0017932098456237, 180.09084894774145, 0.6701448718205588], "isController": false}, {"data": ["api/dashboard/v2/summary-case", 100, 0, 0.0, 513.0, 370, 1398, 427.5, 791.8, 1025.7999999999988, 1397.4899999999998, 1.0015423752578974, 12.23759589768243, 0.6670428710213729], "isController": false}, {"data": ["api/areas/village/32.17.09.2004", 100, 0, 0.0, 503.29000000000013, 366, 1167, 411.5, 798.6, 920.7999999999988, 1166.2999999999997, 1.0066945185483465, 1.0398053304474757, 0.6724404791865909], "isController": false}, {"data": ["api/areas/district-city", 100, 0, 0.0, 512.92, 365, 2307, 418.5, 775.7, 814.7999999999997, 2298.6099999999956, 1.0042076299695724, 2.3506892316305317, 0.6629339432221005], "isController": false}, {"data": ["api/case-related/32.17", 100, 0, 0.0, 503.5900000000001, 363, 1178, 415.5, 794.6000000000001, 899.049999999999, 1177.0399999999995, 1.0063095609471384, 1.0397025286043493, 0.663338821913397], "isController": false}, {"data": ["api/dashboard/v2/summary-case-criteria", 100, 0, 0.0, 518.3900000000001, 361, 2569, 413.0, 785.7, 884.2499999999998, 2558.639999999995, 1.0056922179536174, 3.732355601454231, 0.6756994589375868], "isController": false}, {"data": ["api/reports/daily-report", 100, 0, 0.0, 497.26, 365, 1371, 413.0, 811.7, 1068.8999999999996, 1369.239999999999, 0.998362685196278, 3.0036482356435443, 0.6600503299588675], "isController": false}, {"data": ["api/country", 100, 0, 0.0, 525.0099999999999, 366, 2630, 405.5, 779.4000000000001, 828.1999999999998, 2619.3699999999944, 1.0063399416322834, 9.380965315864948, 0.6525485559021837], "isController": false}, {"data": ["api/map?kode_kab=32.17", 100, 0, 0.0, 1391.48, 922, 4765, 1183.5, 1880.6, 3336.7499999999886, 4760.589999999997, 0.9913455533195207, 564.9891195953079, 0.6679965154203801], "isController": false}, {"data": ["api/areas/sub-district/32.17.09", 100, 0, 0.0, 505.5299999999999, 364, 1180, 411.5, 802.1000000000001, 864.1999999999996, 1178.7399999999993, 1.0025163159530421, 1.0354505433638432, 0.6696495704217587], "isController": false}, {"data": ["api/login", 100, 0, 0.0, 1114.5599999999997, 814, 3002, 915.5, 1716.9000000000003, 2225.449999999998, 3001.3399999999997, 0.9945103031267404, 1.8667269174158643, 0.7002362583538865], "isController": false}, {"data": ["api/dashboard/v2/visualization-case", 100, 0, 0.0, 471.33999999999986, 363, 1586, 408.5, 751.4000000000001, 828.3499999999999, 1581.7199999999978, 1.0057832537088258, 3.7331256286145336, 0.6757606235856173], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1200, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
