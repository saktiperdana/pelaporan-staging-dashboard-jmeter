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

    var data = {"OkPercent": 99.9, "KoPercent": 0.1};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.610909090909091, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.485, 500, 1500, "api/areas/hospital"], "isController": false}, {"data": [0.815, 500, 1500, "api/areas/district-city"], "isController": false}, {"data": [0.86, 500, 1500, "api/occupations"], "isController": false}, {"data": [0.87, 500, 1500, "api/country"], "isController": false}, {"data": [0.895, 500, 1500, "api/cases-summary"], "isController": false}, {"data": [0.465, 500, 1500, "api/map?kode_kab=32.17"], "isController": false}, {"data": [0.795, 500, 1500, "api/areas/sub-district/32.17"], "isController": false}, {"data": [0.22, 500, 1500, "api/cases"], "isController": false}, {"data": [0.835, 500, 1500, "api/users/info"], "isController": false}, {"data": [0.0, 500, 1500, "LOAD TEST ENDPOINT STAGING"], "isController": true}, {"data": [0.48, 500, 1500, "api/login"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1000, 1, 0.1, 788.0750000000003, 203, 3082, 616.5, 1463.3999999999999, 1744.0, 2346.100000000001, 9.397701322256575, 912.7842841359753, 6.516902059506244], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["api/areas/hospital", 100, 0, 0.0, 1031.66, 457, 1962, 957.5, 1497.6000000000001, 1722.3499999999997, 1960.309999999999, 1.0028883183568678, 176.0857891822198, 0.6708774395258343], "isController": false}, {"data": ["api/areas/district-city", 100, 0, 0.0, 546.55, 217, 1847, 449.5, 854.8, 921.8999999999995, 1844.7399999999989, 1.0082474642576273, 2.359948913361295, 0.6656008650763243], "isController": false}, {"data": ["api/occupations", 100, 0, 0.0, 510.1, 203, 1006, 453.5, 842.2, 878.8, 1005.3099999999996, 1.005580974407964, 2.3428072678364926, 0.6559844637739455], "isController": false}, {"data": ["api/country", 100, 0, 0.0, 487.15000000000003, 212, 1392, 425.0, 823.5, 876.4499999999996, 1388.149999999998, 1.0057225613742193, 9.375956615014433, 0.6521482233910953], "isController": false}, {"data": ["api/cases-summary", 100, 0, 0.0, 464.96999999999997, 208, 905, 432.0, 802.4000000000001, 829.8, 904.7099999999998, 1.0047322890815742, 1.0980624993720423, 0.7731728943323052], "isController": false}, {"data": ["api/map?kode_kab=32.17", 100, 0, 0.0, 1124.8900000000006, 469, 2849, 1119.0, 1670.7000000000003, 2087.4999999999986, 2847.029999999999, 0.9938283260949503, 566.4059879554219, 0.669669477544449], "isController": false}, {"data": ["api/areas/sub-district/32.17", 100, 0, 0.0, 555.7100000000002, 215, 1036, 465.5, 849.6, 919.2999999999994, 1035.2399999999996, 1.0082271334086141, 2.490202867902081, 0.6705104275891273], "isController": false}, {"data": ["api/cases", 100, 0, 0.0, 1595.4599999999996, 910, 3082, 1551.5, 2115.3, 2399.7999999999993, 3076.9699999999975, 0.9936900680677697, 203.35426681199382, 0.8355147935608883], "isController": false}, {"data": ["api/users/info", 100, 1, 1.0, 547.7799999999999, 208, 1796, 447.5, 856.5, 885.4999999999999, 1795.4799999999998, 1.0087153001936735, 1.719534512563549, 0.6570440480753712], "isController": false}, {"data": ["LOAD TEST ENDPOINT STAGING", 100, 1, 1.0, 7880.749999999997, 4647, 12332, 8035.0, 10655.4, 10948.85, 12329.929999999998, 0.9388437200743565, 911.8844742533846, 6.510477789304693], "isController": true}, {"data": ["api/login", 100, 0, 0.0, 1016.48, 523, 1882, 943.5, 1364.4, 1494.4999999999995, 1880.7499999999993, 1.0018433918409875, 1.8799826054941091, 0.705399497575539], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 1, 100.0, 0.1], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1000, 1, "500/Internal Server Error", 1, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["api/users/info", 100, 1, "500/Internal Server Error", 1, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
