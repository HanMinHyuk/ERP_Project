sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/odata/v2/ODataModel",
    "sap/ui/model/json/JSONModel",
    "sap/ui/comp/valuehelpdialog/ValueHelpDialog"
],
function (Controller, MessageToast, Filter, FilterOperator, ODataModel, JSONModel, ValueHelpDialog) {
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

            // 창 크기 조정 이벤트 핸들러 등록
            this.adjustTableRows();
            window.addEventListener("resize", this.adjustTableRows.bind(this));

        },

        adjustTableRows: function () {
            const oTable = this.getView().byId("headerlist");
            if (oTable) {
                // 화면 높이에서 사용할 수 있는 가용 높이 계산
                const iAvailableHeight = window.innerHeight - 300; // 상단/하단 여백 고려
                const iRowHeight = 38; // 각 행의 높이 (픽셀)
                const iVisibleRowCount = Math.floor(iAvailableHeight / iRowHeight); // 최소 3행
        
                // Table의 visibleRowCount 설정
                oTable.setVisibleRowCount(iVisibleRowCount);
            }
        },

        onValueHelpRequest: function() {
            var oInput = this.byId("IPlordco"); // 입력 필드
            var oValueHelpDialog = new ValueHelpDialog({
                title: "계획오더번호",
                supportMultiselect: false,
                key: "Plordco",
                descriptionKey: "Description",
                ok: function (oEvent) {
                    var aTokens = oEvent.getParameter("tokens");
                    if (aTokens.length > 0) {
                        oInput.setValue(aTokens[0].getKey());
                    }
                    oValueHelpDialog.close();
                },
                cancel: function () {
                    oValueHelpDialog.close();
                }
            });

            // OData 모델 가져오기
            var oModel = this.getView().getModel(); // 기본 ODataModel 사용
            oValueHelpDialog.setModel(oModel);      // ValueHelpDialog에 ODataModel 설정

            // Table 설정
            var oTable = oValueHelpDialog.getTable();
            oTable.setModel(oModel);
            oTable.bindRows("/PorderheaderSet");

            // 열 추가
            oTable.addColumn(new sap.ui.table.Column({
                label: new sap.m.Label({ text: "계획오더번호" }),
                template: new sap.m.Text({ text: "{Plordco}" }),
                sortProperty: "Plordco",
                filterProperty: "Plordco",
                class: "customToolbar"
            }));
            oTable.addColumn(new sap.ui.table.Column({
                label: new sap.m.Label({ text: "자재코드" }),
                template: new sap.m.Text({ text: "{Matnr}" }),
                sortProperty: "Matnr",
                filterProperty: "Matnr"
            }));
            oTable.addColumn(new sap.ui.table.Column({
                label: new sap.m.Label({ text: "자재명" }),
                template: new sap.m.Text({ text: "{Maktx}" }),
                sortProperty: "Maktx",
                filterProperty: "Maktx"
            }));

            // 다이얼로그 열기
            oValueHelpDialog.open();
        },

        statusIconColor: function(insst) {
            switch (insst) {
                case "01":
                    return "sap-icon://cart"; // 빨간색 아이콘
                case "02":
                    return "sap-icon://cart-3"; // 노란색 아이콘
                case "03":
                    return "sap-icon://cart-approval"; // 초록색 아이콘
                default:
                    return "sap-icon://cart-approval"; // 기본 아이콘
            }
        },

        statusIconColorCSS: function(insst) {
            switch (insst) {
                case "01":
                    return "#DF0101"; // 빨간색
                case "02":
                    return "#D7DF01"; // 노란색
                case "03":
                    return "#01DF01"; // 초록색
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

        },

        onOpenDialog : function(oEvent){
            var oButton  = oEvent.getSource();
            var oContext = oButton.getParent().getBindingContext();   
            var vPlordco   = oContext.getProperty('Plordco');          // 해당 코드를 통하여 ITEM의 키 필터인 aufnr의 값을 가져옴

            console.log(vPlordco); // 버튼이 클릭된 row의 aufnr 필드의 값이 찍히는지 확인 -> 추후에 배포 시 해당 코드 지우기

						// 팝업창
            if(!this.pDialog){
                this.pDialog = this.loadFragment({
                    name : "cl3.syncyoung.pp.porder.planorderlist.fragment.Dialog"   // 이건 namespace와 .frgment.xml 파일의 이름으로 설정
                });
            }
            
            this.pDialog.then(function(oDialog){
                var oTable = oDialog.getContent()[0];        // 다이얼로그에 보여줄 테이블 정보를 가져옴. 이 코드가 유효하려면 XML 파일에서 Dialog의 첫번째 자식이 Table이어야 함.

                if (oTable && oTable.isA("sap.ui.table.Table")) {
                    var oBinding = oTable.getBinding("rows");     // 선택한 행의 정보를 가져오고

                    // 필터 설정
                    var aFilter = [ new Filter("Plordco", FilterOperator.EQ, vPlordco )]  // 필터를 걸 필드명, 조회 조건, 특정값으로 필터를 추가
                    oBinding.filter(aFilter);                                         //해당 필터를 테이블에 바인딩
                }
                oDialog.open();                                                       // 다이얼로그 창 열기
            });   
        },

        onCloseDialog : function() {
            this.byId("itemDialog").close();    // 다이얼로그 창 닫기
        },

        onExit: function () {
            // 이벤트 리스너 제거
            window.removeEventListener("resize", this.adjustTableRows.bind(this));
        }


    });
});
