/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"cl3syncyoungpppureq/pur_req_approval/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
