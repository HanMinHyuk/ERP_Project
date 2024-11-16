sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/json/JSONModel"
],
function (Controller, MessageToast, Filter, FilterOperator, ODataModel, JSONModel) {
    "use strict";

    return Controller.extend("cl3.syncyoung.pp.porder.planorderlist.controller.ListView", {
        onInit: function () {

            // 재고관리 Odata 가져온다.
            var oModel2 = new sap.ui.model.odata.v2.ODataModel("/sap/opu/odata/sap/ZC302MMCDS0003_CDS/"),
                self    = this;

            oModel2.read("/StockSet", {
                filters: [new sap.ui.model.Filter("scode", FilterOperator.EQ, "ST03")],
                success: function(oData) {
                    console.log("데이터 읽기 성공", oData);

                    // 필터링된 데이터를 JSON 모델로 설정
                    var oJSONModel = new sap.ui.model.json.JSONModel(oData.results);
                    self.getView().byId("MatcodeComboBox").setModel(oJSONModel, "filteredStock");
                },
                error: function(oError) {
                    console.log("오류 발생", oError);
                }
                
            });

        },

        statusIconColor: function(insst) {
            switch (insst) {
                case "01":
                    return "sap-icon://circle-task-2"; // 빨간색 아이콘
                case "02":
                    return "sap-icon://project-definition-triangle-2"; // 노란색 아이콘
                case "03":
                    return "sap-icon://color-fill"; // 초록색 아이콘
                default:
                    return "sap-icon://status-inactive"; // 기본 아이콘
            }
        },

        statusIconColorCSS: function(insst) {
            switch (insst) {
                case "01":
                    return "#FF0000"; // 빨간색
                case "02":
                    return "#FFFF00"; // 노란색
                case "03":
                    return "#00FF00"; // 초록색
                default:
                    return ""; // 기본
            }
        },

        onSearch: function() {

            let oTable   = this.getView().byId("headerlist"),
                oBinding = oTable.getBinding("rows"),    // rows 정보를 가져옴
                aFilter  = [],                           // aFilter = arrayFilter  -> 2. 이 배열에 넣는다.
                oFilter  = null;                         // oFilter = objectFilter -> 1. oFilter를 통해 WA 형태로 검색 조건을 Making해서


            var vPlordco = this.getView().byId("IPlordco").getValue(),
                vMatnr   = this.getView().byId("MatcodeComboBox").getValue();

            console.log(vMatnr);

            if (!vPlordco && !vMatnr) {
                MessageToast.show("계획오더번호 혹은 자재코드를 입력하세요.");
                exit;
            };
            
            /** 검색조건 Making */
            if (vPlordco != '') {

                // 생성자를 이용해서 검색조건을 Making 한다. (중괄호이기 때문에 Work Area로 Making 한다.)
                oFilter = new Filter({
                    path: "Plordco",
                    operator: FilterOperator.Contains,
                    value1: vPlordco
                });

                aFilter.push(oFilter); // aFilter에 담아준다.
                oFilter = null;        // oFilter 초기화

            };

            if (vMatnr != '') {

                oFilter = new Filter({
                    path: "Matnr",
                    operator: FilterOperator.EQ,
                    value1: vMatnr
                });

                aFilter.push(oFilter);
                oFilter = null;
                
            };

            oBinding.filter(aFilter); // Making한 검색 조건들을 Entityset에 날려준다.
            
        },

        onReset: function() {

            let oTable   = this.getView().byId("headerlist"),
                oBinding = oTable.getBinding("rows"),    // rows 정보를 가져옴
                aFilter  = [],                           // aFilter = arrayFilter  -> 2. 이 배열에 넣는다.
                oFilter  = null;                         // oFilter = objectFilter -> 1. oFilter를 통해 WA 형태로 검색 조건을 Making해서

            this.byId("IPlordco").setValue("");
            this.byId("MatcodeComboBox").setValue("");

            var vPlordco = this.getView().byId("IPlordco").getValue(),
                vMatnr   = this.getView().byId("MatcodeComboBox").getValue();

            /** 검색조건 Making */
            if (vPlordco != '') {

                // 생성자를 이용해서 검색조건을 Making 한다. (중괄호이기 때문에 Work Area로 Making 한다.)
                oFilter = new Filter({
                    path: "Plordco",
                    operator: FilterOperator.Contains,
                    value1: vPlordco
                });

                aFilter.push(oFilter); // aFilter에 담아준다.
                oFilter = null;        // oFilter 초기화

            };

            if (vMatnr != '') {

                oFilter = new Filter({
                    path: "Matnr",
                    operator: FilterOperator.EQ,
                    value1: vMatnr
                });

                aFilter.push(oFilter);
                oFilter = null;
                
            };

            oBinding.filter(aFilter); // Making한 검색 조건들을 Entityset에 날려준다.

        }


    });
});
