sap.ui.define([], function () {
    "use strict";
    return {
        statusIconColor: function (insst) {
            switch (insst) {
                case "01":
                    return "sap-icon://status-negative"; // 빨간색 아이콘
                case "02":
                    return "sap-icon://status-critical"; // 노란색 아이콘
                case "03":
                    return "sap-icon://status-positive"; // 초록색 아이콘
                default:
                    return "sap-icon://status-inactive"; // 기본 아이콘
            }
        },
        statusIconColorCSS: function (insst) {
            switch (insst) {
                case "01":
                    return "Error"; // 빨간색
                case "02":
                    return "Warning"; // 노란색
                case "03":
                    return "Success"; // 초록색
                default:
                    return "None"; // 기본
            }
        }
    };
});