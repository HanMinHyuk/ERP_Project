sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
],
function (Controller, JSONModel) {
    "use strict";

    return Controller.extend("cl3.syncyoung.pp.pureq.purreqapproval.controller.ApprovalView", {
        onInit: function () {

            // OData 모델 가져오기
            var oModel = this.getView().getModel();

            // rstatus에 따라 개수 계산
            oModel.read("/PureqheaderSet", {
                success: function (oData) {
                    var aProducts = oData.results;

                    // rstatus별 개수 계산
                    var iTotal = aProducts.length;
                    var iRstatus1Count = aProducts.filter(function (item) {
                        return item.rstatus === "A";
                    }).length;
                    var iRstatus2Count = aProducts.filter(function (item) {
                        return item.rstatus === "B";
                    }).length;
                    var iRstatus3Count = aProducts.filter(function (item) {
                        return item.rstatus === "C";
                    }).length;
                    var iRstatus4Count = aProducts.filter(function (item) {
                        return item.rstatus === "";
                    }).length;

                    // 결과를 JSON 모델로 설정
                    var oCountModel = new sap.ui.model.json.JSONModel({
                        Total: iTotal,
                        Rstatus1: iRstatus1Count,
                        Rstatus2: iRstatus2Count,
                        Rstatus3: iRstatus3Count,
                        Rstatus4: iRstatus4Count
                    });
                    this.getView().setModel(oCountModel, "counts");
                }.bind(this),
                error: function (oError) {
                    console.error("Error reading data:", oError);
                }
            });

        },

        onAfterRendering: function () {
            console.log("onAfterRendering 호출됨");
            
            var oPanel = this.byId("myPanel");
            if (oPanel) {
                var iAvailableHeight = window.innerHeight - oPanel.$().offset().top - 20; // 20은 여백
                console.log(iAvailableHeight);
                oPanel.$().css("height", iAvailableHeight + "px");
            }
        },

        statusIconColor: function(rstatus) {
            switch (rstatus) {
                case "A": // 승인
                    return "sap-icon://message-success";
                case "B": // 반려
                    return "sap-icon://message-error"; 
                case "C": // 구매발주완료
                    return "sap-icon://play"; 
                default:  // 대기
                    return "sap-icon://message-information";
            }
        },

        statusIconColorCSS: function(rstatus) {
            switch (rstatus) {
                case "A":
                    return "#01DF01"; // 초록색
                case "B":
                    return "#DF0101"; // 빨간색
                case "C":
                    return "#0101DF"; // 파란색
                default:
                    return "#D7DF01"; // 노란색
            }
        },

        _onResize: function (oEvent) {
            console.log("ResizeHandler triggered:", oEvent);
            // 화면 새로고침
            location.reload(); // 페이지 새로고침
        },

        onFilterSelect: function (oEvent) {

            let oTable   = this.getView().byId("headerlist"),
                oBinding = oTable.getBinding("rows"),    // rows 정보를 가져옴
                sKey     = oEvent.getParameter("key"),
                aFilter  = [],                           // aFilter = arrayFilter  -> 2. 이 배열에 넣는다.
                oFilter  = null;

			if (sKey === "Approve") {
				oFilter = new Filter({
                    path: "Rstatus",
                    operator: FilterOperator.EQ,
                    value1: "A"
                });
			} else if (sKey === "Companion") {
				oFilter = new Filter({
                    path: "Rstatus",
                    operator: FilterOperator.EQ,
                    value1: "B"
                });
			} else if (sKey === "Complete") {
				oFilter = new Filter({
                    path: "Rstatus",
                    operator: FilterOperator.EQ,
                    value1: "C"
                });
			} else if (sKey === "Wait") {
                oFilter = new Filter({
                    path: "Rstatus",
                    operator: FilterOperator.EQ,
                    value1: ""
                })
            }

			aFilter.push(oFilter); // aFilter에 담아준다.
            oFilter = null;        // oFilter 초기화
		}

    });
});
