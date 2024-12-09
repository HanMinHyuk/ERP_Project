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
                const iAvailableHeight = window.innerHeight - 350; // 상단/하단 여백 고려
                console.log(window.innerHeight);
                const iRowHeight = 40; // 각 행의 높이 (픽셀)
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
                label: new sap.m.Label({ text: "계획오더번호" }).addStyleClass("highlight-column"),
                template: new sap.m.Text({ text: "{Plordco}" }).addStyleClass("highlight-column"),
                sortProperty: "Plordco",
                filterProperty: "Plordco"
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

        onOpenDialog : function(oEvent) {

            // 버튼 누른 Record의 계획오더번호를 가져오기 위한 기초 작업
            var oButton  = oEvent.getSource(),
                oContext = oButton.getParent().getBindingContext(),
                vPlordco = oContext.getProperty('Plordco');         // 계획오더번호를 가져와서 vPlordco 변수에 넣는다.

            // 팝업창 생성
            let oDialog = new sap.m.Dialog(
                {
                    title : "총 매출액",
                    contentWidth: "auto",
                    contentHeight: "auto",
                    resizable: true,
                    draggable: true,
                    endButton: new sap.m.Button
                    (
                        {
                            text: "닫기",
                            press: function () {
                                oDialog.close();
                            }.bind(this)
                        }
                    )
                }
            );

            // 테이블 생성
            var oTable = new sap.ui.table.Table({
                selectionMode: "None",
                columns: [
                    new sap.ui.table.Column({
                        label: new sap.m.Label({ text: "계획오더번호" }),
                        template: new sap.m.Text({ text: "{Plordco}" })
                    }),
                    new sap.ui.table.Column({
                        label: new sap.m.Label({ text: "BOM_ID" }),
                        template: new sap.m.Text({ text: "{Bomid}" })
                    }),
                    new sap.ui.table.Column({
                        label: new sap.m.Label({ text: "자재코드" }),
                        template: new sap.m.Text({ text: "{Matnr}" })
                    }),
                    new sap.ui.table.Column({
                        label: new sap.m.Label({ text: "자재명" }),
                        template: new sap.m.Text({ text: "{Maktx}" })
                    }),
                    new sap.ui.table.Column({
                        label: new sap.m.Label({ text: "현재재고" }),
                        template: new sap.m.Text({ text: "{= parseFloat(parseFloat(${HRtptqua}).toFixed(2))} {Unit}" })
                    }),
                    new sap.ui.table.Column({
                        label: new sap.m.Label({ text: "계획수량" }),
                        template: new sap.m.Text({ text: "{= parseFloat(parseFloat(${Pqua}).toFixed(2))} {Unit}" })
                    }),
                    new sap.ui.table.Column({
                        label: new sap.m.Label({ text: "필요소요량" }),
                        template: new sap.m.Text({ text: "{= parseFloat(parseFloat(${Rqamt}).toFixed(2))} {Unit}" })
                    }),
                    new sap.ui.table.Column({
                        label: new sap.m.Label({ text: "구매요청일" }),
                        template: new sap.m.Text({ text: {
                                                   path: 'Matod',
                                                   type: 'sap.ui.model.type.Date',
                                                   formatOptions: {
                                                       style: 'long',
                                                       source: {
                                                           pattern: 'yyyy/MM/dd'
                                                       }
                                                   }
                        } })
                    }),
                    new sap.ui.table.Column({
                        label: new sap.m.Label({ text: "공정시작일" }),
                        template: new sap.m.Text({ text: {
                                                   path: 'Ppstr',
                                                   type: 'sap.ui.model.type.Date',
                                                   formatOptions: {
                                                       style: 'long',
                                                       source: {
                                                           pattern: 'yyyy/MM/dd'
                                                       }
                                                    }
                        } })
                    })
                ]
            });

            // EntitySet 설정 (filter 포함)
            oTable.bindRows({
                path: "/PorderitemSet",
                filters: [new Filter("Plordco", FilterOperator.EQ, vPlordco )] // 필터 적용
            });

            // 설정된 테이블을 팝업창에 넣고 View에 보내고 팝업창을 띄운다.
            oDialog.addContent(oTable);
            this.getView().addDependent(oDialog);
            oDialog.open();

        },

        onInfoConfirm: function() {
            // 팝업 Dialog 생성
            var oDialog = new sap.m.Dialog({
                title: "정보",
                type: "Message",
                content: new sap.m.Text({ text: "\n● 계획오더번호 및 자재코드 입력 후 조회 버튼을 클릭하여 조회 가능합니다.\n\n" +
                                                "● 계획오더번호 버튼 클릭 시 계획오더번호에 대한 상세 정보가 조회 됩니다.\n　" }),
                beginButton: new sap.m.Button({
                    text: "닫기",
                    type: "Accept",
                    press: function () {
                        oDialog.close(); // 팝업 닫기
                    }.bind(this)
                }),
                afterClose: function () {
                    oDialog.destroy(); // 팝업 메모리 해제
                }
            });
        
            oDialog.open(); // 팝업 표시
        },

        onExit: function () {
            // 이벤트 리스너 제거
            window.removeEventListener("resize", this.adjustTableRows.bind(this));
        }


    });
});
