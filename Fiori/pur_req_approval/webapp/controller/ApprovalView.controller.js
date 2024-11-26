sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
],
function (Controller, MessageToast, JSONModel, Filter, FilterOperator) {
    "use strict";

    let self = null;

    return Controller.extend("cl3.syncyoung.pp.pureq.purreqapproval.controller.ApprovalView", {
        onInit: function () {

            self = this;

            /* OData 모델 가져오기 */
            var oModel = this.getOwnerComponent().getModel();
            // rstatus에 따라 개수 계산
            oModel.read("/PureqheaderSet", {
                success: function (oData) {
                    var aProducts = oData.results;

                    // rstatus별 개수 계산
                    var iTotal = aProducts.length;
                    var iRstatus1Count = aProducts.filter(function (item) {
                        return item.Rstatus === "A";
                    }).length;
                    var iRstatus2Count = aProducts.filter(function (item) {
                        return item.Rstatus === "B";
                    }).length;
                    var iRstatus3Count = aProducts.filter(function (item) {
                        return item.Rstatus === "C";
                    }).length;
                    var iRstatus4Count = aProducts.filter(function (item) {
                        return item.Rstatus === "";
                    }).length;

                    console.log(iTotal);
                    console.log(iRstatus1Count);

                    // 결과를 JSON 모델로 설정
                    var oCountModel = new JSONModel({
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

            /* 아이콘에 따라 검색창과 버튼의 유무를 표시하기 위한 초기 작업 */
            var oViewModel = new JSONModel({
                isVisible: true, // 초기값: true (All 탭)
                isVisible2: false,
                isSelectionMode: "Single"
            });
            this.getView().setModel(oViewModel, "viewModel");

            /* 자동으로 테이블의 높이 변경 */
            // 창 크기 변경 이벤트 핸들러 추가
            sap.ui.core.ResizeHandler.register(this.getView().byId("headerlist"), this.onResizeTable);
            // 기본 초기화
            this.adjustTableRows();
            

        },

        // 창 크기 변경 시 호출되는 함수
        onResizeTable: function () {
            self.adjustTableRows();
        },

        adjustTableRows: function () {
            var oTable = this.getView().byId("headerlist");
            if (oTable) {
                // 창 높이에 따라 테이블 높이 계산
                var iAvailableHeight = window.innerHeight - 280; // 상단과 하단 여백을 제외한 높이
                var iRowHeight = 35; // 테이블의 행 높이(픽셀)
                var iVisibleRowCount = Math.floor(iAvailableHeight / iRowHeight); // 표시할 수 있는 행 수 계산

                oTable.setVisibleRowCount(iVisibleRowCount);
            }
        },

        onUpdateCounts: function () {
            var oModel = this.getView().getModel(); // OData 모델
        
            // OData 데이터를 다시 읽어와 개수를 계산
            oModel.read("/PureqheaderSet", {
                success: function (oData) {
                    var aProducts = oData.results;
        
                    // Rstatus별 개수 계산
                    var iTotal = aProducts.length;
                    var iRstatus1Count = aProducts.filter(function (item) {
                        return item.Rstatus === "A";
                    }).length;
                    var iRstatus2Count = aProducts.filter(function (item) {
                        return item.Rstatus === "B";
                    }).length;
                    var iRstatus3Count = aProducts.filter(function (item) {
                        return item.Rstatus === "C";
                    }).length;
                    var iRstatus4Count = aProducts.filter(function (item) {
                        return item.Rstatus === "";
                    }).length;
        
                    // 개수를 JSON 모델로 업데이트
                    var oCountModel = this.getView().getModel("counts");
                    oCountModel.setProperty("/Total", iTotal);
                    oCountModel.setProperty("/Rstatus1", iRstatus1Count);
                    oCountModel.setProperty("/Rstatus2", iRstatus2Count);
                    oCountModel.setProperty("/Rstatus3", iRstatus3Count);
                    oCountModel.setProperty("/Rstatus4", iRstatus4Count);
                }.bind(this),
                error: function (oError) {
                    console.error("Error reading data:", oError);
                }
            });
        },

        // 상태에 따라 Icon이 Setting 된다.
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

        // 상태에 따라 Icon의 Color가 Setting 된다.
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

        // 큰 아이콘을 눌렀을 때 그에 따른 데이터를 Table에서 보여준다.
        onFilterSelect: function(oEvent) {

            let oTable   = this.getView().byId("headerlist"),
                oBinding = oTable.getBinding("rows"),    // rows 정보를 가져옴
                sKey     = oEvent.getParameter("key"),
                aFilter  = [],                           // aFilter = arrayFilter  -> 2. 이 배열에 넣는다.
                oFilter  = null,
                oViewModel = this.getView().getModel("viewModel");

            oViewModel.setProperty("/isVisible", false); // 다른 탭일 때 숨기기
            oViewModel.setProperty("/isVisible2", false); // 다른 탭일 때 숨기기
            oViewModel.setProperty("/isSelectionMode", "Single"); // 다른 탭일 때 선택 못하게 만들기
            
			if (sKey === "Approve") {
				oFilter = new Filter({
                    path: "Rstatus",
                    operator: FilterOperator.EQ,
                    value1: "A"
                });
			} else if (sKey === "Companion") {
				oFilter = new Filter({
                    path: "Rstatus",
                    operator: FilterOperator.Contains,
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
                oViewModel.setProperty("/isVisible2", true); // 다른 탭일 때 숨기기
                oViewModel.setProperty("/isSelectionMode", "MultiToggle"); // Wait 탭일 때 선택 못하게 만들기
            } else {
                oViewModel.setProperty("/isVisible", true); // All 탭일 때 보이기
            }

			if (sKey !== "All") {
                aFilter.push(oFilter);
                oFilter = null;        // oFilter 초기화
            }

            oBinding.filter(aFilter);
		},

        // 구매요청 Header에 대한 Item 데이터들을 팝업으로 띄운다.
        onOpenDialog : function(oEvent){
            var oButton  = oEvent.getSource();
            var oContext = oButton.getParent().getBindingContext();   
            var vBanfn   = oContext.getProperty('Banfn');          // 해당 코드를 통하여 ITEM의 키 필터인 aufnr의 값을 가져옴

            console.log(vBanfn); // 버튼이 클릭된 row의 aufnr 필드의 값이 찍히는지 확인 -> 추후에 배포 시 해당 코드 지우기

            // 팝업창
            if(!this.pDialog){
                this.pDialog = this.loadFragment({
                    name : "cl3.syncyoung.pp.pureq.purreqapproval.fragment.Dialog"   // 이건 namespace와 .frgment.xml 파일의 이름으로 설정
                });
                console.log("hey");
            }

            this.pDialog.then(function(oDialog){
                var oTable2 = oDialog.getContent()[0];        // 다이얼로그에 보여줄 테이블 정보를 가져옴. 이 코드가 유효하려면 XML 파일에서 Dialog의 첫번째 자식이 Table이어야 함.

                if (oTable2 && oTable2.isA("sap.ui.table.Table")) {
                    var oBinding = oTable2.getBinding("rows");     // 선택한 행의 정보를 가져오고

                    // 필터 설정
                    var aFilter = [ new Filter("Banfn", FilterOperator.EQ, vBanfn )]  // 필터를 걸 필드명, 조회 조건, 특정값으로 필터를 추가
                    oBinding.filter(aFilter);                                         // 해당 필터를 테이블에 바인딩
                }
                
                oDialog.open();                                                       // 다이얼로그 창 열기
            });   
        },

        // 팝업창을 닫는다.
        onCloseDialog : function() {
            this.byId("itemDialog").close();    // 다이얼로그 창 닫기
        },

        // 조회 조건인데 Flexible하게 검색한다.
        onFilter: function(oEvent) {
			this.sSearchQuery = oEvent.getSource().getValue();
			this.fnApplyFiltersAndOrdering();
		},
        fnApplyFiltersAndOrdering: function(oEvent) {
			var aFilters = [],
				aSorters = [];

			// if (this.bGrouped) {
			// 	aSorters.push(new Sorter("SupplierName", this.bDescending, this._fnGroup));
			// } else {
			// 	aSorters.push(new Sorter("Name", this.bDescending));
			// }

			if (this.sSearchQuery) {
				var oFilter = new Filter("Matnr", FilterOperator.Contains, this.sSearchQuery);
				aFilters.push(oFilter);
			}

			this.byId("headerlist").getBinding("rows").filter(aFilters);
		},

        // 정보 버튼
        onInfoConfirm: function() {
            // 팝업 Dialog 생성
            var oDialog = new sap.m.Dialog({
                title: "정보",
                type: "Message",
                content: new sap.m.Text({ text: "Wait 아이콘을 누를 시 승인 및 반려가 가능합니다." }),
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

        // 승인 버튼
        onApproveConfirm: function () {
            var oTable = this.byId("headerlist"), // 테이블 ID
                aSelectedIndices = oTable.getSelectedIndices(); // 선택된 행의 인덱스

            console.log(aSelectedIndices);

            if (aSelectedIndices.length === 0) {
                MessageToast.show("행을 선택하세요.");
                return;
            }

            // 팝업 Dialog 생성
            var oDialog = new sap.m.Dialog({
                title: "확인",
                type: "Message",
                content: new sap.m.Text({ text: "승인하시겠습니까?" }),
                beginButton: new sap.m.Button({
                    text: "예",
                    type: "Accept",
                    press: function () {
                        this.onApprove(); // 승인 작업 수행
                        oDialog.close(); // 팝업 닫기
                        MessageToast.show("구매요청을 승인하였습니다.")
                    }.bind(this)
                }),
                endButton: new sap.m.Button({
                    text: "아니오",
                    type: "Reject",
                    press: function () {
                        oDialog.close(); // 팝업 닫기
                    }
                }),
                afterClose: function () {
                    oDialog.destroy(); // 팝업 메모리 해제
                }
            });
        
            oDialog.open(); // 팝업 표시
        },
        onApprove: function() {
            var oTable = this.byId("headerlist"), // 테이블 ID
                aSelectedIndices = oTable.getSelectedIndices(), // 선택된 행의 인덱스
                oModel = this.getView().getModel(), // OData 모델
                aSelectedData = []; // 선택된 데이터를 저장할 배열

            // 선택된 데이터 가져오기
            aSelectedIndices.forEach(function (iIndex) {
                var oContext = oTable.getContextByIndex(iIndex);
                if (oContext) {
                    var oData = oContext.getObject();
                    aSelectedData.push(oData);
                }
            });

            if (aSelectedData.length === 0) {
                sap.m.MessageToast.show("선택된 행이 없습니다.");
                return;
            }

            // console.log(aSelectedData[0]);
            // return;

            // Rstatus 업데이트 및 OData 호출
            aSelectedData.forEach(function (oItem) {
                oItem.Rstatus = "A"; // Rstatus를 'A'로 변경
                var sPath = oModel.createKey("/PureqheaderSet", { Banfn: oItem.Banfn }); // 키를 생성
                oModel.update(sPath, oItem, {
                    method: 'MERGE',
                    success: function () {
                        self.onUpdateCounts();
                        oModel.refresh();
                        console.log("PureqheaderSet 업데이트 성공(승인)");
                    },
                    error: function (oError) {
                        console.error("PureqheaderSet 업데이트 실패(승인):", oError);
                        MessageToast.show("승인 중 오류가 발생했습니다.");
                    }
                });
            });
        },

        // 반려 버튼
        onRejectConfirm: function () {
            var oTable = this.byId("headerlist"), // 테이블 ID
                aSelectedIndices = oTable.getSelectedIndices(); // 선택된 행의 인덱스

            console.log(aSelectedIndices);

            if (aSelectedIndices.length === 0) {
                MessageToast.show("행을 선택하세요.");
                return;
            }

            // 팝업 Dialog 생성
            var oDialog = new sap.m.Dialog({
                title: "확인",
                type: "Message",
                content: new sap.m.Text({ text: "반려하시겠습니까?" }),
                beginButton: new sap.m.Button({
                    text: "예",
                    type: "Accept",
                    press: function () {
                        this.onReject(); // 승인 작업 수행
                        oDialog.close(); // 팝업 닫기
                    }.bind(this)
                }),
                endButton: new sap.m.Button({
                    text: "아니오",
                    type: "Reject",
                    press: function () {
                        oDialog.close(); // 팝업 닫기
                    }
                }),
                afterClose: function () {
                    oDialog.destroy(); // 팝업 메모리 해제
                }
            });
        
            oDialog.open(); // 팝업 표시
        },
        onReject: function() {

            var oTable = this.byId("headerlist"),
                aSelectedIndices = oTable.getSelectedIndices(),
                oModel = this.getView().getModel();

            if (aSelectedIndices.length === 0) {
                sap.m.MessageToast.show("행을 선택하세요.");
                return;
            }

            // 반려사유 입력 팝업 생성
            var oDialog = new sap.m.Dialog({
                title: "반려사유 입력",
                type: "Message",
                content: new sap.m.TextArea({
                    id: "reasonInput",
                    placeholder: "반려 사유를 입력하세요.",
                    width: "100%",
                    rows: 4
                }),
                beginButton: new sap.m.Button({
                    text: "확인",
                    press: function () {
                        var sReason = sap.ui.getCore().byId("reasonInput").getValue();
                        if (!sReason.trim()) {
                            sap.m.MessageToast.show("반려 사유를 입력해주세요.");
                            return;
                        }

                        // 선택된 행 처리
                        aSelectedIndices.forEach(function (iIndex) {
                            var oContext = oTable.getContextByIndex(iIndex);
                            if (oContext) {
                                var oData = oContext.getObject();

                                // 1. PureqitemSet 업데이트
                                oModel.read("/PureqitemSet", {
                                    filters: [new sap.ui.model.Filter("Banfn", sap.ui.model.FilterOperator.EQ, oData.Banfn)],
                                    success: function (oResult) {
                                        if (oResult && oResult.results.length > 0) {
                                            console.log("oResult:", oResult);

                                            // 순차적으로 업데이트 실행
                                            const updateSequentially = async () => {
                                                for (const item of oResult.results) {
                                                    item.Remark = sReason; // 반려 사유 추가
                                                    const sItemPath = oModel.createKey("/PureqitemSet", {
                                                        Matnr: item.Matnr,
                                                        Banfn: item.Banfn,
                                                        Plordco: item.Plordco
                                                    });

                                                    await new Promise((resolve, reject) => {
                                                        oModel.update(sItemPath, item, {
                                                            success: function () {
                                                                console.log("PureqitemSet 업데이트 성공(반려)");
                                                                resolve();
                                                            },
                                                            error: function (oError) {
                                                                console.error("PureqitemSet 업데이트 실패(반려):", oError);
                                                                reject(oError);
                                                            }
                                                        });
                                                    });
                                                }

                                                // 2. PureqheaderSet 업데이트
                                                oData.Rstatus = "B"; // Rstatus 업데이트
                                                const sHeaderPath = oModel.createKey("/PureqheaderSet", { Banfn: oData.Banfn });
                                                oModel.update(sHeaderPath, oData, {
                                                    success: function () {
                                                        sap.m.MessageToast.show("구매요청을 반려하였습니다.");
                                                        self.onUpdateCounts();
                                                        oModel.refresh();
                                                        console.log("PureqheaderSet 업데이트 성공(반려)");
                                                    },
                                                    error: function (oError) {
                                                        console.error("PureqheaderSet 업데이트 실패(반려):", oError);
                                                    }
                                                });
                                            };

                                            // 순차 업데이트 실행
                                            updateSequentially().catch(function (error) {
                                                console.error("순차 업데이트 중 오류 발생:", error);
                                                sap.m.MessageToast.show("반려 중 오류가 발생했습니다.");
                                            });
                                        }
                                    },
                                    error: function (oError) {
                                        console.error("PureqitemSet 읽기 실패:", oError);
                                    }
                                });
                            }
                        });

                        oDialog.close(); // 다이얼로그 닫기
                    }
                }),
                endButton: new sap.m.Button({
                    text: "취소",
                    press: function () {
                        oDialog.close(); // 다이얼로그 닫기
                    }
                }),
                afterClose: function () {
                    oDialog.destroy(); // 메모리 해제
                }
            });

            oDialog.open(); // 다이얼로그 열기
                    
        },

        onExit: function () {
            sap.ui.core.ResizeHandler.deregister(this.getView().byId("headerlist"));
        }

    });
});
